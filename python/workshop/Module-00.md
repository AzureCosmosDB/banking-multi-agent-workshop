# Module 00 - Prerequisites - Deployment and Setup

**[Home](Home.md)** - [Creating Your First Agent >](./Module-01.md)


## Introduction

In this Module, you'll deploy the Azure Services needed to run this workshop and get your local environment configured and ready. You will also learn about the structure of this workshop and get an overview of Multi-Agent Systems.

## Learning Objectives and Activities

- Begin the deployment of the Azure Services
- Learn the structure and get an overview of this workshop
- Explore the core principals of multi-agent systems
- Complete the configuration of your local environment
- Compile and run the starter solution locally


## Module Exercises

1. [Activity 1: Configure Workshop Environment](#activity-1-configure-workshop-environment)
1. [Activity 2: Deploy Azure Services](#activity-2-deploy-azure-services)
1. [Activity 3: Workshop Structure and Overview Session](#activity-3-workshop-structure-and-overview)
1. [Activity 4: Configure Environment Variables](#activity-4-configure-environment-variables)
1. [Activity 5: Compile and Run](#activity-5-compile-and-run)


## Activity 1 Configure Workshop Environment

Complete the following tasks in order to prepare your environment for this workshop.

**Note:** These pre-requisites are a hard requirement for successful completion of this workshop. If you do not have all three you will not be able to successfully complete this workshop.

### Prerequisites

- Laptop or workstation with **administrator rights** (Alternatively you can run this workshop virtually in [GitHub Codespaces](https://github.com/features/codespaces))
- Azure subscription with **owner rights**
- Subscription access to Azure OpenAI service. Start here to [Request Access to Azure OpenAI Service](https://aka.ms/oaiapply). If you have access, see below for ensuring enough quota to deploy.


  #### Checking Azure OpenAI quota limits

  For this sample to deploy successfully, there needs to be enough Azure OpenAI quota for the models used by this sample within your subscription. This sample deploys a new Azure OpenAI account with two models, **gpt-4o-mini with 10K tokens** per minute and **text-3-large with 5k tokens** per minute. For more information on how to check your model quota and change it, see [Manage Azure OpenAI Service Quota](https://learn.microsoft.com/azure/ai-services/openai/how-to/quota)

  #### Azure Subscription Permission Requirements

  This solution deploys a [user-assigned managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) and defines then applies Azure Cosmos DB and Azure OpenAI RBAC permissions to this as well as your own Service Principal Id. You will need the following Azure RBAC roles assigned to your identity in your Azure subscription or [Subscription Owner](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/privileged#owner) access which will give you both of the following.

  - [Manged Identity Contributor](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/identity#managed-identity-contributor)
  - [Cosmos DB Operator](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/databases#cosmos-db-operator)
  - [Cognitive Services OpenAI User](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles/ai-machine-learning#cognitive-services-openai-user)


### Get Started

#### Local Environment

1. To run the workshop locally on your machine, install the following prerequisites:

    - Common pre-requisites:
      - [Docker Desktop](https://docs.docker.com/desktop/) Note: ensure docker is running before attempting this workshop.
      - [Git](https://git-scm.com/downloads)
      - [Azure Developer CLI (azd)](https://aka.ms/install-azd)
  
    Then either of the following depending on which sample you want to explore

    - LangGraph Sample
      - [Python 3.12+](https://www.python.org/downloads/)
      - Your Python IDE or [VS Code](https://code.visualstudio.com/Download) with [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
    - Semantic Kernel Agent Sample
      - [.NET 9](https://dotnet.microsoft.com/downloads/)
      - [Visual Studio](https://visualstudio.microsoft.com/downloads/) or [VS Code](https://code.visualstudio.com/Download) with [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
    - Frontend
      - [Node.js](https://nodejs.org/en/download/)
      - [Angular CLI](https://angular.io/guide/setup-local)
  
1. Open a terminal session and navigate to the folder you want to copy the source code to.

1. Download the project source code:

  ```shell
  azd init -t AzureCosmosDB/banking-multi-agent-workshop/tree/start
  ```

#### GitHub Codespaces

You can run this sample app and workshop virtually by using GitHub Codespaces. The button will open a web-based VS Code instance in your browser:

1. Open the template (this may take several minutes):

  [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/AzureCosmosDB/banking-multi-agent-workshop/tree/start)

1. Continue with the [Deployment](#deployment) below


## Activity 2: Deploy Azure Services

### Deployment

1. From the terminal, navigate to the `python` folder.

1. Ensure you are in the /python folder.

1. Log in to Azure using AZD.

   ```bash
   azd auth login
   ```

1. Provision the Azure services and deploy the application.

   ```bash
   azd up
   ```

This step will take approximately 10-15 minutes. If you encounter an error during step, first rerun `azd up`. This tends to correct most errors.

When the resources are finally deployed, you will see a message in the terminal like below:

```bash
Deploying services (azd deploy)

  (✓) Done: Deploying service ChatServiceWebApi
  - Endpoint: https://ca-webapi-6xbkqp3ybtbuw.whitemoss-86b36485.eastus2.azurecontainerapps.io/

  (✓) Done: Deploying service FrontendApp
  - Endpoint: https://ca-frontend-6xbkqp3ybtbuw.whitemoss-86b36485.eastus2.azurecontainerapps.io/

Do you want to add some dummy data for testing? (yes/no): y
```

Adding dummy data is optional and can be skipped, but we recommend loading the data to have a more complete experience.

You can click on the FrontendApp endpoint to see the deployed application, but if you try chatting to it, you will see that it is not yet implemented. This is because we have not yet built the agents that will be served by the API layer.



> [!IMPORTANT]
> If you encounter any errors during the deployment, rerun `azd up` to continue the deployment from where it left off. This will not create duplicate resources, and tends to resolve most issues.

## Activity 3: Workshop Structure and Overview Session

While the Azure Services are deploying we will have a presentation to cover on the structure for this workshop for today as well as provide an introduction and overview of multi-agent sytems.



## Activity 4: Configure Environment Variables

### Setting up local debugging

When you deploy this solution it automatically injects endpoints and configuration values for the required resources into a `.env` file at root (python) folder.

But you will still need to install dependencies to run the solution locally.

1. Navigate to the python folder of the project.

2. Create a virtual environment:

    ```shell
    python -m venv .venv
    ```

3. Activate the virtual evironment:
    1. Linux/Mac:

        ```shell
        python -m venv .venv
        source .venv/bin/activate
        ```

    2. Windows (PowerShell):

        ```shell
        . .\.venv\Scripts\Activate.ps1
        ```

4. Install the required dependencies for the project.

    ```shell
    pip install -r src/app/requirements.txt
    ```


## Activity 5: Compile and Run

### Running the solution
 
1. Navigate to the python folder of the project (if you're not there already).
2. Start the fastapi server.

    ```shell
    uvicorn src.app.banking_agents_api:app --reload --host 0.0.0.0 --port 8000
    ```
   
The API will be available at `http://localhost:8000/docs`. This has been pre-built with boilerplate code that will create chat sessions and store the chat history in Cosmos DB. 

To run the frontend
- In your IDE, navigate to the `frontend` folder located in the base folder of this project. 
- update the `apiUrl` values in `src/environments/environment.ts` file with the API endpoint (http://localhost:8000/)
- In a separate terminal window from the one running FastAPI server, run the following command (make sure you have Node.js and Angular CLI installed - see the prerequisites section above):

```shell
npm i
ng serve
```

You can now navigate to `http://localhost:4200` to see the frontend application.

Lets try a couple of things:
 
- Try out the API by creating a chat session in the front end. This should return a response saying "Hello, I am not yet implemented".
- Navigate to the Cosmos DB account in the Azure portal to view the containers. You should see an entry in the `Chat` container. If you selected "yes" to the option during `azd up`, there will also be some transactional data in the `OffersData`, `AccountsData`, and `Users` containers as well.
- Take a look at the files in the `src/app/services` folder - these are the boilerplate code for interacting with the Cosmos DB and Azure OpenAI services.
- You will also see an empty file `src/app/banking_agents.py` as well as empty files in the `src/app/tools` and `src/app/prompts` folder. This is where you will build your multi-agent system! 

Next, we will start building the agents that will be served by the API layer and interact with Cosmos DB and Azure OpenAI using LangGraph!

### Deployment Validation

Use the steps below to validate that the solution was deployed successfully.

- [ ] All Azure resources are deployed successfully
- [ ] You can compile the solution in CodeSpaces or locally
- [ ] You can start the project and it runs without errors


### Common Issues and Troubleshooting

1. Errors during azd deployment:
  - Service principal "not found" error.
    - Rerun `azd up`
  - If you are running on Windows with Powershell, you may get: 
    - `"error executing step command 'deploy --all': getting target resource: resource not found: unable to find a resource tagged with 'azd-service-name: ChatServiceWebApi'"`
    - This is likely because you have used Az CLI before, and have an old default resource group name cached that is different from the one specified during `azd up`.
    - To resolve this:
      - Delete `.azure` in the root folder and `.azd` folders in your home directory (`C:\Users\<user name>`).
      - Start again, but first set resource group explicitly. Replace <environment name> in the below with the name you intend to set for your environment: 
        - `azd env set AZURE_RESOURCE_GROUP rg-<environment name>`
        - Then enter <environment name> when prompted:
          -  `Enter a new environment name: <environment name>`
        - Run `azd auth login` again
        - Then run `azd up` again.
1. Azure OpenAI deployment issues:
  - Ensure your subscription has access to Azure OpenAI
  - Check regional availability
1. Python environment issues:
  - Ensure the correct Python version is installed
  - Verify all dependencies are installed
  - Ensure your venv is activated before running any code in the following Modules


## Success Criteria

To complete this Module successfully, you should be able to:

- Verify that all services have been deployed successfully.
- Have an open IDE or CodeSpaces session with the source code and environment variables loaded.
- Be able to compile and run the application with no warnings or errors.

## Next Steps

Proceed to [Creating Your First Agent](./Module-01.md)

## Resources

- [azd Command Reference](https://learn.microsoft.com/azure/developer/azure-developer-cli/reference)
- [Semantic Kernel Agent Framework](https://learn.microsoft.com/semantic-kernel/frameworks/agent)
- [LangGraph](https://langchain-ai.github.io/langgraph/concepts/)
- [Azure OpenAI Service documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Azure Cosmos DB Vector Database](https://learn.microsoft.com/azure/cosmos-db/vector-database)


<details>
  <summary>If you prefer to run this locally on your machine, open this section and install these additional tools.</summary>

<br>

</details>