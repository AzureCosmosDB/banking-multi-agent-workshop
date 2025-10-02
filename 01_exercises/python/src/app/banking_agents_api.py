import os
import uuid
import fastapi

from dotenv import load_dotenv

from datetime import datetime
from enum import IntEnum
from fastapi import BackgroundTasks
from azure.monitor.opentelemetry import configure_azure_monitor

from azure.cosmos.exceptions import CosmosHttpResponseError

from fastapi import Depends, HTTPException, Body
from langchain_core.messages import HumanMessage, ToolMessage
from pydantic import BaseModel
from typing import List, Dict, Optional
from src.app.services.azure_open_ai import model
from langgraph_checkpoint_cosmosdb import CosmosDBSaver
from langgraph.graph.state import CompiledStateGraph
from starlette.middleware.cors import CORSMiddleware
from src.app.services.azure_cosmos_db import update_chat_container, patch_active_agent, \
    fetch_chat_container_by_tenant_and_user, \
    fetch_chat_container_by_session, delete_userdata_item, debug_container, update_users_container, \
    update_account_container, update_offers_container, store_chat_history, update_active_agent_in_latest_message, \
    chat_container, fetch_chat_history_by_session, delete_chat_history_by_session, \
    fetch_accounts_by_user, fetch_transactions_by_account_id, fetch_service_requests_by_tenant
import logging

# Setup logging
logging.basicConfig(level=logging.ERROR)

load_dotenv(override=False)

configure_azure_monitor()

endpointTitle = "ChatEndpoints"
dataLoadTitle = "DataLoadEndpoints"

# Mapping for agent function names to standardized names
agent_mapping = {
    "coordinator_agent": "Coordinator",
    "customer_support_agent": "CustomerSupport",
    "transactions_agent": "Transactions",
    "sales_agent": "Sales"
}

