# Module 06 - Bonus: Build Your Own Multi-Agent App with AI

**[< Converting to Model Context Protocol](./Module-05.md)** - **[Lessons Learned, Agent Futures, Q&A >](./Module-07.md)**

## Introduction

In this bonus module, you'll use an AI coding agent (GitHub Copilot, Cursor, Claude Code, etc.) together with the **Cosmos DB Agent Kit** to build an entirely new multi-agent application from scratch. The agent kit provides 100 best-practice rules that guide your AI assistant to produce production-quality code using LangGraph, Azure Cosmos DB, and MCP - the same patterns you've learned throughout this workshop.

The goal is to see how far AI-assisted development can take you when it has access to domain-specific knowledge about Cosmos DB multi-agent architectures.

## Learning Objectives

By the end of this module, you will:

- Install the Cosmos DB Agent Kit into a new project
- Use an AI coding agent to scaffold a complete multi-agent application
- Understand how agent skill rules guide AI code generation
- Customize the application domain to your own interests

## Prerequisites

- A GitHub account
- An AI coding agent (GitHub Copilot in VS Code, Cursor, Claude Code, or similar)
- The Azure resources you deployed in Module 00 (Cosmos DB account, Azure OpenAI)
- Node.js installed (for the `npx` command)

## Module Exercises

