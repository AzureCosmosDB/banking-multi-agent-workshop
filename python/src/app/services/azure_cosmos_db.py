import logging
import os
from datetime import datetime
from typing import List, Dict
import re

from azure.cosmos import CosmosClient, PartitionKey
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

logging.basicConfig(level=logging.ERROR)

load_dotenv(override=False)
# Azure Cosmos DB configuration
COSMOS_DB_URL = os.getenv("COSMOSDB_ENDPOINT")
DATABASE_NAME = "MultiAgentZavaRewards"

cosmos_client = None
database = None
container = None

# Define Cosmos DB containers
chat_container = None
debug_container = None
chat_history_container = None
users_container = None
offers_container = None
account_container = None

try:
    credential = DefaultAzureCredential()
    cosmos_client = CosmosClient(COSMOS_DB_URL, credential=credential)
    print("[DEBUG] Connected to Cosmos DB successfully using DefaultAzureCredential.")
except Exception as dac_error:
    print(f"[ERROR] Failed to authenticate using DefaultAzureCredential: {dac_error}")
    raise dac_error

# Initialize Cosmos DB client and containers
try:
    database = cosmos_client.get_database_client(DATABASE_NAME)
    print(f"[DEBUG] Connected to Cosmos DB: {DATABASE_NAME}")

    chat_container = database.get_container_client("Chat")
    checkpoint_container = database.get_container_client("Checkpoints")
    chat_history_container = database.get_container_client("ChatHistory")
    users_container = database.get_container_client("Users")
    offers_container = database.get_container_client("OffersData")
    account_container = database.get_container_client("AccountsData")
    debug_container = database.get_container_client("Debug")

except Exception as e:
    print(f"[ERROR] Error initializing Cosmos DB Containers: {e}")
    raise e


def vector_search(vectors, accountType):
    print("accountType: ", accountType)
    print("vectors: ", vectors)
    # Execute the query
    results = offers_container.query_items(
        query='''
        SELECT TOP 10 c.offerId, c.text, c.name
                        FROM c
                        WHERE c.type = 'Term'
                        AND c.accountType = @accountType
                        AND VectorDistance(c.vector, @referenceVector)> 0.075
                        ORDER BY VectorDistance(c.vector, @referenceVector) 
        ''',
        parameters=[
            {"name": "@accountType", "value": accountType},
            {"name": "@referenceVector", "value": vectors}
        ],
        enable_cross_partition_query=True, populate_query_metrics=True)
    print("Executed vector search in Azure Cosmos DB... \n")
    print("Results: ", results)
    try:
        results = list(results)
    except Exception as e:
        print(f"[ERROR] Error fetching results from Cosmos DB: {e}")
        raise e
    print("length of results: ", len(results))
    # Extract the necessary information from the results
    for result in results:
        print("Result: ", result)
    return results


# update the user data container
def update_chat_container(data):
    try:
        chat_container.upsert_item(data)
        logging.debug(f"User data saved to Cosmos DB: {data}")
    except Exception as e:
        print(f"[ERROR] Error saving user data to Cosmos DB: {e}")
        raise e


def update_offers_container(data):
    try:
        offers_container.upsert_item(data)
        print(f"[DEBUG] Offers data saved to Cosmos DB: {data}")
    except Exception as e:
        print(f"[ERROR] Error saving Offers data to Cosmos DB: {e}")
        raise e


def update_account_container(data):
    try:
        account_container.upsert_item(data)
        print(f"[DEBUG] Account data saved to Cosmos DB: {data}")
    except Exception as e:
        print(f"[ERROR] Error saving Account data to Cosmos DB: {e}")
        raise e


def update_users_container(data):
    try:
        users_container.upsert_item(data)
        print(f"[DEBUG] Users data saved to Cosmos DB: {data}")
    except Exception as e:
        print(f"[ERROR] Error saving Users data to Cosmos DB: {e}")
        raise e


# Lookup helpers
def fetch_all_users():
    """Return list of users with id, name and tenantId."""
    try:
        query = "SELECT c.id, c.name, c.tenantId FROM c"
        items = list(users_container.query_items(query=query, enable_cross_partition_query=True))
        return items
    except Exception as e:
        print(f"[ERROR] Error fetching users: {e}")
        return []


def fetch_distinct_tenants():
    """Return distinct tenantIds from AccountsData container."""
    try:
        query = "SELECT DISTINCT VALUE c.tenantId FROM c WHERE IS_DEFINED(c.tenantId)"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))
        # filter out null/empty
        tenants = sorted({t for t in items if t})
        return tenants
    except Exception as e:
        print(f"[ERROR] Error fetching tenants: {e}")
        return []


