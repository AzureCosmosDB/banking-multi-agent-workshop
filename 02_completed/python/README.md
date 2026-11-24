# Multi Agent Workshop using LangGraph in Python

> [!NOTE]
> This application works on Windows, macOS, and Linux. However, it will run more efficiently on Linux/macOS where [uvloop](https://github.com/MagicStack/uvloop) is available. On Windows, the application falls back to Python's built-in `asyncio` event loop, which is functional but has higher overhead for async I/O operations (see [Performance Note](#performance-note) below).

This module contains the completed files for the exercises. If you prefer to begin with the minimal scaffolding code and follow the step-by-step instructions to complete each exercise go to [exercises](../../01_exercises/README.md).

To run the multi-agent application using Azure Cosmos DB and LangGraph in Python, follow these steps:

### Prerequisites

- Laptop or workstation with **administrator rights** (Alternatively you can run this sample virtually in [GitHub Codespaces](https://github.com/features/codespaces))
- Azure subscription with **owner rights**
- Subscription access to Azure OpenAI service. Start here to [Request Access to Azure OpenAI Service](https://aka.ms/oaiapply). If you have access, see below for ensuring enough quota to deploy.

  #### Checking Azure OpenAI quota limits

  For this sample to deploy successfully, there needs to be enough Azure OpenAI quota for the models used by this sample within your subscription. This sample deploys a new Azure OpenAI account with two models, **gpt-4o with 30K tokens** per minute and **text-3-embedding-small with 5k tokens** per minute. For more information on how to check your model quota and change it, see [Manage Azure OpenAI Service Quota](https://learn.microsoft.com/azure/ai-services/openai/how-to/quota)

  #### Azure Subscription Permission Requirements

  This solution deploys a [user-assigned managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) and defines then applies Azure Cosmos DB and Azure OpenAI RBAC permissions to this as well as your own Service Principal Id. You will need the following Azure RBAC roles assigned to your identity in your Azure subscription or [Subscription Owner](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/privileged#owner) access which will give you both of the following.

  - [Manged Identity Contributor](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/identity#managed-identity-contributor)
  - [Cosmos DB Operator](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/databases#cosmos-db-operator)
  - [Cognitive Services OpenAI User](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/ai-machine-learning#cognitive-services-openai-user)

### GitHub Codespaces

You can run this sample app using GitHub Codespaces (requires a GitHub account). The button will open a web-based VS Code instance in your browser:

1. Open the template (this may take several minutes):

   [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AzureCosmosDB/banking-multi-agent-workshop/tree/WorkShop_v2_PythonLangGraph?devcontainer_path=.devcontainer/python/devcontainer.json)

2. Move on to the [Deployment](readme.md#deployment) section.

#### Local Environment using VS Code Dev Containers

1. Install [Docker Desktop](https://docs.docker.com/desktop/), and [VS Code](https://code.visualstudio.com/Download) along with the [Dev Containers extension](https://code.visualstudio.com/docs/devcontainers/tutorial#_install-the-extension) extension.

2. Clone the repository:

   ```bash
   git clone https://github.com/AzureCosmosDB/banking-multi-agent-workshop/
   cd banking-multi-agent-workshop/02_completed
   git checkout WorkShop_v2_PythonLangGraph
   ```

3. Open the repository in VS Code and select **Reopen in Container** when prompted.

4. Wait for the container to build and start. This is a one time operation and may take a few minutes.

5. Move on to the [Deployment](readme.md#deployment) section.

#### Local Environment without VS Code Dev Containers

1. To run the workshop locally on your machine, install the following:

   - [Docker Desktop](https://docs.docker.com/desktop/)
   - [Git](https://git-scm.com/downloads)
   - [Azure Developer CLI (azd)](https://aka.ms/install-azd)
   - [Node.js 24 LTS](https://nodejs.org/en/download/)
   - [Angular CLI 20](https://angular.dev/installation#install-angular-cli) (`npm install -g @angular/cli@20`)
   - [Python 3.12+](https://www.python.org/downloads/)
   - Your Python IDE or [VS Code](https://code.visualstudio.com/Download) with [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

2. Clone the repository and navigate to the folder:

   ```bash
   git clone https://github.com/AzureCosmosDB/banking-multi-agent-workshop/
   cd banking-multi-agent-workshop/02_completed
   git checkout WorkShop_v2_PythonLangGraph
   ```

3. Move on to the [Deployment](readme.md#deployment) section.

### Deployment

1. Navigate to the `python/infra` folder:

   ```bash
   cd 02_completed/python/infra
   ```

2. Log in to Azure using AZD. Follow the prompts to complete authentication:

   ```bash
   azd auth login
   ```

3. Provision the Azure services and deploy the application:

   ```bash
   azd up
   ```

   This step will take approximately 10-15 minutes and will:
   - Create all required Azure resources (Cosmos DB, Azure OpenAI, Container Apps, etc.)
   - Deploy both the Banking API and MCP Server as Container Apps
   - Configure authentication and networking between services
   - Set up environment variables automatically

   > [!IMPORTANT]
   > If you encounter any errors during the deployment, rerun `azd up` to continue the deployment from where it left off. This will not create duplicate resources.

4. When the deployment completes successfully, you will see endpoint URLs for both services:

   ```bash
   SUCCESS: Your application was deployed to Azure in X minutes.
   
   Banking API: https://ca-webapi-xxxxx.azurecontainerapps.io/
   MCP Server: https://ca-mcpserver-xxxxx.azurecontainerapps.io/
   ```

5. The deployment will automatically:
   - Load sample banking data (accounts, transactions, offers)
   - Configure MCP client-server communication
   - Set up authentication tokens
   - Update environment variables

### Setting up local development

When you deploy this solution, it automatically configures `.env` files with the required Azure endpoints and authentication tokens for both the main application and MCP server.

To run the solution locally after deployment:

#### 1. Create the shared virtual environment and install dependencies

From the `02_completed` folder, create a single virtual environment and install all dependencies:

**Linux / macOS / Codespaces:**

```bash
cd 02_completed
python -m venv .venv
source .venv/bin/activate
pip install -r python/src/app/requirements.txt
```

**Windows (PowerShell):**

```powershell
cd 02_completed; python -m venv .venv; .venv\Scripts\Activate.ps1; pip install -r python\src\app\requirements.txt
```

> This creates a single `.venv` at `02_completed/.venv` shared by both the Banking API and the MCP Server, so you only wait for dependency installation once.

#### 2. Start the MCP Server (same terminal):

With the venv still active from step 1, start the MCP server:

**Linux / macOS / Codespaces:**

```bash
cd mcpserver
PYTHONPATH=src python src/mcp_http_server.py
```

**Windows (PowerShell):**

```powershell
cd mcpserver; $env:PYTHONPATH = "src"; python src\mcp_http_server.py
```

> [!TIP]
> You can skip this step if you deployed with `azd up` and prefer to use the remote MCP Server. Set `USE_REMOTE_MCP_SERVER=true` and `MCP_SERVER_BASE_URL` to your deployed Container App URL (printed at the end of `azd up`).

#### 3. Start the Banking API (new terminal):

Open a **new terminal** and activate the shared venv:

**Linux / macOS / Codespaces:**

```bash
source 02_completed/.venv/bin/activate
cd 02_completed/python
PYTHONPATH=$(pwd) uvicorn src.app.banking_agents_api:app --reload --host 0.0.0.0 --port 63280
```

**Windows (PowerShell):**

```powershell
02_completed\.venv\Scripts\Activate.ps1; cd 02_completed\python; $env:PYTHONPATH = $PWD.Path; uvicorn src.app.banking_agents_api:app --reload --host 127.0.0.1 --port 63280
```

#### 4. Start the Frontend (new terminal, optional):

Open a new terminal, navigate to the `frontend` folder:

```bash
cd 02_completed/frontend
npm install
npx ng serve
```

**Access the applications:**
- Banking API: http://localhost:63280/docs
- Frontend: http://localhost:4200

#### 5. Run the integration tests (new terminal, optional):

With the Banking API running, open another terminal and activate the shared venv:

**Linux / macOS / Codespaces:**

```bash
source 02_completed/.venv/bin/activate
cd 02_completed/python
python test/test_agent_handoffs.py
```

**Windows (PowerShell):**

```powershell
02_completed\.venv\Scripts\Activate.ps1; cd 02_completed\python; python test\test_agent_handoffs.py
```

This runs 5 end-to-end tests covering coordinator routing to each sub-agent, multi-turn conversations, and inter-agent transfers.

### Start a Conversation

1. Open your browser and navigate to http://localhost:4200/.
1. In the Login dialog, select a user and company and click, Login.
1. Send the message:

---

### Performance Note

This application uses **uvloop** on Linux/macOS to accelerate async I/O operations. uvloop is a drop-in replacement for Python's built-in `asyncio` event loop, written in Cython and built on top of **libuv** (the same high-performance, cross-platform async I/O library that powers Node.js).

**Why uvloop makes the application 2-4x faster on Linux/macOS:**

- **libuv uses epoll (Linux) / kqueue (macOS)** — highly efficient OS-level I/O multiplexing mechanisms that scale to thousands of concurrent connections with O(1) overhead per ready event.
- **Cython implementation** — uvloop bypasses much of CPython's interpreter overhead by implementing the event loop in compiled C extensions, reducing per-callback latency significantly.
- **Optimized timer and signal handling** — libuv's event loop is purpose-built for high-throughput I/O and minimizes system call overhead through batching.

**Why it doesn't work on Windows:**

uvloop cannot run on Windows because libuv's full-featured event loop on Windows uses **IOCP (I/O Completion Ports)**, but uvloop's Cython bindings are written specifically against libuv's Unix/POSIX APIs (epoll/kqueue file descriptor model). The Windows IOCP model is fundamentally different — it's completion-based rather than readiness-based — and uvloop has not implemented the translation layer needed to support it.

**What happens on Windows instead:**

The application falls back to Python's built-in `asyncio` event loop (using `ProactorEventLoop` or `SelectorEventLoop`). This is fully functional but has higher per-event overhead since it's implemented in pure Python. For this workshop's workload (multi-agent chat with Azure OpenAI and Cosmos DB), the difference is negligible since the bottleneck is network latency to Azure services, not event loop throughput.

The `requirements.txt` uses a platform marker so that `pip install` automatically skips uvloop on Windows.