app = fastapi.FastAPI(title="Cosmos DB Multi-Agent Banking API", openapi_url="/cosmos-multi-agent-api.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Banking data models based on Swagger schema
class AccountType(IntEnum):
    CHECKING = 0
    SAVINGS = 1
    CREDIT = 2


class AccountStatus(IntEnum):
    ACTIVE = 0
    INACTIVE = 1
    SUSPENDED = 2
    CLOSED = 3
    PENDING = 4
    FROZEN = 5
    OVERDRAFT = 6
    LIMITED = 7


class CardType(IntEnum):
    DEBIT = 0
    CREDIT = 1
    PREPAID = 2
    CORPORATE = 3
    VIRTUAL = 4
    REWARDS = 5
    STUDENT = 6
    BUSINESS = 7
    PREMIUM = 8


class ServiceRequestType(IntEnum):
    COMPLAINT = 0
    FUND_TRANSFER = 1
    FULFILMENT = 2
    TELE_BANKER_CALLBACK = 3


class BankAccount(BaseModel):
    id: str
    tenantId: str
    name: str
    accountType: AccountType
    cardNumber: Optional[int] = None
    accountStatus: Optional[AccountStatus] = None
    cardType: Optional[CardType] = None
    balance: Optional[int] = None
    limit: Optional[int] = None
    interestRate: Optional[int] = None
    shortDescription: str


class BankTransaction(BaseModel):
    id: str
    tenantId: str
    accountId: str
    debitAmount: int
    creditAmount: int
    accountBalance: int
    details: str
    transactionDateTime: datetime


class ServiceRequest(BaseModel):
    id: Optional[str] = None
    tenantId: Optional[str] = None
    userId: Optional[str] = None
    type: Optional[str] = None
    requestedOn: Optional[datetime] = None
    scheduledDateTime: Optional[datetime] = None
    accountId: Optional[str] = None
    srType: Optional[ServiceRequestType] = None
    recipientEmail: Optional[str] = None
    recipientPhone: Optional[str] = None
    debitAmount: Optional[float] = None
    isComplete: bool = False
    requestAnnotations: Optional[List[str]] = None
    fulfilmentDetails: Optional[Dict[str, str]] = None


class DebugLog(BaseModel):
    id: str
    sessionId: str
    tenantId: str
    userId: str
    details: str


class Session(BaseModel):
    id: str
    type: str = "session"
    sessionId: str
    tenantId: str
    userId: str
    tokensUsed: int = 0
    name: str
    messages: List


class MessageModel(BaseModel):
    id: str
    type: str
    sessionId: str
    tenantId: str
    userId: str
    timeStamp: str
    sender: str
    senderRole: str
    text: str
    debugLogId: str
    tokensUsed: int
    rating: bool
    completionPromptId: str


class DebugLog(BaseModel):
    id: str
    messageId: str
    type: str
    sessionId: str
    tenantId: str
    userId: str
    timeStamp: str
    propertyBag: list


def store_debug_log(sessionId, tenantId, userId, response_data):
    """Stores detailed debug log information in Cosmos DB."""
    debug_log_id = str(uuid.uuid4())
    message_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    # Extract relevant debug details
    agent_selected = "Unknown"
    previous_agent = "Unknown"
    finish_reason = "Unknown"
    model_name = "Unknown"
    system_fingerprint = "Unknown"
    input_tokens = 0
    output_tokens = 0
    total_tokens = 0
    cached_tokens = 0
    transfer_success = False
    tool_calls = []
    logprobs = None
    content_filter_results = {}

    for entry in response_data:
        for agent, details in entry.items():
            if "messages" in details:
                for msg in details["messages"]:
                    if hasattr(msg, "response_metadata"):
                        metadata = msg.response_metadata
                        finish_reason = metadata.get("finish_reason", finish_reason)
                        model_name = metadata.get("model_name", model_name)
                        system_fingerprint = metadata.get("system_fingerprint", system_fingerprint)
                        input_tokens = metadata.get("token_usage", {}).get("prompt_tokens", input_tokens)
                        output_tokens = metadata.get("token_usage", {}).get("completion_tokens", output_tokens)
                        total_tokens = metadata.get("token_usage", {}).get("total_tokens", total_tokens)
                        cached_tokens = metadata.get("token_usage", {}).get("prompt_tokens_details", {}).get(
                            "cached_tokens", cached_tokens)
                        logprobs = metadata.get("logprobs", logprobs)
                        content_filter_results = metadata.get("content_filter_results", content_filter_results)

                        if "tool_calls" in msg.additional_kwargs:
                            tool_calls.extend(msg.additional_kwargs["tool_calls"])
                            transfer_success = any(
                                call.get("name", "").startswith("transfer_to_") for call in tool_calls)
                            previous_agent = agent_selected
                            agent_selected = tool_calls[-1].get("name", "").replace("transfer_to_",
                                                                                    "") if tool_calls else agent_selected

    property_bag = [
        {"key": "agent_selected", "value": agent_selected, "timeStamp": timestamp},
        {"key": "previous_agent", "value": previous_agent, "timeStamp": timestamp},
        {"key": "finish_reason", "value": finish_reason, "timeStamp": timestamp},
        {"key": "model_name", "value": model_name, "timeStamp": timestamp},
        {"key": "system_fingerprint", "value": system_fingerprint, "timeStamp": timestamp},
        {"key": "input_tokens", "value": input_tokens, "timeStamp": timestamp},
        {"key": "output_tokens", "value": output_tokens, "timeStamp": timestamp},
        {"key": "total_tokens", "value": total_tokens, "timeStamp": timestamp},
        {"key": "cached_tokens", "value": cached_tokens, "timeStamp": timestamp},
        {"key": "transfer_success", "value": transfer_success, "timeStamp": timestamp},
        {"key": "tool_calls", "value": str(tool_calls), "timeStamp": timestamp},
        {"key": "logprobs", "value": str(logprobs), "timeStamp": timestamp},
        {"key": "content_filter_results", "value": str(content_filter_results), "timeStamp": timestamp}
    ]

    debug_entry = {
        "id": debug_log_id,
        "messageId": message_id,
        "type": "debug_log",
        "sessionId": sessionId,
        "tenantId": tenantId,
        "userId": userId,
        "timeStamp": timestamp,
        "propertyBag": property_bag
    }

    debug_container.create_item(debug_entry)
    return debug_log_id


def create_thread(tenantId: str, userId: str):
    sessionId = str(uuid.uuid4())
    name = userId
    age = 30
    address = "123 Main St"
    activeAgent = "unknown"
    ChatName = "New Chat"
    messages = []
    update_chat_container({
        "id": sessionId,
        "tenantId": tenantId,
        "userId": userId,
        "sessionId": sessionId,
        "name": name,
        "age": age,
        "address": address,
        "activeAgent": activeAgent,
        "ChatName": ChatName,
        "messages": messages
    })
    return Session(id=sessionId, sessionId=sessionId, tenantId=tenantId, userId=userId, name=name, age=age,
                   address=address, activeAgent=activeAgent, ChatName=ChatName, messages=messages)


@app.get("/status", tags=[endpointTitle], description="Gets the service status", operation_id="GetServiceStatus",
         response_description="Success",
         response_model=str)
def get_service_status():
    return "CosmosDBService: initializing"


@app.get("/tenant/{tenantId}/user/{userId}/sessions",
         description="Retrieves sessions from the given tenantId and userId", tags=[endpointTitle],
         response_model=List[Session])
def get_chat_sessions(tenantId: str, userId: str):
    items = fetch_chat_container_by_tenant_and_user(tenantId, userId)
    sessions = []

    for item in items:
        sessionId = item["sessionId"]
        messages = fetch_chat_history_by_session(sessionId)

        session = {
            "id": sessionId,
            "type": "Session",
            "sessionId": sessionId,
            "tenantId": item["tenantId"],
            "userId": item["userId"],
            "tokensUsed": item.get("tokensUsed", 0),
            "name": item.get("ChatName", "New Chat"),
            "messages": messages
        }
        sessions.append(session)

    return sessions


@app.get("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/messages",
         description="Retrieves messages from the sessionId", tags=[endpointTitle], response_model=List[MessageModel])
def get_chat_session(tenantId: str, userId: str, sessionId: str):
    return fetch_chat_history_by_session(sessionId)


# to be implemented
@app.post("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/message/{messageId}/rate",
          description="Not yet implemented", tags=[endpointTitle],
          operation_id="RateMessage", response_description="Success", response_model=MessageModel)
def rate_message(tenantId: str, userId: str, sessionId: str, messageId: str, rating: bool):
    return {
        "id": messageId,
        "type": "ai_response",
        "sessionId": sessionId,
        "tenantId": tenantId,
        "userId": userId,
        "timeStamp": "2023-01-01T00:00:00Z",
        "sender": "assistant",
        "senderRole": "agent",
        "text": "This is a rated message",
        "debugLogId": str(uuid.uuid4()),
        "tokensUsed": 0,
        "rating": rating,
        "completionPromptId": ""
    }


@app.get("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/completiondetails/{debuglogId}",
         description="Retrieves debug information for chat completions", tags=[endpointTitle],
         operation_id="GetChatCompletionDetails", response_model=DebugLog)
def get_chat_completion_details(tenantId: str, userId: str, sessionId: str, debuglogId: str):
    try:
        debug_log = debug_container.read_item(item=debuglogId, partition_key=sessionId)
        return debug_log
    except Exception:
        raise HTTPException(status_code=404, detail="Debug log not found")


# create a post function that renames the ChatName in the user data container
@app.post("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/rename", description="Renames the chat session",
          tags=[endpointTitle], response_model=Session)
def rename_chat_session(tenantId: str, userId: str, sessionId: str, newChatSessionName: str):
    items = fetch_chat_container_by_session(tenantId, userId, sessionId)
    if not items:
        raise HTTPException(status_code=404, detail="Session not found")

    item = items[0]
    item["ChatName"] = newChatSessionName
    update_chat_container(item)

    return Session(id=item["sessionId"], sessionId=item["sessionId"], tenantId=item["tenantId"], userId=item["userId"],
                   name=item["ChatName"], age=item["age"],
                   address=item["address"], activeAgent=item["activeAgent"], ChatName=newChatSessionName,
                   messages=item["messages"])


def delete_all_thread_records(cosmos_saver: CosmosDBSaver, thread_id: str) -> None:
    """
    Deletes all records related to a given thread in CosmosDB by first identifying all partition keys
    and then deleting every record under each partition key.
    """

    # Step 1: Identify all partition keys related to the thread
    query = "SELECT DISTINCT c.partition_key FROM c WHERE CONTAINS(c.partition_key, @thread_id)"
    parameters = [{"name": "@thread_id", "value": thread_id}]

    partition_keys = list(cosmos_saver.container.query_items(
        query=query, parameters=parameters, enable_cross_partition_query=True
    ))

    if not partition_keys:
        print(f"No records found for thread: {thread_id}")
        return

    print(f"Found {len(partition_keys)} partition keys related to the thread.")

    # Step 2: Delete all records under each partition key
    for partition in partition_keys:
        partition_key = partition["partition_key"]

        # Query all records under the current partition
        record_query = "SELECT c.id FROM c WHERE c.partition_key=@partition_key"
        record_parameters = [{"name": "@partition_key", "value": partition_key}]

        records = list(cosmos_saver.container.query_items(
            query=record_query, parameters=record_parameters, enable_cross_partition_query=True
        ))

        for record in records:
            record_id = record["id"]
            try:
                cosmos_saver.container.delete_item(record_id, partition_key=partition_key)
                print(f"Deleted record: {record_id} from partition: {partition_key}")
            except CosmosHttpResponseError as e:
                print(f"Error deleting record {record_id} (HTTP {e.status_code}): {e.message}")

    print(f"Successfully deleted all records for thread: {thread_id}")


# deletes the session user data container and all messages in the checkpointer store
@app.delete("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}", tags=[endpointTitle], )
def delete_chat_session(tenantId: str, userId: str, sessionId: str, background_tasks: BackgroundTasks):
    delete_userdata_item(tenantId, userId, sessionId)

    # Delete all messages in the checkpointer store
    config = {
        "configurable": {
            "thread_id": sessionId,
            "checkpoint_ns": ""  # Ensure this matches the stored data
        }
    }
    delete_chat_history_by_session(sessionId)

    return {"message": "Session deleted successfully"}


@app.post("/tenant/{tenantId}/user/{userId}/sessions", tags=[endpointTitle], response_model=Session)
def create_chat_session(tenantId: str, userId: str):
    return create_thread(tenantId, userId)


def extract_relevant_messages(debug_lod_id, last_active_agent, response_data, tenantId, userId, sessionId):
    # Convert last_active_agent to its mapped value
    last_active_agent = agent_mapping.get(last_active_agent, last_active_agent)

    debug_lod_id = debug_lod_id
    if not response_data:
        return []

    last_agent_node = None
    last_agent_name = "unknown"
    for i in range(len(response_data) - 1, -1, -1):
        if "__interrupt__" in response_data[i]:
            if i > 0:
                last_agent_node = response_data[i - 1]
                last_agent_name = list(last_agent_node.keys())[0]
            break

    # storing the last active agent in the session container so that we can retrieve it later
    # and deterministically route the incoming message directly to the agent that asked the question.
    patch_active_agent(tenantId, userId, sessionId, last_agent_name)

    if not last_agent_node:
        return []

    messages = []
    for key, value in last_agent_node.items():
        if isinstance(value, dict) and "messages" in value:
            messages.extend(value["messages"])

    last_user_index = -1
    for i in range(len(messages) - 1, -1, -1):
        if isinstance(messages[i], HumanMessage):
            last_user_index = i
            break

    if last_user_index == -1:
        return []

    filtered_messages = [msg for msg in messages[last_user_index:] if not isinstance(msg, ToolMessage)]

    return [
        MessageModel(
            id=str(uuid.uuid4()),
            type="ai_response",
            sessionId=sessionId,
            tenantId=tenantId,
            userId=userId,
            timeStamp=msg.response_metadata.get("timestamp", "") if hasattr(msg, "response_metadata") else "",
            sender="User" if isinstance(msg, HumanMessage) else last_active_agent,
            senderRole="User" if isinstance(msg, HumanMessage) else "Assistant",
            text=msg.content if hasattr(msg, "content") else msg.get("content", ""),
            debugLogId=debug_lod_id,
            tokensUsed=msg.response_metadata.get("token_usage", {}).get("total_tokens", 0) if hasattr(msg,
                                                                                                      "response_metadata") else 0,
            rating=True,
            completionPromptId=""
        )
        for msg in filtered_messages
        if msg.content
    ]


def process_messages(messages, userId, tenantId, sessionId):
    for message in messages:
        item = {
            "id": message.id,
            "type": message.type,
            "sessionId": message.sessionId,
            "tenantId": message.tenantId,
            "userId": message.userId,
            "timeStamp": message.timeStamp,
            "sender": message.sender,
            "senderRole": message.senderRole,
            "text": message.text,
            "debugLogId": message.debugLogId,
            "tokensUsed": message.tokensUsed,
            "rating": message.rating,
            "completionPromptId": message.completionPromptId
        }
        store_chat_history(item)

    partition_key = [tenantId, userId, sessionId]
    # Get the active agent from Cosmos DB with a point lookup
    activeAgent = chat_container.read_item(item=sessionId, partition_key=partition_key).get('activeAgent', 'unknown')

    last_active_agent = agent_mapping.get(activeAgent, activeAgent)
    update_active_agent_in_latest_message(sessionId, last_active_agent)


@app.post("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/completion", tags=[endpointTitle],
          response_model=List[MessageModel])
async def get_chat_completion(
        tenantId: str,
        userId: str,
        sessionId: str,
        background_tasks: BackgroundTasks,
        request_body: str = Body(..., media_type="application/json"),

):
    return [
        {
            "id": "string",
            "type": "string",
            "sessionId": "string",
            "tenantId": "string",
            "userId": "string",
            "timeStamp": "string",
            "sender": "string",
            "senderRole": "string",
            "text": "Hello, I am not yet implemented",
            "debugLogId": "string",
            "tokensUsed": 0,
            "rating": "true",
            "completionPromptId": "string"
        }
    ]


@app.post("/tenant/{tenantId}/user/{userId}/sessions/{sessionId}/summarize-name", tags=[endpointTitle],
          operation_id="SummarizeChatSessionName", response_description="Success", response_model=str)
def summarize_chat_session_name(tenantId: str, userId: str, sessionId: str,
                                request_body: str = Body(..., media_type="application/json")):
    """
    Generates a summarized name for a chat session based on the chat text provided.
    """
    try:
        prompt = (
            "Given the following chat transcript, generate a short, meaningful name for the conversation.\n\n"
            f"Chat Transcript:\n{request_body}\n\n"
            "Summary Name:"
        )

        response = model.invoke(prompt)
        summarized_name = response.content.strip()

        return summarized_name

    except Exception as e:
        return {"error": f"Failed to generate chat session name: {str(e)}"}


@app.post("/tenant/{tenantId}/user/{userId}/semanticcache/reset", tags=[endpointTitle],
          operation_id="ResetSemanticCache", response_description="Success",
          description="Semantic cache reset - not yet implemented", )
def reset_semantic_cache(tenantId: str, userId: str):
    return {"message": "Semantic cache reset not yet implemented"}


@app.put("/userdata", tags=[dataLoadTitle], description="Inserts or updates a single user data record in Cosmos DB")
async def put_userdata(data: Dict):
    try:
        update_users_container(data)
        return {"message": "Inserted user record successfully", "id": data.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert user data: {str(e)}")


@app.put("/accountdata", tags=[dataLoadTitle],
         description="Inserts or updates a single account data record in Cosmos DB")
async def put_accountdata(data: Dict):
    try:
        update_account_container(data)
        return {"message": "Inserted account record successfully", "id": data.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert account data: {str(e)}")


@app.put("/offerdata", tags=[dataLoadTitle], description="Inserts or updates a single offer data record in Cosmos DB")
async def put_offerdata(data: Dict):
    try:
        update_offers_container(data)
        return {"message": "Inserted offer record successfully", "id": data.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert offer data: {str(e)}")

# New Banking API endpoints
@app.get("/tenant/{tenantId}/user/{userId}/accounts", 
         tags=[endpointTitle], 
         description="Retrieves all bank accounts for a specific user", 
         operation_id="GetAccountDetailsAsync",
         response_model=List[BankAccount])
def get_user_accounts(tenantId: str, userId: str):
    """
    Get all bank accounts associated with a specific user.
    
    :param tenantId: The tenant identifier
    :param userId: The user identifier  
    :return: List of bank accounts belonging to the user
    """
    try:
        accounts_data = fetch_accounts_by_user(tenantId, userId)
        
        # Convert raw data to BankAccount models with flexible mapping
        accounts = []
        for account_data in accounts_data:
            try:
                # More flexible field mapping - handle different field names and formats
                account_id = account_data.get("id") or account_data.get("accountId") or ""
                account_name = account_data.get("name") or account_data.get("accountName") or account_data.get("accountHolder") or "Unknown Account"
                
                # Handle accountType with fallback to 0 (CHECKING) for any invalid values
                try:
                    account_type_value = account_data.get("accountType", 0)
                    if isinstance(account_type_value, str):
                        # Try to map string values to enum
                        account_type_mapping = {"checking": 0, "savings": 1, "credit": 2}
                        account_type_value = account_type_mapping.get(account_type_value.lower(), 0)
                    account_type = AccountType(int(account_type_value))
                except (ValueError, TypeError):
                    account_type = AccountType.CHECKING  # Default fallback
                
                # Handle optional enum fields with better error handling
                card_number = account_data.get("cardNumber")
                if isinstance(card_number, str) and card_number.isdigit():
                    card_number = int(card_number)
                elif not isinstance(card_number, (int, type(None))):
                    card_number = None
                
                # Account status with fallback
                try:
                    account_status_value = account_data.get("accountStatus")
                    account_status = AccountStatus(int(account_status_value)) if account_status_value is not None else None
                except (ValueError, TypeError):
                    account_status = None
                
                # Card type with fallback  
                try:
                    card_type_value = account_data.get("cardType")
                    card_type = CardType(int(card_type_value)) if card_type_value is not None else None
                except (ValueError, TypeError):
                    card_type = None
                
                # Handle balance - could be string or number
                balance = account_data.get("balance", 0)
                if isinstance(balance, str):
                    try:
                        balance = int(float(balance))
                    except (ValueError, TypeError):
                        balance = 0
                
                # Handle limit - could be string or number
                limit = account_data.get("limit")
                if isinstance(limit, str):
                    try:
                        limit = int(float(limit))
                    except (ValueError, TypeError):
                        limit = None
                
                # Handle interest rate
                interest_rate = account_data.get("interestRate")
                if isinstance(interest_rate, str):
                    try:
                        interest_rate = int(float(interest_rate))
                    except (ValueError, TypeError):
                        interest_rate = None
                
                short_description = account_data.get("shortDescription") or account_data.get("description") or "Bank Account"
                
                # Create BankAccount with flexible mapping
                account = BankAccount(
                    id=account_id,
                    tenantId=account_data.get("tenantId", tenantId),
                    name=account_name,
                    accountType=account_type,
                    cardNumber=card_number,
                    accountStatus=account_status,
                    cardType=card_type,
                    balance=balance,
                    limit=limit,
                    interestRate=interest_rate,
                    shortDescription=short_description
                )
                accounts.append(account)
                
            except Exception as account_error:
                # Log the error but continue processing other accounts
                print(f"[WARNING] Failed to process account {account_data.get('id', 'unknown')}: {account_error}")
                # Create a minimal account entry for failed parsing
                minimal_account = BankAccount(
                    id=account_data.get("id") or account_data.get("accountId") or "unknown",
                    tenantId=account_data.get("tenantId", tenantId),
                    name=account_data.get("name") or "Unknown Account",
                    accountType=AccountType.CHECKING,
                    shortDescription="Account data parsing failed"
                )
                accounts.append(minimal_account)
            
        print(f"[DEBUG] Successfully processed {len(accounts)} accounts for user {userId}")
        return accounts
        
    except Exception as e:
        print(f"[ERROR] Failed to retrieve accounts for user {userId}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve accounts: {str(e)}")


@app.get("/tenant/{tenantId}/user/{userId}/accounts/{accountId}/transactions",
         tags=[endpointTitle],
         description="Retrieves transaction history for a specific account",
         operation_id="GetAccountTransactions", 
         response_model=List[BankTransaction])
def get_account_transactions(tenantId: str, userId: str, accountId: str):
    """
    Get all transactions for a specific bank account.
    
    :param tenantId: The tenant identifier
    :param userId: The user identifier (for authorization/context)
    :param accountId: The account identifier
    :return: List of transactions for the specified account
    """
    try:
        transactions_data = fetch_transactions_by_account_id(tenantId, accountId)
        
        # Convert raw data to BankTransaction models
        transactions = []
        for transaction_data in transactions_data:
            # Parse the transaction date 
            transaction_date_str = transaction_data.get("transactionDateTime", "")
            try:
                # Handle different datetime formats
                if transaction_date_str.endswith('Z'):
                    transaction_date = datetime.fromisoformat(transaction_date_str.replace('Z', '+00:00'))
                else:
                    transaction_date = datetime.fromisoformat(transaction_date_str)
            except (ValueError, TypeError):
                transaction_date = datetime.now()  # Fallback to current time
            
            transaction = BankTransaction(
                id=transaction_data.get("id", ""),
                tenantId=transaction_data.get("tenantId", ""),
                accountId=transaction_data.get("accountId", ""),
                debitAmount=transaction_data.get("debitAmount", 0),
                creditAmount=transaction_data.get("creditAmount", 0),
                accountBalance=transaction_data.get("accountBalance", 0),
                details=transaction_data.get("details", ""),
                transactionDateTime=transaction_date
            )
            transactions.append(transaction)
            
        return transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transactions: {str(e)}")


@app.get("/tenant/{tenantId}/servicerequests",
         tags=[endpointTitle],
         description="Retrieves service requests for a tenant, optionally filtered by user",
         operation_id="GetServiceRequests",
         response_model=List[ServiceRequest])
def get_service_requests(tenantId: str, userId: str = None):
    """
    Get all service requests for a tenant, with optional user filtering.
    
    :param tenantId: The tenant identifier
    :param userId: Optional user identifier to filter service requests by specific user
    :return: List of service requests for the tenant (and user if specified)
    """
    try:
        service_requests_data = fetch_service_requests_by_tenant(tenantId, userId)
        
        # Convert raw data to ServiceRequest models
        service_requests = []
        for request_data in service_requests_data:
            # Parse dates
            requested_on = None
            scheduled_date = None
            
            if request_data.get("requestedOn"):
                try:
                    requested_on_str = request_data.get("requestedOn")
                    if isinstance(requested_on_str, str):
                        if requested_on_str.endswith('Z'):
                            requested_on = datetime.fromisoformat(requested_on_str.replace('Z', '+00:00'))
                        else:
                            requested_on = datetime.fromisoformat(requested_on_str)
                    elif isinstance(requested_on_str, datetime):
                        requested_on = requested_on_str
                except (ValueError, TypeError):
                    pass
                    
            if request_data.get("scheduledDateTime"):
                try:
                    scheduled_date_str = request_data.get("scheduledDateTime") 
                    if isinstance(scheduled_date_str, str):
                        if scheduled_date_str.endswith('Z'):
                            scheduled_date = datetime.fromisoformat(scheduled_date_str.replace('Z', '+00:00'))
                        else:
                            scheduled_date = datetime.fromisoformat(scheduled_date_str)
                    elif isinstance(scheduled_date_str, datetime):
                        scheduled_date = scheduled_date_str
                except (ValueError, TypeError):
                    pass
            
            service_request = ServiceRequest(
                id=request_data.get("id"),
                tenantId=request_data.get("tenantId"),
                userId=request_data.get("userId"),
                type=request_data.get("type"),
                requestedOn=requested_on,
                scheduledDateTime=scheduled_date,
                accountId=request_data.get("accountId"),
                srType=ServiceRequestType(request_data.get("srType", 0)) if request_data.get("srType") is not None else None,
                recipientEmail=request_data.get("recipientEmail"),
                recipientPhone=request_data.get("recipientPhone"),
                debitAmount=request_data.get("debitAmount"),
                isComplete=request_data.get("isComplete", False),
                requestAnnotations=request_data.get("requestAnnotations"),
                fulfilmentDetails=request_data.get("fulfilmentDetails")
            )
            service_requests.append(service_request)
            
        return service_requests
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve service requests: {str(e)}")