def fetch_user_name(user_id: str) -> str:
    """Return the friendly display name for a user id, or the id if not found."""
    try:
        query = "SELECT c.name FROM c WHERE c.id = @id"
        parameters = [{"name": "@id", "value": user_id}]
        items = list(users_container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        if items:
            name_val = items[0].get("name")
            if name_val:
                return name_val
    except Exception as e:
        print(f"[ERROR] Error fetching user name for {user_id}: {e}")
    return user_id


# fetch the user data from the container by tenantId, userId
def fetch_chat_container_by_tenant_and_user(tenantId, userId):
    try:
        query = f"SELECT * FROM c WHERE c.tenantId = '{tenantId}' AND c.userId = '{userId}'"
        items = list(chat_container.query_items(query=query, enable_cross_partition_query=True))
        print(f"[DEBUG] Fetched {len(items)} user data for tenantId: {tenantId}, userId: {userId}")
        return items
    except Exception as e:
        print(f"[ERROR] Error fetching user data for tenantId: {tenantId}, userId: {userId}: {e}")
        raise e


# fetch the user data from the container by tenantId, userId, sessionId
def fetch_chat_container_by_session(tenantId, userId, sessionId):
    try:
        query = f"SELECT * FROM c WHERE c.tenantId = '{tenantId}' AND c.userId = '{userId}' AND c.sessionId = '{sessionId}'"
        items = list(chat_container.query_items(query=query, enable_cross_partition_query=True))
        print(
            f"[DEBUG] Fetched {len(items)} user data for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}")
        return items
    except Exception as e:
        print(
            f"[ERROR] Error fetching user data for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}: {e}")
        raise e


# patch the active agent in the user data container using patch operation
def patch_active_agent(tenantId, userId, sessionId, activeAgent):
    try:
        operations = [
            {'op': 'replace', 'path': '/activeAgent', 'value': activeAgent}
        ]

        try:
            pk = [tenantId, userId, sessionId]
            chat_container.patch_item(item=sessionId, partition_key=pk,
                                      patch_operations=operations)
        except Exception as e:
            print('\nError occurred. {0}'.format(e.message))
    except Exception as e:
        print(
            f"[ERROR] Error patching active agent for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}: {e}")
        raise e

    # deletes the user data from the container by tenantId, userId, sessionId


def patch_account_record(tenantId, account_id, balance):
    try:
        print("account_id: ", account_id)
        print("balance: ", balance)

        operations = [{'op': 'replace', 'path': '/balance', 'value': balance}]
        partition_key = [tenantId, account_id]
        account_container.patch_item(item=account_id, partition_key=partition_key, patch_operations=operations)
        # print(f"[DEBUG] Account record patched: {account_id}")
    except Exception as e:
        print(f"[ERROR] Error patching account record: {e}")
        raise e


def delete_userdata_item(tenantId, userId, sessionId):
    try:
        query = f"SELECT * FROM c WHERE c.tenantId = '{tenantId}' AND c.userId = '{userId}' AND c.sessionId = '{sessionId}'"
        items = list(chat_container.query_items(query=query, enable_cross_partition_query=True))
        if len(items) == 0:
            print(f"[DEBUG] No user data found for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}")
            return
        for item in items:
            chat_container.delete_item(item, partition_key=[tenantId, userId, sessionId])
            print(f"[DEBUG] Deleted user data for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}")
    except Exception as e:
        print(
            f"[ERROR] Error deleting user data for tenantId: {tenantId}, userId: {userId}, sessionId: {sessionId}: {e}")
        raise e


# Create the "Account" container partitioned by accountId


# Function to create an account record
def create_account_record(account_data):
    try:
        account_container.upsert_item(account_data)
        print(f"[DEBUG] Account record created: {account_data}")
    except Exception as e:
        print(f"[ERROR] Error creating account record: {e}")
        raise e


def create_service_request_record(account_data):
    try:
        account_container.upsert_item(account_data)
        print(f"[DEBUG] Account record created: {account_data}")
    except Exception as e:
        print(f"[ERROR] Error creating account record: {e}")
        raise e


def fetch_latest_account_number():
    try:
        query = "SELECT c.accountId FROM c WHERE (c.accountType = 'Personal' OR c.accountType = 'Business')"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))

        print(f"[DEBUG] Fetched {len(items)} account numbers")

        if items:
            # Extract numeric parts and convert to integers
            account_numbers = []
            for item in items:
                account_id = item.get("accountId", "")
                if account_id.startswith("A") and account_id[1:].isdigit():
                    account_numbers.append(int(account_id[1:]))

            if not account_numbers:
                return 0  # No valid account numbers found

            latest_account_number = max(account_numbers)  # Get the highest account number
            print(f"[DEBUG] Latest account number: {latest_account_number}")
            return latest_account_number

        return 0  # No accounts found

    except Exception as e:
        print(f"[ERROR] Error fetching latest account number: {e}")
        raise e


