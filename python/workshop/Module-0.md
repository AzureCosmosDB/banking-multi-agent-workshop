# Module 00 - Deployment and Setup

## Introduction

In this Module, you'll confirm the deployment of Azure Services needed to run this workshop then start the application to ensure everything has been properly configured.

1. Open the folder on the desktop *LabUser - Shortcut*
1. Navigate to the *multi-agent-hol* folder.
1. If it is empty or does not exist, proceed to [Clone Repository](#clone-repository)
1. If the folder exists and has files within it proceed to the next step.
1. Open a browser locally on the VM and navigate to https://portal.azure.com
1. Login using your credentials
1. In the Search box at the top of the Azure Portal, type in resource group. Open the Resource groups blade
1. Look for a resource group that starts with: *rg-agenthol-*.
1. If the resource group does not appear wait a few moments then refresh.
1. If after a few minutes, the resource group does not appear, proceed to [Provision Services](#provision-services)
1. When the new resource group appears, expand the Overview tab and click deployments.
![essentials-tab-deployments](./media/module-00/essentials-tab-deployments.png)
1. If all resources have been deployed successfully, you are ready to begin the lab. Your screen should look like this.
![deployments](./media/module-00/deployments.png)
1. Leave this browser open to the Azure Portal. We will refer to it again later in this lab.
1. Proceed to [Run the Solution](#run-the-solution)

## Clone Repository

1. Open the PowerShell terminal on the Start bar.
1. Navigate to the LabUser folder.
1. Clone the GitHub repository for this lab.

```shell
git clone --branch hol --single-branch https://github.com/AzureCosmosDB/banking-multi-agent-workshop.git C:\Users\LabUser\multi-agent-hol
```

1. Proceed to [Provision Services](#provision-services)

## Provision Services

1. Open the PowerShell terminal on the Start Bar and navigate to the multi-agent-hol folder.

```shell
cd C:\Users\LabUser\multi-agent-hol\
```

1. Authenticate  yourself

```shell
azd auth login
```

1. Deploy the Azure services using `azd up`

```shell
azd up
```

1. For environment name enter: `agenthol`
1. Press enter to select the subscription listed.
1. Press enter to select the default region listed.

1. Return to the Azure Portal and refresh the list of resource groups. You may need to refresh a few times.
1. Select the *rg-agenthol* resource group.
1. Find the collapsed *Essentials* section at the top of the page and expand.
1. Click on the Deployments and watch until the status of all deployed resources shows as Succeeded.
1. Your screen should appear as below.

![deployments](./media/module-00/deployments.png)

## Run the solution

### Configure Environment Variables

When you deploy this solution it automatically injects endpoints and configuration values for the required resources into a `.env` file at root (python) folder.

But you will still need to install dependencies to run the solution locally.

1. Open VS Code from the desktop.
1. From the menu, select File, Open Folder, then select the *"C:\Users\LabUser\multi-agent-hol\"* folder.
1. From the menu, select Terminal, New Terminal, then open a new PowerShell terminal and navigate to the python HOL folder.

```shell
cd C:\Users\LabUser\multi-agent-hol\python
```

1. Create a virtual environment *(If prompted, create the environement for the workspace folder.)*

```shell
python -m venv .venv
```

1. Activate the virtual environment

```shell
.venv\Scripts\Activate.ps1
```

1. Install the required dependencies for the project.

```shell
pip install -r .\src\app\requirements.txt
```

### Start the Backend App

1. Remain in the terminal in the python folder.
2. Start the fastapi server.

```shell
uvicorn src.app.banking_agents_api:app --reload --host 0.0.0.0 --port 63280
```

**Note:** If prompted, allow Python to allow public and private network access to this app.

The API will be available at <http://localhost:63280/docs>. This has been pre-built with boilerplate code that will create chat sessions and store the chat history in Cosmos DB.

### Start the Frontend App

1. In VS Code, open a new PowerShell terminal.
1. Navigate to the *multi-agent-hol\frontend* folder

```shell
cd C:\Users\LabUser\multi-agent-hol\frontend
```

1. Run the following to install npm and start the application:

```shell
ng build
ng serve
```

### Start a Conversation

1. Open your browser and navigate to <http://localhost:4200/>.
1. In the Login dialog, select a user and company and click, Login.
1. Send the message:

   ```text
   Hello, how are you?
   ```

1. This should return a response saying "Hello, I am not yet implemented".
1. Navigate to the Cosmos DB account in the Azure portal to view the containers. You should see an entry in the `Chat` container. If you selected "yes" to the option during `azd up`, there will also be some transactional data in the `OffersData`, `AccountsData`, and `Users` containers as well.
1. Take a look at the files in the `src/app/services` folder - these are the boilerplate code for interacting with the Cosmos DB and Azure OpenAI services.
1. You will also see an empty file `src/app/banking_agents.py` as well as empty files in the `src/app/tools` and `src/app/prompts` folder. This is where you will build your multi-agent system!

### Keep the backend and frontend running

Thoughout this lab we will keep the frontend and backend applications in this lab running. The backend will reload on every change we make throughout this lab. The frontend will reload when refreshed in the browser.

Next, we will start building the agents that will be served by the API layer and interact with Cosmos DB and Azure OpenAI using LangGraph!

### Deployment Validation

Use the steps below to validate that the solution was deployed successfully.

- [ ] All Azure resources are deployed successfully
- [ ] You can compile the solution
- [ ] You can start the project and it runs without errors

## Success Criteria

To complete this Module successfully, you should be able to:

- Verify that all services have been deployed successfully.
- Have VS Code open with the source code and environment variables loaded.
- Be able to compile and run the application with no warnings or errors.

## Next Steps

Proceed to Module 1 - [Creating Your First Agent](./Module-01.md)
