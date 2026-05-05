# Module 05 - Converting to Model Context Protocol (MCP)

**[< Multi-Agent Orchestration](./Module-04.md)** - **[Bonus: Build Your Own Multi-Agent App >](./Module-06.md)**

## Introduction

In this module, you'll learn how to convert your multi-agent banking application to use **Model Context Protocol (MCP)**. MCP provides a standardized way for AI applications to integrate with external tools and data sources, offering better modularity and reusability.

## Learning Objectives

By the end of this module, you will:

- Understand MCP's benefits for multi-agent applications
- Convert LangChain tools to MCP tools using `@mcp.tool()` decorators
- Configure MCP client-server architecture
- Test the complete MCP-enabled banking system
- Test the mcp server independently using vs code as a client

## Why MCP?

MCP provides significant architectural advantages through separation of concerns by keeping business logic (tools) separated from AI orchestration, enabling teams to work independently on different components. The protocol standardization uses JSON-RPC for reliable communication between clients and servers, ensuring consistent interaction patterns across different systems. This approach also enables development independence, where tool updates don't require AI agent redeployment, allowing for more flexible and maintainable multi-agent systems.

## Module Exercises

1. [Activity 1: Understanding the MCP Architecture](#activity-1-understanding-the-mcp-architecture)
2. [Activity 2: Update Banking Agents for MCP](#activity-2-update-banking-agents-for-mcp)
3. [Activity 3: Start the MCP Server](#activity-3-start-the-mcp-server)
4. [Activity 4: Test the Complete System](#activity-4-test-the-complete-system)
5. [Activity 5: Understanding the code changes](#activity-5-understanding-the-code-changes)
6. [Activity 6: Testing MCP Server with VS Code Client](#activity-6-testing-mcp-server-with-vs-code-client)

## Activity 1: Understanding the MCP Architecture

### Current Architecture (LangChain Tools)

Your current banking application uses LangChain tools directly:

```python
# Direct tool imports
from src.app.tools.bank_balance import bank_balance
from src.app.tools.bank_transfer import bank_transfer

# Tools used directly by agents
transactions_tools = [bank_balance, bank_transfer, ...]
transactions_agent = create_react_agent(model, transactions_tools, ...)
```

### MCP Architecture

With MCP, tools are provided by a separate server:

```python
# MCP client connects to server
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools

# Tools loaded from MCP server
client = MultiServerMCPClient(config)
session = client.session("banking_tools")
all_tools = await load_mcp_tools(session)
```

## Activity 2: Update Banking Agents for MCP

### MCP Server Tools

The MCP server (in `/mcpserver/`) provides these banking tools using `@mcp.tool()` decorators:

```python
# Example from mcp_http_server.py
@mcp.tool()
def get_offer_information(user_prompt: str, accountType: str) -> list[dict[str, Any]]:
    """Provide information about a product based on the user prompt."""
    vectors = generate_embedding(user_prompt)
    search_results = vector_search(vectors, accountType)
    return search_results

@mcp.tool()
def create_account(account_holder: str, balance: float, config: RunnableConfig) -> str:
    """Create a new bank account for a user."""
    # Implementation details...
    return f"Account created successfully with number: {new_account_number}"
```

### Update banking_agents.py

> :warning: [!NOTE]
> If you still have banking_agents_api.py running in a terminal, you will initially see errors when updating banking_agents.py with the code below, so its recommended to stop it for now.

Replace your `src/app/banking_agents.py` with this MCP-enabled version:

<details>
<summary><strong>Complete banking_agents.py Implementation (click to expand)</strong></summary>

```python
import logging
import os
import sys
import uuid
import asyncio
import json
from langchain_core.messages import ToolMessage, SystemMessage, AIMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from typing import Literal
from langgraph.graph import StateGraph, START, MessagesState
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command, interrupt
from langchain_azure_cosmosdb import CosmosDBSaver
from langsmith import traceable
from azure.cosmos.aio import CosmosClient as AsyncCosmosClient
from azure.identity.aio import DefaultAzureCredential as AsyncDefaultAzureCredential
from src.app.services.azure_open_ai import model
from src.app.services.azure_cosmos_db import DATABASE_NAME, COSMOS_DB_URL, chat_container, \
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

    print("🚀 Starting unified Banking Tools MCP client...")
    
    # Load authentication configuration
    try:
        from dotenv import load_dotenv
        load_dotenv(override=False)
        simple_token = os.getenv("MCP_AUTH_TOKEN")
        github_client_id = os.getenv("GITHUB_CLIENT_ID")
        github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        
        print("🔐 Client Authentication Configuration:")
        print(f"   Simple Token: {'SET' if simple_token else 'NOT SET'}")
        print(f"   GitHub OAuth: {'SET' if github_client_id and github_client_secret else 'NOT SET'}")
        
        # Determine authentication mode (same logic as server)
        if github_client_id and github_client_secret:
            auth_mode = "github_oauth"
            print("   Mode: GitHub OAuth (Production)")
        elif simple_token:
            auth_mode = "simple_token" 
            print(f"   Mode: Simple Token (Development)")
            print(f"   Token: {simple_token[:8]}...")
        else:
            auth_mode = "none"
            print("   Mode: No Authentication")
            
    except ImportError:
        auth_mode = "none"
        simple_token = None
        print("🔐 Client Authentication: Dependencies unavailable - no auth")
    
    print("   - Transport: streamable_http")
    print("   - Server URL: "+os.getenv("MCP_SERVER_BASE_URL", "http://localhost:8080")+"/mcp")
    print(f"   - Authentication: {auth_mode.upper()}")
    print("   - Status: Ready to connect\\n")
    
    # MCP Client configuration based on authentication mode
    client_config = {
        "banking_tools": {
            "transport": "streamable_http",
            "url": os.getenv("MCP_SERVER_BASE_URL", "http://localhost:8080")+"/mcp",
        }
    }
    
    # Add authentication if configured
    if auth_mode == "simple_token" and simple_token:
        # Add bearer token header for simple token auth
        client_config["banking_tools"]["headers"] = {
            "Authorization": f"Bearer {simple_token}"
        }
        print("🔐 Added Bearer token authentication to client")
    elif auth_mode == "github_oauth":
        # Enable OAuth for GitHub authentication
        client_config["banking_tools"]["auth"] = "oauth"
        print("🔐 Enabled OAuth authentication for client")
    
    _mcp_client = MultiServerMCPClient(client_config)
    print("✅ MCP Client initialized successfully")

    # Create a persistent session that stays alive for the application lifetime
    _session_context = _mcp_client.session("banking_tools")
    _persistent_session = await _session_context.__aenter__()
    
    # Load tools using the persistent session
    all_tools = await load_mcp_tools(_persistent_session)

    print("[DEBUG] All tools registered from unified MCP server:")
    for tool in all_tools:
        print("  -", tool.name)

    # Assign tools to agents based on tool name prefix
    coordinator_tools = filter_tools_by_prefix(all_tools, ["transfer_to_"])
    support_tools = filter_tools_by_prefix(all_tools, ["service_request", "get_branch_location", "transfer_to_sales_agent", "transfer_to_transactions_agent"])
    sales_tools = filter_tools_by_prefix(all_tools, ["get_offer_information", "create_account", "calculate_monthly_payment", "transfer_to_customer_support_agent", "transfer_to_transactions_agent"])
    transactions_tools = filter_tools_by_prefix(all_tools, ["bank_transfer", "get_transaction_history", "bank_balance", "transfer_to_customer_support_agent"])

    # Create agents with their respective tools
    coordinator_agent = create_react_agent(model, coordinator_tools, prompt=load_prompt("coordinator_agent"))
    customer_support_agent = create_react_agent(model, support_tools, prompt=load_prompt("customer_support_agent"))
    sales_agent = create_react_agent(model, sales_tools, prompt=load_prompt("sales_agent"))
    transactions_agent = create_react_agent(model, transactions_tools, prompt=load_prompt("transactions_agent"))

    # Initialize async Cosmos DB checkpointer and compile graph
    global checkpointer, graph
    async_credential = AsyncDefaultAzureCredential()
    async_cosmos_client = AsyncCosmosClient(COSMOS_DB_URL, credential=async_credential)
    async_database = async_cosmos_client.get_database_client(DATABASE_NAME)
    async_checkpoint_container = async_database.get_container_client("Checkpoints")
    checkpointer = CosmosDBSaver(async_checkpoint_container)
    graph = builder.compile(checkpointer=checkpointer)

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

    print(f"Calling coordinator agent with Thread ID: {thread_id}")

    try:
        activeAgent = chat_container.read_item(item=thread_id, partition_key=[tenantId, userId, thread_id]).get(
            'activeAgent', 'unknown')
    except Exception as e:
        logging.debug(f"No active agent found: {e}")
        activeAgent = None

    if activeAgent is None:
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

    print(f"Active agent from point lookup: {activeAgent}")

    if activeAgent not in [None, "unknown", "coordinator_agent"]:
        print(f"Routing straight to last active agent: {activeAgent}")
        return Command(update=state, goto=activeAgent)
    else:
        response = await coordinator_agent.ainvoke(state)
        return Command(update=response, goto="human")


@traceable(run_type="llm")
async def call_customer_support_agent(state: MessagesState, config) -> Command[Literal["customer_support_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "customer_support_agent")
    response = await customer_support_agent.ainvoke(state)
    return Command(update=response, goto="human")


@traceable(run_type="llm")
async def call_sales_agent(state: MessagesState, config) -> Command[Literal["sales_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "sales_agent")
    response = await sales_agent.ainvoke(state, config)
    return Command(update=response, goto="human")


@traceable(run_type="llm")
async def call_transactions_agent(state: MessagesState, config) -> Command[Literal["transactions_agent", "human"]]:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    if local_interactive_mode:
        patch_active_agent("cli-test", "cli-test", thread_id, "transactions_agent")
    state["messages"].append({
        "role": "system",
        "content": f"If tool to be called requires tenantId='{tenantId}', userId='{userId}', thread_id='{thread_id}', include these in the JSON parameters when invoking the tool. Do not ask the user for them, there are included here for your reference."
    })
    response = await transactions_agent.ainvoke(state, config)
    # explicitly remove the system message added above from response
    if isinstance(response, dict) and "messages" in response:
        response["messages"] = [
            msg for msg in response["messages"]
            if not isinstance(msg, SystemMessage)
        ]
    return Command(update=response, goto="human")


@traceable
def human_node(state: MessagesState, config) -> None:
    interrupt(value="Ready for user input.")
    return None

def get_active_agent(state: MessagesState, config) -> str:
    thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
    userId = config["configurable"].get("userId", "UNKNOWN_USER_ID")
    tenantId = config["configurable"].get("tenantId", "UNKNOWN_TENANT_ID")
    # print("DEBUG: get_active_agent called with state:", state)

    activeAgent = None

    # Search for last ToolMessage and try to extract `goto`
    for message in reversed(state['messages']):
        if isinstance(message, ToolMessage):
            try:
                # Handle both old format (plain JSON string) and new format
                # (list of content blocks from langchain-mcp-adapters >= 0.2.0)
                content = message.content
                if isinstance(content, list):
                    # New format: [{"type": "text", "text": "..."}]
                    text_parts = [b["text"] for b in content if b.get("type") == "text"]
                    content = text_parts[0] if text_parts else ""
                content_json = json.loads(content)
                activeAgent = content_json.get("goto")
                if activeAgent:
                    print(f"DEBUG: Extracted activeAgent from ToolMessage: {activeAgent}")
                    break
            except Exception as e:
                print(f"DEBUG: Failed to parse ToolMessage content: {e}")

    # Fallback: Cosmos DB lookup if needed
    if not activeAgent:
        try:
            thread_id = config["configurable"].get("thread_id", "UNKNOWN_THREAD_ID")
            print(f"DEBUG: thread_id in get_active_agent: {thread_id}")
            activeAgent = chat_container.read_item(
                item=thread_id,
                partition_key=[tenantId, userId, thread_id]
            ).get('activeAgent', 'unknown')
            print(f"Active agent from DB fallback: {activeAgent}")
        except Exception as e:
            print(f"Error retrieving active agent from DB: {e}")
            activeAgent = "unknown"

    # Final validation
    if activeAgent not in ["sales_agent", "transactions_agent", "customer_support_agent", "coordinator_agent"]:
        activeAgent = "coordinator_agent"

    return activeAgent


builder = StateGraph(MessagesState)
builder.add_node("coordinator_agent", call_coordinator_agent)
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

checkpointer = None
graph = builder.compile(checkpointer=None)  # Recompiled with CosmosDBSaver in setup_agents()


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
```

</details>

### Update banking_agents_api.py

In `banking_agents_api.py` add the below imports:

```python
from datetime import datetime
import asyncio
from src.app.banking_agents import setup_agents
import src.app.banking_agents as banking_agents_module
```

Locate the below function:

```python
app = fastapi.FastAPI(title="Cosmos DB Multi-Agent Banking API", openapi_url="/cosmos-multi-agent-api.json")
```

Below that, add the following code:

```python
# Global flag to track agent initialization
_agents_initialized = False

@app.on_event("startup")
async def initialize_agents():
    """Initialize agents with retry logic to handle MCP server startup timing"""
    global _agents_initialized
    
    print("🚀 Starting agent initialization with retry logic...")
    
    max_retries = 5
    retry_delay = 10  # seconds
    
    for attempt in range(max_retries):
        try:
            print(f"🔄 Attempt {attempt + 1}/{max_retries}: Initializing agents...")
            await setup_agents()
            _agents_initialized = True
            print("✅ Agents initialized successfully!")
            return
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Waiting {retry_delay} seconds before retry...")
                await asyncio.sleep(retry_delay)
            else:
                print("❌ All attempts failed. Starting without agent initialization.")
                print("💡 Agents will be initialized on first request.")
                _agents_initialized = False

async def ensure_agents_initialized():
    """Ensure agents are initialized before handling requests"""
    global _agents_initialized
    
    if not _agents_initialized:
        print("🔄 Initializing agents on demand...")
        try:
            await setup_agents()
            _agents_initialized = True
            print("✅ Agents initialized successfully!")
        except Exception as e:
            print(f"❌ Failed to initialize agents: {e}")
            raise HTTPException(status_code=503, detail="MCP service unavailable. Please try again in a few moments.")

@app.get("/")
def health_check():
    return {"status": "MCP agent system is up"}

@app.get("/health/ready")
async def readiness_check():
    """Readiness probe for Container Apps"""
    try:
        if not _agents_initialized:
            await ensure_agents_initialized()
        return {"status": "ready", "agents_initialized": _agents_initialized}
    except Exception:
        return {"status": "not_ready", "agents_initialized": False}
```

Locate the `get_chat_completion` function and add the following line at the start of the function:

```python
    await ensure_agents_initialized()
```

Next, locate the `checkpoints` line within `get_chat_completion`:

```python
    checkpoints = list(checkpointer.list(config))
```

Replace it with the async version (since `CosmosDBSaver` is now async):

```python
    checkpoints = [cp async for cp in banking_agents_module.checkpointer.alist(config)]
```

Finally, locate this code block within `get_chat_completion`:

```python
    if not checkpoints:
        # No previous state, start fresh
        new_state = {"messages": [{"role": "user", "content": request_body}]}
        response_data = workflow.invoke(new_state, config, stream_mode="updates")
    else:
        # Resume from last checkpoint
        last_checkpoint = checkpoints[-1]
        last_state = last_checkpoint.checkpoint

        if "messages" not in last_state:
            last_state["messages"] = []

        last_state["messages"].append({"role": "user", "content": request_body})

        if "channel_versions" in last_state:
            for key in reversed(last_state["channel_versions"].keys()):
                if "agent" in key:
                    last_active_agent = key.split(":")[1]
                    break

        last_state["langgraph_triggers"] = [f"resume:{last_active_agent}"]
        response_data = workflow.invoke(last_state, config, stream_mode="updates")
```

Replace it with the below, making the `invoke` calls asynchronous:

```python
    if not checkpoints:
        # No previous state, start fresh
        new_state = {"messages": [{"role": "user", "content": request_body}]}
        response_data = await workflow.ainvoke(new_state, config, stream_mode="updates")
    else:
        # Resume from last checkpoint
        last_checkpoint = checkpoints[-1]
        last_state = last_checkpoint.checkpoint

        if "messages" not in last_state:
            last_state["messages"] = []

        last_state["messages"].append({"role": "user", "content": request_body})

        if "channel_versions" in last_state:
            for key in reversed(last_state["channel_versions"].keys()):
                if "agent" in key:
                    last_active_agent = key.split(":")[1]
                    break

        last_state["langgraph_triggers"] = [f"resume:{last_active_agent}"]
        response_data = await workflow.ainvoke(last_state, config, stream_mode="updates")
```

## Activity 3: Start the MCP Server

The MCP server is provided in the `mcpserver/` directory and includes all banking tools implemented with native `@mcp.tool()` decorators.

> :warning: [!NOTE]
> There should be a `.env` file in the `mcpserver/` directory with the necessary environment variables that was created when you did your initial deployment. If this did not work for any reason, refer to the `.env.sample` file.

### 1. Navigate to MCP Server Directory

```bash
cd /path/to/banking-multi-agent-workshop/01_exercises/mcpserver
```

### 2. Install Dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the MCP Server

```bash
PYTHONPATH=src python src/mcp_http_server.py
```

You should see output like:

```shell
🚀 Initializing MCP Server...
✅ Banking Tools MCP server initialized with Simple Token Auth
🔐 DEVELOPMENT AUTHENTICATION: Bearer token required
🌐 Server will be available at: http://0.0.0.0:8080
INFO:     Uvicorn running on http://0.0.0.0:8080
```

### Understanding the MCP Tools

The server provides the same banking tools that you created earlier, but now as MCP tools:

- **Sales Tools**: `get_offer_information`, `create_account`, `calculate_monthly_payment`
- **Transaction Tools**: `bank_balance`, `bank_transfer`, `get_transaction_history`
- **Support Tools**: `service_request`, `get_branch_location`
- **Agent Transfer Tools**: `transfer_to_*_agent` for routing between agents

## Activity 4: Test the Complete System

### 1. Set Environment Variables

In the `.env` file of the python folder, set the following:

```bash
# Set MCP configuration
USE_REMOTE_MCP_SERVER=true
MCP_SERVER_BASE_URL=http://localhost:8080
MCP_AUTH_TOKEN=banking-server-prod-token-2025
```

### 2. Start the Banking API

Navigate to python folder and start the API:

```bash
python -m venv .venv # if not already done
source .venv/bin/activate # if not already activated
uvicorn src.app.banking_agents_api:app --reload --host 0.0.0.0 --port 63280
```

When the server has fully start, you should now see something like:

```shell
   Token: banking-...
   - Transport: streamable_http
   - Server URL: http://localhost:8080/mcp
   - Authentication: SIMPLE_TOKEN
   - Status: Ready to connect\n
🔐 Added Bearer token authentication to client
✅ MCP Client initialized successfully
[DEBUG] All tools registered from unified MCP server:
  - transfer_to_sales_agent
  - transfer_to_customer_support_agent
  - transfer_to_transactions_agent
  - get_offer_information
  - create_account
  - calculate_monthly_payment
  - service_request
  - get_branch_location
  - bank_transfer
  - get_transaction_history
  - bank_balance
  - server_info
Loading prompt for coordinator_agent from /home/path/to/banking-multi-agent-workshop/01_exercises/python/src/app/prompts/coordinator_agent.prompty
Loading prompt for customer_support_agent from /home/path/to/banking-multi-agent-workshop/01_exercises/python/src/app/prompts/customer_support_agent.prompty
Loading prompt for sales_agent from /home/path/to/banking-multi-agent-workshop/01_exercises/python/src/app/prompts/sales_agent.prompty
Loading prompt for transactions_agent from /home/path/to/banking-multi-agent-workshop/01_exercises/python/src/app/prompts/transactions_agent.prompty
✅ Agents initialized successfully!
INFO:     Application startup complete.
```

### 3. Start the Frontend

```bash
cd /path/to/banking-multi-agent-workshop/01_exercises/frontend
npm install
ng serve
```

### 4. Test the Application

1. Open your browser to `http://localhost:4200`
2. Test with these prompts:

```text
What's my account balance for account Acc003?
Transfer 100 from account Acc001 to account Acc003
```

These should behave in the same way as your original application. 

### Verify MCP Integration

Check the terminal logs to confirm:

- ✅ MCP Client connects to MCP Server successfully
- ✅ Tools are loaded dynamically from the server
- ✅ OAuth Authentication is working (bearer token mode with simple token)
- ✅ Agents use MCP tools

## Activity 5: Understanding the code changes

There were a lot of changes to banking_agents.py. Below is a concise diff-style overview of what changed to enable MCP in your multi-agent banking app.

### 1. Imports & async foundation

- **Added MCP + async tooling** and removed direct tool wiring.

    ```python
    import asyncio, json
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.tools import load_mcp_tools
    from langchain_core.messages import ToolMessage, SystemMessage
    from langsmith import traceable
    ```

- **Agent calls switched to async** (`ainvoke`) instead of sync (`invoke`).

### 2. MCP client, session, and tool loading

- **Centralized MCP setup** with persistent shared session for performance; tools loaded dynamically from the unified MCP server.

    ```python
    _mcp_client = None
    _session_context = None
    _persistent_session = None

    async def setup_agents():
        client_config = {"banking_tools": {
            "transport": "streamable_http",
            "url": os.getenv("MCP_SERVER_BASE_URL", "http://localhost:8080") + "/mcp",
            # optional auth headers
            "headers": {"Authorization": f"Bearer {os.getenv('MCP_AUTH_TOKEN')}"}
        }}
        _mcp_client = MultiServerMCPClient(client_config)
        _session_context = _mcp_client.session("banking_tools")
        _persistent_session = await _session_context.__aenter__()
        all_tools = await load_mcp_tools(_persistent_session)
    ```

### 3. Tool routing by prefix (from server → agents)

- **Replaced hardcoded tool lists** with filtered MCP tools based on name prefixes.

    ```python
    def filter_tools_by_prefix(tools, prefixes):
        return [t for t in tools if any(t.name.startswith(p) for p in prefixes)]

    coordinator_tools  = filter_tools_by_prefix(all_tools, ["transfer_to_"])
    support_tools      = filter_tools_by_prefix(all_tools, ["service_request", "get_branch_location",
                                                            "transfer_to_sales_agent", "transfer_to_transactions_agent"])
    sales_tools        = filter_tools_by_prefix(all_tools, ["get_offer_information", "create_account",
                                                            "calculate_monthly_payment",
                                                            "transfer_to_customer_support_agent", "transfer_to_transactions_agent"])
    transactions_tools = filter_tools_by_prefix(all_tools, ["bank_transfer", "get_transaction_history",
                                                            "bank_balance", "transfer_to_customer_support_agent"])
    ```

### 4. Agents created the same way, but with MCP tools

```python
coordinator_agent      = create_react_agent(model, coordinator_tools,      prompt=load_prompt("coordinator_agent"))
customer_support_agent = create_react_agent(model, support_tools,          prompt=load_prompt("customer_support_agent"))
sales_agent            = create_react_agent(model, sales_tools,            prompt=load_prompt("sales_agent"))
transactions_agent     = create_react_agent(model, transactions_tools,     prompt=load_prompt("transactions_agent"))
```

### 5. Simplified async agent nodes

- **Node functions are async**; agent calls use `ainvoke`.
- **No explicit transfer detection needed**: The MCP transfer tools return a JSON payload with a `"goto"` field. The `get_active_agent` conditional edge (see below) reads this from the `ToolMessage` to route to the correct sub-agent. Each node simply returns `Command(update=response, goto="human")`.

    ```python
    @traceable(run_type="llm")
    async def call_sales_agent(state: MessagesState, config):
        response = await sales_agent.ainvoke(state, config)
        return Command(update=response, goto="human")
    ```

### 6. Passing per-turn IDs for MCP tools

- **Inject a transient `SystemMessage`** so MCP tools get `tenantId/userId/thread_id` without asking the user; remove it from the response.

    ```python
    state["messages"].append({"role":"system",
        "content": f"If tool ... requires tenantId='{tenantId}', userId='{userId}', thread_id='{thread_id}', include these in the JSON parameters."})

    response = await transactions_agent.ainvoke(state, config)
    if isinstance(response, dict) and "messages" in response:
        response["messages"] = [m for m in response["messages"] if not isinstance(m, SystemMessage)]
    ```

### 7. Conditional routing via ToolMessage (`goto`)

- **New `get_active_agent`** reads the last `ToolMessage` (emitted by MCP tools) for a `"goto"` hint; falls back to Cosmos DB. It handles both plain string content and the list-of-content-blocks format used by `langchain-mcp-adapters >= 0.2.0`.

    ```python
    def get_active_agent(state, config) -> str:
        for msg in reversed(state["messages"]):
            if isinstance(msg, ToolMessage):
                content = msg.content
                if isinstance(content, list):
                    text_parts = [b["text"] for b in content if b.get("type") == "text"]
                    content = text_parts[0] if text_parts else ""
                active = json.loads(content).get("goto")
                if active: return active
        # fallback to DB 'activeAgent'
        ...
    ```

- **Added conditional edges** from coordinator based on that resolver.

    ```python
    builder.add_conditional_edges(
        "coordinator_agent",
        get_active_agent,
        {"sales_agent":"sales_agent", "transactions_agent":"transactions_agent",
        "customer_support_agent":"customer_support_agent", "coordinator_agent":"coordinator_agent"}
    )
    ```

### 8. What stayed the same?

- **LangGraph structure & CosmosDBSaver** usage are preserved (async checkpointer + `START → coordinator_agent`).
- **Cosmos "activeAgent" point lookup** remains for persistence and fallback routing.

Tools are now discovered and invoked via MCP, agent nodes are async, routing respects MCP tool-emitted `goto`, and per-turn IDs are injected via a temporary system message to make MCP tools stateless and reliable.

## Activity 6: Testing MCP Server with VS Code Client

VS Code has built-in support for MCP servers, allowing you to interact with your banking tools directly through the editor. This is a great way to test your MCP server and understand how MCP clients work.

### 1. Start Your MCP Server

First, make sure your MCP server is running locally:

```bash
cd /path/to/banking-multi-agent-workshop/01_exercises/mcpserver
source .venv/bin/activate
PYTHONPATH=src python3 src/mcp_http_server.py
```

You should see output like:

```shell
🚀 Initializing MCP Server...
✅ Banking Tools MCP server initialized with Simple Token Auth
🌐 Server will be available at: http://0.0.0.0:8080
```

### 2. Add MCP Server in VS Code

**Step-by-step VS Code commands:**

1. **Open Command Palette**: 
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)

2. **Add the MCP Server**:
   - Type: `MCP: Add Server`
   - Press Enter
   - **Enter Server URL**: `http://localhost:8080/mcp`
   - **Enter Server Name**: `banking-mcp-server` (or any name you prefer)
   - **Verify**: You should see a success message confirming the server was added

> **Note**: VS Code will automatically create the MCP configuration file for you. You don't need to manually create any JSON files!

### 3. Interact with Banking Tools

The MCP tools are accessible through GitHub Copilot Chat in VS Code:

1. **Open Copilot Chat**:
   - Press `Ctrl+Shift+I` or click the chat icon in the sidebar

2. **Ask Natural Language Questions**:
   ```
   "What banking tools are available?"
   "Check the balance for account 12345 for contoso tenant and mark user"
   ```

### 6. Debugging Tips

If you encounter issues with MCP tools:

**Server-side Debugging:**
- **Check MCP server logs** in your terminal for authentication or connection errors
- **Verify server is running** at `http://localhost:8080` - check `/docs` endpoint
- **Test endpoints directly** using curl or browser to verify tool functionality

**Client-side Debugging:**
- **Check Copilot Chat connection** - ensure it can access the MCP server
- **Verify API endpoints** - test `http://localhost:63280/docs` for the banking API
- **Check terminal output** for banking_agents_api.py for MCP connection errors
- **Test the web application** at `http://localhost:4200` as an alternative interface

**Common Issues:**
- **Port conflicts**: Ensure ports 8080 (MCP) and 63280 (Banking API) are available
- **Authentication errors**: Check if MCP server is running in no-auth mode locally
- **Tool loading failures**: Verify MCP client can connect to server during startup

### 7. Understanding MCP Client-Server Interaction

This hands-on experience helps you understand:

- **Protocol Communication**: How MCP clients discover and call tools via JSON-RPC
- **Tool Discovery**: Dynamic tool loading from the MCP server at runtime  
- **Error Handling**: How MCP handles connection and execution errors gracefully
- **Multiple Interfaces**: How the same MCP tools can be accessed via Copilot Chat, direct API, or web UI

This VS Code MCP client interaction gives you insight into how your banking application connects to the MCP server, just through a different client interface.

### Optional: Understanding the Configuration

If you're curious about what VS Code created automatically, it stores MCP server configurations in:

- **Windows**: `%APPDATA%\Code\User\mcp.json`
- **macOS**: `~/Library/Application Support/Code/User/mcp.json`  
- **Linux**: `~/.config/Code/User/mcp.json`

The configuration looks like this:

```json
{
  "servers": {
    "banking-mcp-server": {
      "url": "http://localhost:8080/mcp",
      "type": "http"
    }
  },
  "inputs": []
}
```

But you don't need to edit this manually - VS Code handles it all through the command palette!

### Next Steps

Proceed to [Lessons Learned, Agent Futures, Q&A](./Module-06.md)

- Explore the MCP server implementation in `/mcpserver/src/mcp_http_server.py`
- Learn about production authentication options in `/mcpserver/SECURITY.md`
- Consider implementing additional MCP tools for your specific use cases

Return to **[Home](Home.md)**

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [LangChain MCP Integration](https://python.langchain.com/docs/integrations/tools/mcp/)
- [Azure OpenAI Service](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