def fetch_latest_transaction_number(account_number):
    try:
        query = f"SELECT c.id FROM c WHERE c.type = 'RewardsTransaction' " \
                f"AND c.accountId = '{account_number}' ORDER BY c._ts DESC"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))

        if items:
            latest_transaction_id = items[0]["id"]
            numeric_part = re.sub(r'\D', '', latest_transaction_id)
            latest_transaction_number = int(numeric_part)
            return latest_transaction_number

        return 0  # No transactions found

    except Exception as e:
        print(f"[ERROR] Error fetching latest transaction number: {e}")
        raise e

 
def fetch_account_by_number(account_number, tenantId, userId):
    try:
        query = f"SELECT * FROM c WHERE c.accountId = '{account_number}' AND c.tenantId = '{tenantId}' AND c.userId = '{userId}'"
        items = list(account_container.query_items(query=query, enable_cross_partition_query=True))

        if items:
            return items[0]  # Return the first matching account

        return None  # No matching account found

    except Exception as e:
        print(f"[ERROR] Error fetching account by number: {e}")
        raise e


def fetch_transactions_by_date_range(accountId: str, startDate: datetime, endDate: datetime) -> List[Dict]:
    """
    Retrieve the transaction history for a specific account between two dates.

    :param accountId: The ID of the account to retrieve transactions for.
    :param startDate: The start date for the transaction history.
    :param endDate: The end date for the transaction history.
    :return: A list of transactions within the specified date range.
    """
    query = """
    SELECT * FROM c
    WHERE c.accountId = @accountId AND c.transactionDateTime >= @startDate AND c.transactionDateTime <= @endDate
    AND c.type = "RewardsTransaction"
    ORDER BY c.transactionDateTime ASC
    """
    parameters = [
        {"name": "@accountId", "value": accountId},
        {"name": "@startDate", "value": startDate.isoformat() + "Z"},
        {"name": "@endDate", "value": endDate.isoformat() + "Z"}
    ]
    transactions = list(
        account_container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
    return transactions


def update_active_agent_in_latest_message(sessionId: str, new_active_agent: str):
    try:
        # Fetch the latest message from the ChatHistory container
        query = f"SELECT * FROM c WHERE c.sessionId = '{sessionId}' ORDER BY c._ts DESC OFFSET 0 LIMIT 1"
        items = list(chat_history_container.query_items(query=query, enable_cross_partition_query=True))

        if not items:
            print(f"[DEBUG] No chat history found for sessionId: {sessionId}")
            return

        latest_message = items[0]
        latest_message['sender'] = new_active_agent

        # Upsert the updated message back into the ChatHistory container
        chat_history_container.upsert_item(latest_message)
        print(f"[DEBUG] Updated activeAgent in the latest message for sessionId: {sessionId}")

    except Exception as e:
        print(f"[ERROR] Error updating activeAgent in the latest message for sessionId: {sessionId}: {e}")
        raise e


def store_chat_history(data):
    try:
        chat_history_container.upsert_item(data)
        print(f"[DEBUG] Chat history saved to Cosmos DB: {data}")
    except Exception as e:
        print(f"[ERROR] Error saving chat history to Cosmos DB: {e}")
        raise e


def fetch_chat_history_by_session(sessionId):
    try:
        query = f"SELECT * FROM c WHERE c.sessionId = '{sessionId}'"
        items = list(chat_history_container.query_items(query=query, enable_cross_partition_query=True))
        print(f"[DEBUG] Fetched {len(items)} chat history for sessionId: {sessionId}")
        return items
    except Exception as e:
        print(f"[ERROR] Error fetching chat history for sessionId: {sessionId}: {e}")
        raise e


def delete_chat_history_by_session(sessionId):
    try:
        query = f"SELECT * FROM c WHERE c.sessionId = '{sessionId}'"
        items = list(chat_history_container.query_items(query=query, enable_cross_partition_query=True))
        if len(items) == 0:
            print(f"[DEBUG] No chat history found for sessionId: {sessionId}")
            return
        for item in items:
            chat_history_container.delete_item(item, partition_key=[sessionId])
            print(f"[DEBUG] Deleted chat history for sessionId: {sessionId}")
    except Exception as e:
        print(f"[ERROR] Error deleting chat history for sessionId: {sessionId}: {e}")
        raise e


# Function to create a transaction record
def create_transaction_record(transaction_data):
    try:
        account_container.upsert_item(transaction_data)
        # print(f"[DEBUG] Transaction record created: {transaction_data}")
    except Exception as e:
        print(f"[ERROR] Error creating transaction record: {e}")
        raise e