1. [Activity 1: Create a New Repository](#activity-1-create-a-new-repository)
2. [Activity 2: Install the Cosmos DB Agent Kit](#activity-2-install-the-cosmos-db-agent-kit)
3. [Activity 2b: Pre-Create the Cosmos DB Database and Containers](#activity-2b-pre-create-the-cosmos-db-database-and-containers)
4. [Activity 3: Generate Your Multi-Agent Application](#activity-3-generate-your-multi-agent-application)
5. [Activity 4: Customize and Iterate](#activity-4-customize-and-iterate)

---

## Activity 1: Create a New Repository

Create a fresh GitHub repository and clone it locally.

### Steps

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `my-multi-agent-app`)

2. Clone it locally:

```bash
git clone https://github.com/<your-username>/my-multi-agent-app.git
cd my-multi-agent-app
```

3. Open the folder in VS Code (or your editor of choice):

```bash
code .
```

---

## Activity 2: Install the Cosmos DB Agent Kit

The [Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit) provides best-practice rules that AI coding agents can reference when generating code. Install it into your project:

```bash
npx skills add AzureCosmosDB/cosmosdb-agent-kit
```

This creates a `.skills/` directory containing 100 rules covering:
- Data modeling and partitioning for multi-agent state
- SDK best practices for `langchain-azure-cosmosdb`
- LangGraph multi-agent patterns with Cosmos DB checkpointing
- MCP server/client architecture patterns
- Query optimization and indexing strategies

Your AI coding agent will automatically pick up these rules when generating code.

---

## Activity 2b: Pre-Create the Cosmos DB Database and Containers

To give the AI agent the best chance of producing working code on the first attempt, pre-create the database and containers in your existing Cosmos DB account. You already have the endpoint from Module 00.

### Steps

1. Create a `.env` file in your project root with your existing Azure values (same ones from the workshop):

```text
COSMOSDB_ENDPOINT=https://<your-account>.documents.azure.com:443/
AZURE_OPENAI_ENDPOINT=https://<your-openai>.openai.azure.com/
AZURE_OPENAI_COMPLETIONSDEPLOYMENTID=gpt-4.1-mini
AZURE_OPENAI_EMBEDDINGDEPLOYMENTID=text-embedding-3-small
MCP_SERVER_BASE_URL=http://localhost:8080
```

2. Make sure you're logged in to Azure (the script uses `DefaultAzureCredential`):

```powershell
az login
```

3. Create the database in the Azure Portal (database creation requires key-based auth and cannot be done with RBAC):
   - Navigate to your Cosmos DB account in the [Azure Portal](https://portal.azure.com)
   - Go to **Data Explorer** → **New Database**
   - Enter database name: `MultiAgentEcommerce`
   - Click **OK**

4. Set your Cosmos DB endpoint (replace the URL with the `COSMOSDB_ENDPOINT` value from your `.env` file in the workshop):

```powershell
$env:COSMOSDB_ENDPOINT = "https://<your-account>.documents.azure.com:443/"
```

5. Install dependencies and create the containers:

```powershell
pip install azure-cosmos azure-identity
```

```powershell
python -c "
import os
from azure.cosmos import CosmosClient, PartitionKey
from azure.identity import DefaultAzureCredential
endpoint = os.environ['COSMOSDB_ENDPOINT']
print(f'Connecting to {endpoint}...')
client = CosmosClient(endpoint, credential=DefaultAzureCredential())
db = client.get_database_client('MultiAgentEcommerce')
db.create_container_if_not_exists('ChatSessions', PartitionKey(path='/sessionId'))
db.create_container_if_not_exists('ChatHistory', PartitionKey(path='/sessionId'))
db.create_container_if_not_exists('Users', PartitionKey(path='/userId'))
db.create_container_if_not_exists('Orders', PartitionKey(path='/userId'))
db.create_container_if_not_exists('Returns', PartitionKey(path='/userId'))
db.create_container_if_not_exists('Products', PartitionKey(path='/category'),
    vector_embedding_policy={'vectorEmbeddings': [{'path': '/embedding', 'dataType': 'float32', 'dimensions': 1536, 'distanceFunction': 'cosine'}]},
    indexing_policy={'vectorIndexes': [{'path': '/embedding', 'type': 'diskANN'}]})
print('Done - all containers created in MultiAgentEcommerce database.')
"
```

> :bulb: **Tip:** The AI agent will reference these exact container names in the generated code. Pre-creating them avoids permission issues and ensures the app works immediately on first run.

---

## Activity 3: Generate Your Multi-Agent Application

Now use your AI coding agent to build the entire application. Open your agent's chat interface and provide the following prompt.

> :bulb: **Tip:** This prompt uses an e-commerce scenario, but you can change the domain to anything you like - banking, travel booking, IT helpdesk, healthcare, etc. The architectural patterns remain the same regardless of domain.

> :warning: **Before you start:** Enable auto-approve mode in your AI agent so it can create files, run terminal commands, and execute tests without asking for permission each time. The prompt instructs the agent to run tests and fix errors iteratively — this won't work if it has to pause for approval on every step.
>
> - **VS Code Copilot (Agent mode):** Click the arrow next to "Send" and select "Allow All" or use the `@terminal` auto-approve setting
> - **Cursor:** Enable "YOLO mode" in Settings → Features → Terminal → Auto Run
> - **Windsurf:** Toggle "Auto-accept" in the Cascade panel

### The Canonical Prompt

Copy and paste this into your AI coding agent (the raw text below preserves all formatting):

````text
Build a complete multi-agent Python application with the following architecture. Use the rules in .skills/ to guide all Cosmos DB and LangGraph patterns.

Tech Stack: Python 3.11+, LangGraph (StateGraph, create_react_agent, interrupt, Command), langchain-mcp-adapters (MultiServerMCPClient for tool access), FastAPI (API layer), Angular 19 + Angular Material (frontend), Azure Cosmos DB NoSQL (state, chat history, domain data), Azure OpenAI (gpt-4.1-mini).

Architecture Overview: Three separate services:
1. MCP Server (FastMCP, runs on port 8080) - exposes domain tools via @mcp.tool()
2. Agent API (FastAPI, runs on port 8000) - LangGraph multi-agent orchestration + REST endpoints
3. Frontend (Angular 19, runs on port 4200) - chat UI, session management, login, proxied to Agent API

Agents (4 total):
1. Coordinator Agent - entry point, routes to specialist agents using transfer_to_* tools
2. Product Search Agent - handles product discovery, recommendations (vector search on product catalog)
3. Orders Agent - handles order placement, order status, order history, cancellations with human confirmation
4. Returns Agent - handles return requests, refund status, return policy FAQs

Key Patterns (follow .skills/ rules):
- Use MemorySaver as the LangGraph checkpointer for development (swap to CosmosDBSaver for production)
- Use `MultiServerMCPClient.get_tools()` for tool loading (langchain-mcp-adapters >= 0.2.0 uses per-call sessions internally — do NOT use the old `session()` context manager pattern)
- Filter MCP tools by name prefix to assign subsets to each agent
- Use a StateGraph with conditional edges: START -> get_active_agent -> coordinator/specialist
- Implement human-in-the-loop with interrupt() at a "human" node (for order cancellations and high-value orders)
- Store active agent in Cosmos DB for deterministic routing on resume (point read by thread_id)
- Handle MCP ToolMessage content as both string and list formats (langchain-mcp-adapters may return either)
- Separate chat history storage from LangGraph checkpoint state
- Use FastAPI BackgroundTasks for non-blocking Cosmos DB writes (chat history, debug logs)
- Initialize all agents + MCP client in FastAPI startup/lifespan handler with retry logic

CRITICAL - LangGraph Node Function Pattern (prevents infinite recursion):
- When a node function (e.g., call_product_search) invokes a sub-agent via `await agent.ainvoke(state)`, the response contains ALL messages (existing history + new messages from the agent)
- To detect transfers, you MUST only inspect NEW messages: `new_messages = response["messages"][len(state["messages"]):]`
- If you iterate ALL messages looking for ToolMessages with routing JSON, you will find OLD transfer messages and create an infinite loop (GraphRecursionError)
- Each node function must follow this pattern:
  ```python
  async def call_product_search(state: MessagesState, config):
      response = await product_search_agent.ainvoke(state)
      existing_count = len(state.get("messages", []))
      new_messages = response.get("messages", [])[existing_count:]
      for msg in reversed(new_messages):
          if isinstance(msg, ToolMessage):
              goto = extract_routing_info(msg)
              if goto:
                  return Command(update=response, goto=goto)
      _tag_last_ai_message(response, "product_search_agent")
      return Command(update=response, goto=END)
  ```

CRITICAL - Agent Name Attribution:
- `create_react_agent` does NOT set the `name` field on output AI messages
- The API layer needs `msg.name` to report which agent responded
- Each node function must tag the last AI message before returning to END:
  ```python
  def _tag_last_ai_message(response: dict, agent_name: str):
      for msg in reversed(response.get("messages", [])):
          if hasattr(msg, "type") and msg.type == "ai" and msg.content:
              msg.name = agent_name
              break
  ```

CRITICAL - Async Cosmos DB Access in LangGraph:
- LangGraph routing functions and node functions run in an async event loop
- DefaultAzureCredential and container.read_item() are BLOCKING calls
- Always wrap Cosmos DB sync SDK calls with `asyncio.to_thread()` + timeout:
  ```python
  async def get_active_agent_from_db(thread_id: str) -> str:
      try:
          return await asyncio.wait_for(
              asyncio.to_thread(_read_active_agent_from_db, thread_id),
              timeout=5.0,
          )
      except Exception:
          return "unknown"
  ```
- The routing function must NEVER raise - always fall back to "coordinator" on any exception

Logging & Debugging (critical - add structured logging throughout):
- Log every agent transfer with: logger.info(f"AGENT TRANSFER: {source_agent} -> {target_agent} | thread_id={thread_id}")
- Log when active agent is written to Cosmos DB: logger.info(f"ACTIVE AGENT SAVED: {agent_name} | thread_id={thread_id}")
- Log when active agent is read from Cosmos DB on resume: logger.info(f"ACTIVE AGENT LOADED: {agent_name} | thread_id={thread_id}")
- Log every MCP tool call with tool name and result status: logger.info(f"MCP TOOL CALL: {tool_name} | status={status}")
- Log API -> MCP server connection on startup: logger.info(f"MCP CLIENT CONNECTED: {mcp_url} | tools_loaded={len(tools)}")
- Use Python's logging module with level=INFO so all agent activity is visible in the terminal when running

MCP Server Tools to implement:
- search_products(user_prompt, category) - vector search on Products container
- get_product_details(product_id) - point read for full product info
- place_order(user_id, product_id, quantity, shipping_address, tenantId, userId, thread_id) - creates order with human confirmation for orders > $500
- get_order_status(order_id) - point read for order status
- get_order_history(user_id, start_date, end_date) - date range query on orders
- cancel_order(order_id, tenantId, userId, thread_id) - cancellation with human confirmation
- request_return(order_id, reason, tenantId, userId) - creates return request document
- get_return_status(return_id) - point read for return status
- get_return_policy(category) - returns policy information for product category
- calculate_shipping(destination, weight) - shipping cost calculator
- transfer_to_* tools (one per specialist agent) - returns JSON with format: {"goto": "agent_name"}

Cosmos DB Design:
- Database: "MultiAgentEcommerce"
- Containers:
  - ChatSessions (partition key: /sessionId) - session state + activeAgent
  - ChatHistory (partition key: /sessionId) - message log
  - Users (partition key: /userId)
  - Products (partition key: /category) - with vector index for product search
  - Orders (partition key: /userId)
  - Returns (partition key: /userId)

API Endpoints:
- POST /chat - send message, returns agent response (handles interrupt/resume)
- GET /sessions/{tenantId}/{userId} - list sessions
- POST /sessions - create session
- DELETE /sessions/{sessionId} - delete session
- GET /health/ready - readiness probe

File Structure:
- frontend/ - Angular 19 application
  - src/app/components/main-content/ - Chat interface (send messages, display responses with markdown)
  - src/app/components/sidebar/ - Session list (create, select, delete sessions)
  - src/app/components/login/ - Login page (tenant + user selection)
  - src/app/components/dashboard/ - Landing page after login
  - src/app/services/conversations.service.ts - Session CRUD via Agent API
  - src/app/services/chat-options.service.ts - Chat POST to /chat endpoint (handles human-in-the-loop responses)
  - src/app/services/data.service.ts - Shared state (logged-in user, tenant, session)
  - src/app/models/ - TypeScript interfaces (Session, Message)
  - proxy.conf.json - Dev proxy: /api/* -> http://localhost:8000
  - package.json
- src/app/ecommerce_agents.py - LangGraph graph + agent definitions
- src/app/ecommerce_agents_api.py - FastAPI app + endpoints
- src/app/prompts/ - .prompty files per agent
- src/app/services/azure_cosmos_db.py - Cosmos DB client + helpers
- src/app/services/azure_open_ai.py - Azure OpenAI model config
- mcpserver/src/mcp_http_server.py - FastMCP server with @mcp.tool() decorators
- mcpserver/src/services/azure_cosmos_db.py - Cosmos DB client for MCP server
- mcpserver/src/services/azure_open_ai.py - Embeddings for vector search
- requirements.txt
- .env.example

Environment Variables needed (already in .env):
- COSMOSDB_ENDPOINT
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_COMPLETIONSDEPLOYMENTID (gpt-4.1-mini)
- AZURE_OPENAI_EMBEDDINGDEPLOYMENTID (text-embedding-3-small)
- MCP_SERVER_BASE_URL (default http://localhost:8080)

Important constraints:
- Use DefaultAzureCredential for all Azure authentication (no keys)
- The Cosmos DB database "MultiAgentEcommerce" and all containers already exist - do NOT create them in code, just get_database_client/get_container_client
- A .env file already exists with the variables above - use python-dotenv to load it
- The Angular frontend should use a proxy.conf.json to forward /api/* requests to http://localhost:8000
- Create a Python virtual environment (.venv) for the project and install all dependencies into it. The README should include activation instructions for both PowerShell (.venv\Scripts\Activate.ps1) and bash (source .venv/bin/activate)
- For the MCP server: set host and port on the FastMCP constructor (e.g. FastMCP("server", host="0.0.0.0", port=8080)), NOT as arguments to mcp.run(). The run() method only accepts transport (e.g. mcp.run(transport="streamable-http"))

Testing & Verification (do this before reporting complete):
Generate a test/ directory with an integration test suite (test_integration.py) that verifies:
1. MCP server starts and the health/list-tools endpoint responds (confirm all expected tools are registered)
2. MCP tool calls work - call at least search_products and get_order_status directly via MCP client and verify structured responses
3. API server starts and GET /health/ready returns 200
4. API connects to MCP - on startup, the API logs "MCP CLIENT CONNECTED" with the correct tool count
5. Agent transfer: Coordinator -> Product Search - POST /chat with "show me headphones" and verify the response came from the Product Search Agent (check logs for AGENT TRANSFER)
6. Agent transfer: Coordinator -> Orders - POST /chat with "what's the status of my order" and verify routing to Orders Agent
7. Agent transfer: Coordinator -> Returns - POST /chat with "I want to return my last purchase" and verify routing to Returns Agent
8. Active agent persistence - after a transfer, read the ChatSessions container and verify the activeAgent field was updated
9. Active agent resume - send a follow-up message in the same session and verify it routes directly to the last active agent (not back through coordinator)
10. Human-in-the-loop - trigger an order > $500 and verify the response contains a confirmation prompt (interrupt)

Use pytest with httpx for the API tests. The test fixture should:
- Start the MCP server as a subprocess with stdout=subprocess.DEVNULL or use a background thread to drain stdout/stderr pipes (CRITICAL: if you use subprocess.PIPE for stdout, a background thread MUST drain it continuously — otherwise the 8KB pipe buffer fills up, the MCP server blocks on log writes, and all MCP tool calls hang indefinitely)
- Start the Agent API as a subprocess with the same pipe handling
- Wait for each server to be ready (poll health endpoints with retries)
- Use unique ports or kill any stale processes on ports 8000/8080 before starting (stale processes from previous test runs will serve old code and mask real errors)
- Set generous httpx timeouts (120s) — LLM-backed agent invocations can take 10-30s per step
- Run all tests
- Shut down both processes on teardown

CRITICAL test infrastructure notes:
- Always pass `-B` flag to Python subprocesses (prevents writing bytecode cache that can serve stale code)
- Set `PYTHONDONTWRITEBYTECODE=1` in subprocess environments
- Before each test run, kill any existing processes on ports 8000 and 8080
- If tests return empty error messages like `{"detail":""}`, it means you're hitting a stale server process — kill it and restart

Run the full test suite after generation. If any test fails, read the error output, fix the code, and re-run until all 10 tests pass. Do not report complete until the test suite is green.

Generate all files. Make it complete, working, and production-ready.

Finally, generate a README.md at the project root with clear instructions on how to run each component of the application. Include:
- Prerequisites (Python, Node.js, Azure CLI login, .env setup)
- How to start the MCP Server (port 8080)
- How to start the Agent API (port 8000)
- How to start the Angular frontend (port 4200)
- The correct startup order (MCP Server -> Agent API -> Frontend)
- How to access the app in the browser
- How to run the test suite (pytest test/) and what passing output looks like
- Example prompts to try in the chat UI that demonstrate each agent, e.g.:
  - "Show me wireless headphones under $100" -> routes to Product Search Agent
  - "Place an order for product X" -> routes to Orders Agent, triggers confirmation
  - "I want to return my last order" -> routes to Returns Agent
  - "What's the status of order #123?" -> routes to Orders Agent, calls get_order_status tool
````

---

### What to expect

Your AI agent will generate a complete multi-agent e-commerce application following Cosmos DB best practices. The `.skills/` rules will guide it to:

- Use MemorySaver for development checkpointing (simple, no extra dependencies)
- Use `MultiServerMCPClient.get_tools()` with per-call sessions (langchain-mcp-adapters >= 0.2.0 pattern)
- Only inspect NEW messages when detecting transfers (prevents infinite recursion)
- Tag AI messages with agent names (since `create_react_agent` doesn't set `msg.name`)
- Wrap blocking Cosmos DB calls with `asyncio.to_thread()` + timeout in async nodes
- Handle the dual content format in MCP tool messages
- Use point reads for active agent routing (not queries)
- Properly structure the StateGraph with interrupt-based human-in-the-loop
- Use background tasks for non-blocking writes

### Working with the agent — expect some debugging

The AI agent will generate ~90% of a working application, but some debugging is normal. Here's the workflow:

1. **Let it generate everything first** — don't interrupt the generation process
2. **Follow the README** — start each service in the order described
3. **When you hit an error**, copy-paste the full error/traceback back into the agent chat and ask it to fix it
4. **Common issues** you might see:
   - Import errors (missing package in requirements.txt) — ask the agent to fix
   - Port conflicts — kill the process on that port or change the port
   - Cosmos DB permission errors — make sure you did `az login` and that the database exists
   - Angular build errors — paste the error, the agent will fix the TypeScript
5. **Iterate** — it usually takes 2-3 rounds of "run → error → fix" to get everything running cleanly

> :bulb: **This is the real workflow.** Professional developers use AI agents the same way: generate, test, fix, repeat. The skill is knowing what to feed back to the agent.

---

## Activity 4: Customize and Iterate

Now make it your own! Here are some ideas:

### Change the domain

Replace the e-commerce agents with something different:

- **Travel booking** - Coordinator, Flights Agent, Hotels Agent, Activities Agent
- **IT Helpdesk** - Coordinator, Network Agent, Software Agent, Hardware Agent
- **Banking** - Coordinator, Transactions Agent, Customer Support Agent, Sales Agent
- **Healthcare** - Coordinator, Appointments Agent, Prescriptions Agent, Billing Agent

### Add more tools

Ask your AI agent to add new MCP tools:

```text
Add a new MCP tool called "get_recommendations" that takes a user_id, looks up 
their order history in Cosmos DB, generates an embedding from their purchase 
patterns, and does a vector search on the Products container to return 
personalized product recommendations. Add it to the Product Search Agent.
```

### Add vector search for support

```text
Add a vector search tool that searches a FAQ container using Azure OpenAI 
embeddings. Use the Cosmos DB vector search pattern from the .skills/ rules. 
Assign it to the Returns Agent for answering return policy questions.
```

### Change the frontend

```text
Create a simple Streamlit chat UI that calls the /chat endpoint and displays 
agent responses with the agent name shown for each message.
```

---

## Testing Your Application

1. Start the MCP server:

```bash
cd mcpserver
pip install -r requirements.txt
python src/mcp_http_server.py
```

2. In another terminal, start the Agent API:

```bash
cd src
pip install -r requirements.txt
uvicorn app.ecommerce_agents_api:app --host 0.0.0.0 --port 8000 --reload
```

3. In another terminal, start the frontend:

```bash
cd frontend
npm install
npm start
```

4. Open the app at **http://localhost:4200** - log in and start chatting!

5. Or test directly with curl:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-1", "tenantId": "contoso", "userId": "user1", "message": "I want to find a laptop under $1000"}'
```

---

## Summary

In this module you experienced how AI coding agents, when equipped with domain-specific knowledge (the Cosmos DB Agent Kit rules), can generate production-quality multi-agent applications. The key insight is that **rules encode architectural decisions** - partitioning strategies, async initialization patterns, checkpoint management, and MCP session lifecycle - so the AI doesn't need to rediscover these patterns from scratch.

Continue to **[Lessons Learned, Agent Futures, Q&A](./Module-07.md)**

## Resources

- [Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/concepts/)
- [langchain-azure-cosmosdb](https://pypi.org/project/langchain-azure-cosmosdb/)
- [langchain-mcp-adapters](https://pypi.org/project/langchain-mcp-adapters/)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Azure Cosmos DB NoSQL](https://learn.microsoft.com/azure/cosmos-db/nosql/)
