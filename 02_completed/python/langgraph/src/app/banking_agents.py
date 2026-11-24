import logging
import os
import sys
import uuid
import asyncio
import json
from langchain_core.messages import ToolMessage, SystemMessage
from langchain_core.messages import AIMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from typing import Literal
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command, interrupt
from langgraph_checkpoint_cosmosdb import CosmosDBSaver
from langgraph.checkpoint.memory import MemorySaver
from langsmith import traceable
from src.app.services.azure_open_ai import model
#from src.app.services.local_model import model  # Use local model for testing
from src.app.services.azure_cosmos_db import DATABASE_NAME, checkpoint_container, chat_container, \
    update_chat_container, patch_active_agent

# Uncomment these if you want to use custom OAuth configuration
# try:
#     from fastmcp.client.auth import OAuth
# except ImportError:
#     print("fastmcp not available, OAuth configuration will not be available")

local_interactive_mode = False

logging.basicConfig(level=logging.DEBUG)

PROMPT_DIR = os.path.join(os.path.dirname(__file__), 'prompts')


def load_prompt(agent_name):
    file_path = os.path.join(PROMPT_DIR, f"{agent_name}.prompty")
    print(f"Loading prompt for {agent_name} from {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read().strip()
    except FileNotFoundError:
        print(f"Prompt file not found for {agent_name}, using default placeholder.")
        return "You are an AI banking assistant."


# Tool filtering utility
def filter_tools_by_prefix(tools, prefixes):
    return [tool for tool in tools if any(tool.name.startswith(prefix) for prefix in prefixes)]

# Global variables for persistent session management
_mcp_client = None
_session_context = None
_persistent_session = None

async def setup_agents():
    global coordinator_agent, customer_support_agent, transactions_agent, sales_agent
    global _mcp_client, _session_context, _persistent_session

    print("🚀 [DEBUG] Starting unified Banking Tools MCP client...")
    logging.info("🚀 Starting unified Banking Tools MCP client setup")
    
    # Get retry configuration from environment
    max_retries = int(os.getenv("MCP_CONNECTION_RETRY_ATTEMPTS", "3"))
    retry_delay = int(os.getenv("MCP_CONNECTION_RETRY_DELAY", "10"))
    
    # Load authentication configuration
    try:
        from dotenv import load_dotenv
        load_dotenv(override=False)
        simple_token = os.getenv("MCP_AUTH_TOKEN")
        github_client_id = os.getenv("GITHUB_CLIENT_ID")
        github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        
        print("🔐 [DEBUG] Client Authentication Configuration:")
        print(f"   Simple Token: {'SET' if simple_token else 'NOT SET'}")
        print(f"   GitHub OAuth: {'SET' if github_client_id and github_client_secret else 'NOT SET'}")
        logging.info(f"🔐 Auth config - Simple Token: {'SET' if simple_token else 'NOT SET'}, GitHub OAuth: {'SET' if github_client_id and github_client_secret else 'NOT SET'}")
        
        # Determine authentication mode (same logic as server)
        if github_client_id and github_client_secret:
            auth_mode = "github_oauth"
            print("   Mode: GitHub OAuth (Production)")
            logging.info("   Auth Mode: GitHub OAuth (Production)")
        elif simple_token:
            auth_mode = "simple_token" 
            print(f"   Mode: Simple Token (Development)")
            print(f"   Token: {simple_token[:8]}...")
            logging.info(f"   Auth Mode: Simple Token (Development) - Token: {simple_token[:8]}...")
        else:
            auth_mode = "none"
            print("   Mode: No Authentication")
            logging.info("   Auth Mode: No Authentication")
            
    except ImportError as e:
        auth_mode = "none"
        simple_token = None
        print("🔐 [DEBUG] Client Authentication: Dependencies unavailable - no auth")
        logging.error(f"🔐 Authentication import error: {e}")
    
    mcp_server_url = os.getenv("MCP_SERVER_BASE_URL", "http://localhost:8080")+"/mcp/"
    print(f"   - [DEBUG] Transport: streamable_http")
    print(f"   - [DEBUG] Server URL: {mcp_server_url}")
    print(f"   - [DEBUG] Authentication: {auth_mode.upper()}")
    print(f"   - [DEBUG] Retry Config: {max_retries} attempts, {retry_delay}s delay")
    print("   - [DEBUG] Status: Ready to connect\\n")
    logging.info(f"MCP Config - Transport: streamable_http, URL: {mcp_server_url}, Auth: {auth_mode.upper()}, Retries: {max_retries}")
    
    # MCP Client configuration based on authentication mode
    client_config = {
        "banking_tools": {
            "transport": "streamable_http",
            "url": mcp_server_url,
        }
    }
    
    print(f"[DEBUG] Creating MCP client config: {client_config}")
    logging.info(f"MCP Client config: {client_config}")
    
    # Add authentication if configured
    if auth_mode == "simple_token" and simple_token:
        # Add bearer token header for simple token auth
        client_config["banking_tools"]["headers"] = {
            "Authorization": f"Bearer {simple_token}"
        }
        print("🔐 [DEBUG] Added Bearer token authentication to client")
        logging.info("🔐 Added Bearer token authentication to client")
    elif auth_mode == "github_oauth":
        # Enable OAuth for GitHub authentication
        client_config["banking_tools"]["auth"] = "oauth"
        print("🔐 [DEBUG] Enabled OAuth authentication for client")
        logging.info("🔐 Enabled OAuth authentication for client")
    
    # Retry logic for MCP client initialization
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[DEBUG] MCP Connection Attempt {attempt}/{max_retries}...")
            logging.info(f"MCP Connection Attempt {attempt}/{max_retries}...")
            
            print("[DEBUG] Initializing MultiServerMCPClient...")
            logging.info("Initializing MultiServerMCPClient...")
            _mcp_client = MultiServerMCPClient(client_config)
            print("✅ [DEBUG] MCP Client initialized successfully")
            logging.info("✅ MCP Client initialized successfully")
            
            # Test connection by creating a session
            print("[DEBUG] Testing MCP connection with session creation...")
            logging.info("Testing MCP connection with session creation...")
            _session_context = _mcp_client.session("banking_tools")
            print("[DEBUG] Entering MCP session context...")
            logging.info("Entering MCP session context...")
            _persistent_session = await _session_context.__aenter__()
            print("✅ [DEBUG] MCP Session created and entered successfully")
            logging.info("✅ MCP Session created and entered successfully")
            
            # If we get here, connection was successful
            break
            
        except Exception as e:
            print(f"❌ [ERROR] MCP Connection Attempt {attempt}/{max_retries} failed: {e}")
            logging.error(f"❌ MCP Connection Attempt {attempt}/{max_retries} failed: {e}")
            
            if attempt < max_retries:
                print(f"   [DEBUG] Waiting {retry_delay} seconds before retry...")
                logging.info(f"   Waiting {retry_delay} seconds before retry...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"❌ [ERROR] All {max_retries} MCP connection attempts failed")
                logging.error(f"❌ All {max_retries} MCP connection attempts failed")
                raise Exception(f"Failed to connect to MCP server after {max_retries} attempts: {e}")

    # Load tools using the persistent session
    try:
        print("[DEBUG] Loading MCP tools from session...")
        logging.info("Loading MCP tools from session...")
        all_tools = await load_mcp_tools(_persistent_session)
        print(f"✅ [DEBUG] Successfully loaded {len(all_tools)} MCP tools")
        logging.info(f"✅ Successfully loaded {len(all_tools)} MCP tools")
    except Exception as e:
        print(f"❌ [ERROR] Failed to load MCP tools: {e}")
        logging.error(f"❌ Failed to load MCP tools: {e}")
        raise

    print("[DEBUG] All tools registered from unified MCP server:")
    logging.info("[DEBUG] All tools registered from unified MCP server:")
    for i, tool in enumerate(all_tools):
        print(f"  {i+1}. {tool.name}")
        logging.info(f"  {i+1}. {tool.name}")
        if hasattr(tool, 'description'):
            print(f"     Description: {tool.description}")
            logging.info(f"     Description: {tool.description}")

    # Assign tools to agents based on tool name prefix
    print("[DEBUG] Filtering tools for agents...")
    logging.info("Filtering tools for agents...")
    coordinator_tools = filter_tools_by_prefix(all_tools, ["transfer_to_"])
    support_tools = filter_tools_by_prefix(all_tools, ["service_request", "get_branch_location", "transfer_to_sales_agent", "transfer_to_transactions_agent"])
    sales_tools = filter_tools_by_prefix(all_tools, ["get_offer_information", "create_account", "calculate_monthly_payment", "transfer_to_customer_support_agent", "transfer_to_transactions_agent"])
    transactions_tools = filter_tools_by_prefix(all_tools, ["bank_transfer", "get_transaction_history", "bank_balance", "transfer_to_customer_support_agent"])

    print(f"[DEBUG] Tool assignment:")
    print(f"  Coordinator: {[tool.name for tool in coordinator_tools]}")
    print(f"  Support: {[tool.name for tool in support_tools]}")
    print(f"  Sales: {[tool.name for tool in sales_tools]}")
    print(f"  Transactions: {[tool.name for tool in transactions_tools]}")
    
    logging.info(f"Tool assignment - Coordinator: {[tool.name for tool in coordinator_tools]}")
    logging.info(f"Tool assignment - Support: {[tool.name for tool in support_tools]}")
    logging.info(f"Tool assignment - Sales: {[tool.name for tool in sales_tools]}")
    logging.info(f"Tool assignment - Transactions: {[tool.name for tool in transactions_tools]}")

    # Create agents with their respective tools
    try:
        print("[DEBUG] Creating agents...")
        logging.info("Creating agents...")
        coordinator_agent = create_react_agent(model, coordinator_tools, prompt=load_prompt("coordinator_agent"))
        customer_support_agent = create_react_agent(model, support_tools, prompt=load_prompt("customer_support_agent"))
        sales_agent = create_react_agent(model, sales_tools, prompt=load_prompt("sales_agent"))
        transactions_agent = create_react_agent(model, transactions_tools, prompt=load_prompt("transactions_agent"))
        print("✅ [DEBUG] All agents created successfully")
        logging.info("✅ All agents created successfully")
    except Exception as e:
        print(f"❌ [ERROR] Failed to create agents: {e}")
        logging.error(f"❌ Failed to create agents: {e}")
        raise

async def cleanup_persistent_session():
    """Clean up the persistent MCP session when the application shuts down"""
    global _session_context, _persistent_session
    
    if _session_context is not None and _persistent_session is not None:
        try:
            # Properly exit the async context manager
            await _session_context.__aexit__(None, None, None)
            print("MCP persistent session cleaned up successfully")
        except Exception as e:
            print(f"Error cleaning up MCP session: {e}")
        finally:
            _session_context = None
            _persistent_session = None

@traceable(run_type="llm")
async def call_coordinator_agent(state: MessagesState, config) -> Command[Literal["coordinator_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")

    print(f"[DEBUG] Calling coordinator agent with Thread ID: {thread_id}, User: {userId}, Tenant: {tenantId}")
    logging.info(f"Calling coordinator agent - Thread: {thread_id}, User: {userId}, Tenant: {tenantId}")

    try:
        print(f"[DEBUG] Looking up active agent for thread {thread_id}")
        logging.info(f"Looking up active agent for thread {thread_id}")
        activeAgent = chat_container.read_item(item=thread_id, partition_key=[tenantId, userId, thread_id]).get(
            'activeAgent', 'unknown')
        print(f"[DEBUG] Found active agent: {activeAgent}")
        logging.info(f"Found active agent: {activeAgent}")
    except Exception as e:
        print(f"[DEBUG] No active agent found, defaulting to unknown: {e}")
        logging.debug(f"No active agent found: {e}")
        activeAgent = None

    if activeAgent is None:
        print(f"[DEBUG] Active agent is None, setting up default")
        logging.info("Active agent is None, setting up default")
        if local_interactive_mode:
            update_chat_container({
                "id": thread_id,
                "tenantId": "cli-test",
                "userId": "cli-test",
                "sessionId": thread_id,
                "name": "cli-test",
                "age": "cli-test",
                "address": "cli-test",
                "activeAgent": "unknown",
                "ChatName": "cli-test",
                "messages": []
            })

    print(f"[DEBUG] Active agent from point lookup: {activeAgent}")
    logging.info(f"Active agent from lookup: {activeAgent}")

    if activeAgent not in [None, "unknown", "coordinator_agent"]:
        print(f"[DEBUG] Routing straight to last active agent: {activeAgent}")
        logging.info(f"Routing straight to last active agent: {activeAgent}")
        return Command(update=state, goto=activeAgent)
    else:
        print(f"[DEBUG] Invoking coordinator agent with state: {len(state.get('messages', []))} messages")
        logging.info(f"Invoking coordinator agent with {len(state.get('messages', []))} messages")
        try:
            response = await coordinator_agent.ainvoke(state)
            print(f"[DEBUG] Coordinator agent response received: {type(response)}")
            logging.info(f"Coordinator agent response received: {type(response)}")
            return Command(update=response, goto="human")
        except Exception as e:
            print(f"❌ [ERROR] Coordinator agent failed: {e}")
            logging.error(f"❌ Coordinator agent failed: {e}")
            raise


@traceable(run_type="llm")
async def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    print(f"[DEBUG] Calling customer support agent with Thread ID: {thread_id}")
    logging.info(f"Calling customer support agent - Thread: {thread_id}")
    
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "customer_support_agent")
    
    try:
        print(f"[DEBUG] Invoking customer support agent with {len(state.get('messages', []))} messages")
        logging.info(f"Invoking customer support agent with {len(state.get('messages', []))} messages")
        response = await customer_support_agent.ainvoke(state)
        print(f"[DEBUG] Customer support agent response received: {type(response)}")
        logging.info(f"Customer support agent response received: {type(response)}")
        return Command(update=response, goto="human")
    except Exception as e:
        print(f"❌ [ERROR] Customer support agent failed: {e}")
        logging.error(f"❌ Customer support agent failed: {e}")
        raise


@traceable(run_type="llm")
async def call_sales_agent(state: MessagesState, config) -> Command[Literal["sales_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    print(f"[DEBUG] Calling sales agent with Thread ID: {thread_id}")
    logging.info(f"Calling sales agent - Thread: {thread_id}")
    
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "sales_agent")
    
    try:
        print(f"[DEBUG] Invoking sales agent with {len(state.get('messages', []))} messages")
        logging.info(f"Invoking sales agent with {len(state.get('messages', []))} messages")
        response = await sales_agent.ainvoke(state, config)
        print(f"[DEBUG] Sales agent response received: {type(response)}")
        logging.info(f"Sales agent response received: {type(response)}")
        return Command(update=response, goto="human")
    except Exception as e:
        print(f"❌ [ERROR] Sales agent failed: {e}")
        logging.error(f"❌ Sales agent failed: {e}")
        raise


@traceable(run_type="llm")
async def call_transactions_agent(state: MessagesState, config) -> Command[Literal["transactions_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    print(f"[DEBUG] Calling transactions agent with Thread ID: {thread_id}, User: {userId}, Tenant: {tenantId}")
    logging.info(f"Calling transactions agent - Thread: {thread_id}, User: {userId}, Tenant: {tenantId}")
    
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "transactions_agent")
    
    # Add system message with tenant/user context
    state["messages"].append({
        "role": "system",
        "content": f"If tool to be called requires tenantId='{tenantId}', userId='{userId}', thread_id='{thread_id}', include these in the JSON parameters when invoking the tool. Do not ask the user for them, there are included here for your reference."
    })
    
    try:
        print(f"[DEBUG] Invoking transactions agent with {len(state.get('messages', []))} messages")
        logging.info(f"Invoking transactions agent with {len(state.get('messages', []))} messages")
        response = await transactions_agent.ainvoke(state, config)
        print(f"[DEBUG] Transactions agent response received: {type(response)}")
        logging.info(f"Transactions agent response received: {type(response)}")
        
        # explicitly remove the system message added above from response
        print(f"[DEBUG] transactions_agent response: {response}")
        logging.debug(f"transactions_agent response: {response}")
        if isinstance(response, dict) and "messages" in response:
            response["messages"] = [
                msg for msg in response["messages"]
                if not isinstance(msg, SystemMessage)
            ]
        return Command(update=response, goto="human")
    except Exception as e:
        print(f"❌ [ERROR] Transactions agent failed: {e}")
        logging.error(f"❌ Transactions agent failed: {e}")
        raise


@traceable
def human_node(state: MessagesState, config) -> None:
    interrupt(value="Ready for user input.")
    return None

def get_active_agent(state: MessagesState, config) -> str:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    print(f"[DEBUG] get_active_agent called with thread_id: {thread_id}, userId: {userId}, tenantId: {tenantId}")
    logging.info(f"get_active_agent called - Thread: {thread_id}, User: {userId}, Tenant: {tenantId}")
    
    # Log the state
    print(f"[DEBUG] State has {len(state.get('messages', []))} messages")
    logging.info(f"State has {len(state.get('messages', []))} messages")

    activeAgent = None

    # Search for last ToolMessage and try to extract `goto`
    print(f"[DEBUG] Searching for ToolMessage in last messages...")
    logging.info("Searching for ToolMessage in last messages...")
    
    for i, message in enumerate(reversed(state['messages'])):
        print(f"[DEBUG] Message {i}: type={type(message)}, content preview={str(message)[:100]}...")
        logging.debug(f"Message {i}: type={type(message)}")
        
        if isinstance(message, ToolMessage):
            try:
                print(f"[DEBUG] Found ToolMessage, parsing content...")
                logging.info("Found ToolMessage, parsing content...")
                content_json = json.loads(message.text)
                activeAgent = content_json.get("goto")
                if activeAgent:
                    print(f"[DEBUG] Extracted activeAgent from ToolMessage: {activeAgent}")
                    logging.info(f"Extracted activeAgent from ToolMessage: {activeAgent}")
                    break
            except Exception as e:
                print(f"[DEBUG] Failed to parse ToolMessage content: {e}")
                logging.error(f"Failed to parse ToolMessage content: {e}")

    # Fallback: Cosmos DB lookup if needed
    if not activeAgent:
        print(f"[DEBUG] No activeAgent from ToolMessage, trying Cosmos DB lookup...")
        logging.info("No activeAgent from ToolMessage, trying Cosmos DB lookup...")
        try:
            print(f"[DEBUG] Looking up thread_id in get_active_agent: {thread_id}")
            logging.info(f"Looking up thread_id: {thread_id}")
            activeAgent = chat_container.read_item(
                item=thread_id,
                partition_key=[tenantId, userId, thread_id]
            ).get('activeAgent', 'unknown')
            print(f"[DEBUG] Active agent from DB fallback: {activeAgent}")
            logging.info(f"Active agent from DB fallback: {activeAgent}")
        except Exception as e:
            print(f"[DEBUG] Error retrieving active agent from DB: {e}")
            logging.error(f"Error retrieving active agent from DB: {e}")
            activeAgent = "unknown"

    # Final validation
    print(f"[DEBUG] Final activeAgent determined: {activeAgent}")
    logging.info(f"Final activeAgent determined: {activeAgent}")
    
    if activeAgent not in ["sales_agent", "transactions_agent", "customer_support_agent", "coordinator_agent"]:
        print(f"[DEBUG] Invalid activeAgent '{activeAgent}', defaulting to 'coordinator_agent'")
        logging.warning(f"Invalid activeAgent '{activeAgent}', defaulting to 'coordinator_agent'")
        activeAgent = "coordinator_agent"

    return activeAgent


builder = StateGraph(MessagesState)
builder.add_node("coordinator_agent", call_coordinator_agent, destinations=("human",))
builder.add_node("customer_support_agent", call_customer_support_agent)
builder.add_node("sales_agent", call_sales_agent)
builder.add_node("transactions_agent", call_transactions_agent)
builder.add_node("human", human_node)

builder.add_edge(START, "coordinator_agent")

builder.add_conditional_edges(
    "coordinator_agent",
    get_active_agent,
    {
        "sales_agent": "sales_agent",
        "transactions_agent": "transactions_agent",
        "customer_support_agent": "customer_support_agent",
        "coordinator_agent": "coordinator_agent",  # fallback
    }
)

checkpointer = CosmosDBSaver(database_name=DATABASE_NAME, container_name=checkpoint_container.id)
graph = builder.compile(checkpointer=checkpointer)


def interactive_chat():
    thread_config = {"configurable": {"thread_id": str(uuid.uuid4()), "userId": "Mark", "tenantId": "Contoso"}}
    global local_interactive_mode
    local_interactive_mode = True
    print("Welcome to the interactive multi-agent shopping assistant.")
    print("Type 'exit' to end the conversation.\n")

    user_input = input("You: ")

    while user_input.lower() != "exit":
        input_message = {"messages": [{"role": "user", "content": user_input}]}
        response_found = False

        for update in graph.stream(input_message, config=thread_config, stream_mode="updates"):
            for node_id, value in update.items():
                if isinstance(value, dict) and value.get("messages"):
                    last_message = value["messages"][-1]
                    if isinstance(last_message, AIMessage):
                        print(f"{node_id}: {last_message.content}\n")
                        response_found = True

        if not response_found:
            print("DEBUG: No AI response received.")

        user_input = input("You: ")


if __name__ == "__main__":
    if sys.platform == "win32":
        print("Setting up Windows-specific event loop policy...")
        # Set the event loop to ProactorEventLoop on Windows
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(setup_agents())