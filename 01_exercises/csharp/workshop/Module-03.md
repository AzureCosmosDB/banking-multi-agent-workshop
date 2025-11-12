# Module 03 - Agent Specialization

## Introduction

In this module, you'll learn how to implement agent specialization by creating specialized tools and functions that provide domain-specific functionality. You'll build individual agents that comprise a multi-agent system, each with their own expertise and capabilities.

## Learning Objectives

- Understand Microsoft Agent Framework tool and function architecture
- Implement semantic search and vector indexing integration with Azure Cosmos DB
- Learn how to define specialized agent roles and communication protocols
- Build domain-specific tools for banking operations and customer service

## Module Exercises

1. [Activity 1: Defining Bank Domain Data Models and Functions](#activity-1-defining-bank-domain-data-models-and-functions)  
1. [Activity 2: Defining Agent Behavior](#activity-2-defining-agent-behavior)  
1. [Activity 3: Integrating Bank Domain Functions as Tools](#activity-3-integrating-bank-domain-functions-as-tools)  
1. [Activity 4: Adding a Tool to the Agent](#activity-4-adding-a-tool-to-the-agent)  
1. [Activity 5: Building an Agent Dynamically](#activity-5-building-an-agent-dynamically)
1. [Activity 6: Semantic Search](#activity-6-semantic-search)
1. [Activity 7: Test your Work](#activity-7-test-your-work)

## Activity 1: Defining Bank Domain Data Models and Functions

When working with any kind of data we need to review our data models.

1. In VS Code, navigate to the **Banking** project.
1. Take a look at the names of the **Models** here. These are the domain-specific models we will utilize in our banking scenario.
1. Also review the **BankingDataService** class and understand the various database CRUD operations based on the models.

## Activity 2: Defining Agent Behavior

Agent behavior is defined using prompts. These can be as simple as text in a string variable. However, it is often better to store these as external text files. In this solution we will use a format called, *Prompty* to manage our prompts.

Prompty is an asset class and file format designed to streamline the development and management of prompts for Large Language Models (LLMs). By combining configuration settings, sample data, and prompt templates into a single .prompty file, Prompty enhances observability, understandability, and portability for developers, thereby accelerating the prompt engineering process.

### Understand Agent behavior using Prompty

In this activity we will review the existing Prompty files.

#### Common Agent Rules

1. In VS Code, navigate to the **MultiAgentCopilot** project.
1. In VS Code, navigate to the **/Prompts** folder.
1. Review the contents of **CommonAgentRules.prompty**.

The contents of this file don't define a single agent's behavior but provides a baseline for how all agents will behave. Think of it like a set of global rules for agents. All agents import the text from this prompt to govern their responses.

#### Coordinator Agent

1. Review the contents of **Coordinator.prompty**.

This agent is the coordinator for the entire multi-agent system we are building. Its purpose is to own the experience for users. It starts by greeting new users when they initiate a new session, then routes user requests to the correct agent(s) to handle on their behalf. Finally it asks for feedback on how it did its job.

#### Customer Support Agent

1. Review the contents of **CustomerSupport.prompty**.

This agent handles anything that appears to be a customer support request by a user. It can create, find and update services requests for users. It can also take certain action on behalf of users too.

#### Sales Agent

1. Review the contents of **Sales.prompty**.

This agent is used when customers ask questions about what kinds of services a bank offers. The data on the products the bank has are stored in Cosmos DB. This agent performs a vector search in Cosmos DB to find the most suitable products for a customer's request.

#### Transaction Agent

1. Review the contents of **Transactions.prompty**.

This agent handles any account-based transactions on behalf of the user including getting account balances, generating statements and doing fund transfers between accounts.

### Retrieving the prompty text for Agents

In our multi agent application we have four agents: transactions agent, sales agent, customer support agent, and a coordinator agent to manage all of them. With the behavior of the agents defined in Prompty, we now need to implement the code that will allow the application to load the agent behavior for each of the agents.

1. In VS Code, navigate to the **/Models** folder.
1. Review the contents of **AgentTypes.cs**.

### Implementing the Agent Factory

We are now ready to complete the implementation for the **Agent Factory** created in the previous module. The **AgentFactory** will generate prompts based on the **agentType** parameter, allowing us to reuse the code and add more agents.

1. In VS Code, navigate to the **/Factories** folder.
1. Next, open the **AgentFactory.cs** class.

Next we need to replace our original hard-coded implementation from Module 2 to use the AgentType enum for our banking agents. It is also worth noting that it is here where the contents of the **CommonAgentRules.prompty** are included as part of the system prompts that define our agents.

1. Search for **//TO DO: Add Agent Details** and paste the below code for **GetAgentName()**, **GetAgentDescription()** and **GetAgentPrompt()** :

**Note:** You will notice build errors for some of the updates you make during the activities in this module. These will be fixed in subsequent Activities.

These methods provide agent metadata and behavior definitions based on agent type. They load prompts from .prompty files and combine them with common agent rules.

```csharp
        /// <summary>
        /// Get agent prompt based on type
        /// </summary>
        private static string GetAgentPrompt(AgentType agentType)
        {
            string promptFile = $"{GetAgentName(agentType)}.prompty";

            string prompt = $"{File.ReadAllText($"Prompts/{promptFile}")}{File.ReadAllText("Prompts/CommonAgentRules.prompty")}";

            return prompt;
        }

        /// <summary>
        /// Get agent name based on type
        /// </summary>
        public static string GetAgentName(AgentType agentType)
        {
            return agentType switch
            {
                AgentType.Sales => "Sales",
                AgentType.Transactions => "Transactions",
                AgentType.CustomerSupport => "CustomerSupport",
                AgentType.Coordinator => "Coordinator",
                _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
            };
        }

        /// <summary>
        /// Get agent description
        /// </summary>
        private static string GetAgentDescription(AgentType agentType)
        {
            return agentType switch
            {
                AgentType.Sales => "Handles sales inquiries, account registration, and offers",
                AgentType.Transactions => "Manages transactions, transfers, and transaction history",
                AgentType.CustomerSupport => "Provides customer support, handles complaints and service requests",
                AgentType.Coordinator => "Coordinates and routes requests to appropriate agents",
                _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
            };
        }

```

## Activity 3: Integrating Bank Domain Functions as Tools

All banking domain code is encapsulated in a separate **BankingDataService** class. Let's add the banking domain functions to the agent Tools. For simplicity in this workshop, all functions reference BankingServices. However, agent tools can be any managed code that enables the LLM to interact with the outside world. The Base Tool, inherited by all Tools, contains common code for all Tools. For best results, the **Tool Functions** available to the agent should be consistent with the agent system prompts.

To save time, the code for SalesTools, CustomerSupportTools, and CoordinatorTools are already implemented. The code for TransactionTools is left for you to implement.

1. In VS Code, navigate to the **/Tools** folder.
1. Open the **TransactionTools.cs** file.
1. Paste the following code into the class below the constructor.

This tool function enables agents to add new account transactions to the banking system. It validates input parameters and delegates to the banking data service for persistence.

```csharp
        [Description("Adds a new Account Transaction request")]
        public async Task<ServiceRequest> AddFunTransferRequest(string tenantId, string userId,
            string debitAccountId,
            decimal amount,
            string requestAnnotation,
            string? recipientPhoneNumber = null,
            string? recipientEmailId = null)
        {
            _logger.LogTrace("Adding AccountTransaction request for User ID: {UserId}, Debit Account: {DebitAccountId}", userId, debitAccountId);

            // Ensure non-null values for recipientEmailId and recipientPhoneNumber
            string emailId = recipientEmailId ?? string.Empty;
            string phoneNumber = recipientPhoneNumber ?? string.Empty;

            return await _bankService.CreateFundTransferRequestAsync(tenantId, debitAccountId, userId, requestAnnotation, emailId, phoneNumber, amount);
        }

        [Description("Get the transactions history between 2 dates")]
        public async Task<List<BankTransaction>> GetTransactionHistory(string tenantId, string userId,string accountId, DateTime startDate, DateTime endDate)
        {
            _logger.LogTrace("Fetching AccountTransaction history for Account: {AccountId}, From: {StartDate} To: {EndDate}", accountId, startDate, endDate);
            return await _bankService.GetTransactionsAsync(tenantId, accountId, startDate, endDate);
        }
```

## Activity 4: Adding a Tool to the Agent
1. In VS Code, navigate to the **/Factories** folder
1. Open the **AgentFactory.cs** class.
1. Search for **//TO DO: Create Agent Tools** and paste code below .

```csharp
        /// <summary>
        /// Get tools for specific agent type using existing tool classes
        /// </summary>
        private static IList<AIFunction>? GetInProcessAgentTools(AgentType agentType, BankingDataService bankService, ILoggerFactory loggerFactory)
        {
            ILogger logger = loggerFactory.CreateLogger<AgentFrameworkService>();
            try
            {
                logger.LogInformation("Creating in-process tools for agent type: {AgentType}", agentType);

                // Create the appropriate tools class based on agent type
                BaseTools toolsClass = agentType switch
                {
                    AgentType.Sales => new SalesTools(loggerFactory.CreateLogger<SalesTools>(), bankService),
                    AgentType.Transactions => new TransactionTools(loggerFactory.CreateLogger<TransactionTools>(), bankService),
                    AgentType.CustomerSupport => new CustomerSupportTools(loggerFactory.CreateLogger<CustomerSupportTools>(), bankService),
                    AgentType.Coordinator => new CoordinatorTools(loggerFactory.CreateLogger<CoordinatorTools>(), bankService),
                    _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
                };

                // Log the tool class creation for debugging
                logger.LogInformation("Created {ToolClassName} for agent type: {AgentType}", toolsClass.GetType().Name, agentType);

                // Get methods with Description attributes and create AI functions
                var methods = toolsClass.GetType().GetMethods()
                    .Where(m => m.GetCustomAttributes(typeof(DescriptionAttribute), false).Length > 0);

                IList<AIFunction> functions = new List<AIFunction>();
                
                foreach (var method in methods)
                {
                    try
                    {
                        var aiFunction = AIFunctionFactory.Create(method, toolsClass);
                        functions.Add(aiFunction);
                        
                        var description = method.GetCustomAttribute<DescriptionAttribute>().Description;
                        logger.LogDebug("Agent {AgentType} in-process tool: '{MethodName}' - {Description}",
                            agentType, method.Name, description);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to create AI function for method {MethodName} in {AgentType}: {Message}",
                            method.Name, agentType, ex.Message);
                    }
                }

                logger.LogInformation("Created {FunctionCount} in-process tools for agent type: {AgentType}", 
                    functions.Count, agentType);

                return functions.Count > 0 ? functions : null;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating in-process tools for agent type: {AgentType}", agentType);
                return null;
            }
        }

```
### Adding InProcess tools in Agent Framework Service
1. In VS Code, navigate to the **/Services** folder
1. Open the **AgentFrameworkService.cs** class.
1. Search for **//TO DO: Add In Process Tools** and paste the code **within** the method. Do **not** replace the entire method.

```csharp
if (_bankService != null)
{
    _agents = AgentFactory.CreateAllAgentsWithInProcessTools(_chatClient, _bankService, _loggerFactory);
}
``` 

## Activity 5: Building an Agent Dynamically

Similar to generating system prompts based on agent type, we need the Tools to be created dynamically. Next, we will implement a **CreateAllAgentsWithInProcessTools()** function that dynamically generates a Tool based on the agent type.

1. In VS Code, navigate to the **/Factories** folder
1. Open the **AgentFactory.cs** class.
1. Search for **//TO DO: Add Agent Creation with Tools** and paste code below .

```csharp
        /// <summary>
        /// Create all banking agents with proper instructions and tools
        /// </summary>
        public static List<AIAgent> CreateAllAgentsWithInProcessTools(IChatClient chatClient, BankingDataService bankService, ILoggerFactory loggerFactory)
        {           

            var agents = new List<AIAgent>();
            ILogger logger = loggerFactory.CreateLogger("AgentFactory");

            // Get all agent types from the enum
            var agentTypes = Enum.GetValues<AgentType>();

            // Create agents for each agent type
            foreach (var agentType in agentTypes)
            {
                logger.LogInformation("Creating agent {AgentType} with InProcess tools", agentType);
                
                var aiFunctions = GetInProcessAgentTools(agentType, bankService, loggerFactory).ToArray();

                var agent = chatClient.CreateAIAgent(
                        instructions: GetAgentPrompt(agentType),
                        name: GetAgentName(agentType),
                        description: GetAgentDescription(agentType)
                    );

                agents.Add(agent);
                logger.LogInformation("Created agent {AgentName} with {ToolCount} InProcess", agent.Name, aiFunctions.Count());
            }

            logger.LogInformation("Successfully created {AgentCount} banking agents", agents.Count);
            return agents;
        }
```

### Configure AgentFrameworkService to use In-Process tools

1. In VS Code, navigate to the **/Services** folder
1. Open the **AgentFrameworkService.cs** class.
1. Search for **//TO DO: Add SetInProcessToolService** and paste code below .

```csharp
    /// <summary>
    /// Sets the in-process tool service for banking operations.
    /// </summary>
    /// <param name="bankService">The banking data service instance.</param>
    /// <returns>True if the service was set successfully.</returns>
    
    public bool SetInProcessToolService(BankingDataService bankService)
    {
        _bankService = bankService ?? throw new ArgumentNullException(nameof(bankService));
        _logger.LogInformation("InProcessToolService has been set.");
        return true;
    }
```

1. Navigate to **ChatService.cs** class.
1. Search for **//TO DO: Invoke SetInProcessToolService** and paste code below **within** the method. Do **not** replace the entire method.

```csharp
            var embeddingClient = _afService.GetAzureOpenAIClient();
            var embeddingDeployment = _afService.GetEmbeddingDeploymentName();
            EmbeddingService embeddingService = new EmbeddingService(embeddingClient, embeddingDeployment);
            _bankService = new BankingDataService(embeddingService, cosmosDBService.Database, cosmosDBService.AccountDataContainer, cosmosDBService.UserDataContainer, cosmosDBService.AccountDataContainer, cosmosDBService.OfferDataContainer, loggerFactory);

            _afService.SetInProcessToolService(_bankService);

```

Now that we can build Agents, we can make the agent build process dynamic based on the **agentType** parameter. Next, we will modify the **BuildAgent()** function within the **AgentFactory** class to dynamically add Tools to the agents.

1. In VS Code, navigate to the **/Services** folder
1. Open the **AgentFrameworkService.cs** class.
1. Replace the **GetResponse()** method with the below version.

```csharp

    public async Task<Tuple<List<Message>, List<DebugLog>>> GetResponse(
        Message userMessage,
        List<Message> messageHistory,
        BankingDataService bankService,
        string tenantId,
        string userId)
    {
        try
        {

            messageHistory.Add(userMessage);
            var chatHistory = ConvertToAIChatMessages(messageHistory);
            chatHistory.Add(new ChatMessage(ChatRole.User, userMessage.Text));
            var agentName="Coordinator";
            var bankAgent = _agents.FirstOrDefault(s => s.Name == agentName);
            var responseText = bankAgent.RunAsync(chatHistory).GetAwaiter().GetResult().Text;
            return CreateResponseTuple(userMessage, responseText, agentName);
            
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when getting response: {ErrorMessage}", ex.Message);
            return new Tuple<List<Message>, List<DebugLog>>(new List<Message>(), new List<DebugLog>());
        }
    }
```

## Activity 6: Semantic Search

The Sales Agent in this banking application performs a vector search in Cosmos DB to search for banking products and services for users. In this activity, you will learn how to configure vector indexing and search in Azure Cosmos DB and explore the container and vector indexing policies. Then learn how to implement vector search using Semantic Kernel.

### Create Data Model for Vector Search

Data Models used for Vector Search in Semantic Kernel need to be enhanced with additional attributes. We will use **OfferTerm** as vector search enabled data model.

1. In VS Code, navigate to the **Banking** project.
1. Navigate to the **/Models** folder.
1. Review the **OfferTerm.cs** class. Notice Vector attribute is of type `ReadOnlyMemory<float>`


### Initialize the Embedding client to vectorize terms

1. Remain in the **Banking** project.
1. Open the the **Services/EmbeddingService.cs** file.
1. Search for **//TO DO: Update GenerateEmbeddingAsync** and replace the code for **GenerateEmbeddingAsync()** method with the code 

```csharp
        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {

            var embeddingClient = _client.GetEmbeddingClient(_deployment);
            var result = await embeddingClient.GenerateEmbeddingsAsync(new List<string> { text });
            var vector = result.Value[0].ToFloats().ToArray();

            return vector;

        }
```
### Update BankingDataService to include vector search
1. Remain in the **Banking** project.
1. Open the **Services/BankingDataService.cs** file.
1. Search for **//TO DO: Update SearchOfferTermsAsync** and replace the code for **SearchOfferTermsAsync()** method with the code below.

```csharp
        public async Task<List<OfferTerm>> SearchOfferTermsAsync(string tenantId, AccountType accountType, string requirementDescription)
        {
            try
            {

                // Generate embeddings for the requirement description
                var queryVector = await _embeddingService.GenerateEmbeddingAsync(requirementDescription);


                // Build the vector search query with filters
                var query = new QueryDefinition(@"
                            SELECT 
                                c.id, 
                                c.tenantId, 
                                c.offerId, 
                                c.name, 
                                c.text, 
                                c.type, 
                                c.accountType, 
                                VectorDistance(c.vector, @queryVector) AS similarityScore
                            FROM c 
                            WHERE c.type = @type 
                              AND c.tenantId = @tenantId 
                              AND c.accountType = @accountType
                            ORDER BY VectorDistance(c.vector, @queryVector)
                        ")
                .WithParameter("@queryVector", queryVector)
                .WithParameter("@type", "Term")
                .WithParameter("@tenantId", tenantId)
                .WithParameter("@accountType", accountType.ToString());

                // Define partition key
                var partitionKey = new PartitionKey(tenantId);

                // Run query
                var offerTerms = new List<OfferTerm>();
                using (FeedIterator<OfferTerm> feedIterator = _offerData.GetItemQueryIterator<OfferTerm>(
                    query,
                    requestOptions: new QueryRequestOptions
                    {
                        PartitionKey = partitionKey,
                        MaxItemCount = 10 // Limit for performance
                    }))
                {
                    while (feedIterator.HasMoreResults)
                    {
                        FeedResponse<OfferTerm> response = await feedIterator.ReadNextAsync();
                        offerTerms.AddRange(response);
                    }
                }

                return offerTerms;

            }
            catch (Exception ex)
            {
                _logger.LogError("Error searching offer terms: {Message}", ex.Message);
                return new List<OfferTerm>();
            }
        }
```


## Activity 7: Test your Work

With the activities in this module complete, it is time to test your work.

### Start the Backend

1. Return to the open terminal for the backend app in VS Code. Ensure you are in `01_exercises\csharp\src\MultiAgentCopilot`. Type `dotnet run`

### Start a Chat Session

1. Return to the frontend application in your browser.
1. Send the below message to test the current *Coordinator* AgentType.
```text
I'm looking for a high interest savings account
```
1. View the response in the frontend.
1. Return to VS Code, Notice the output in the terminal showing the action taken by the Coordinator Agent to your prompt.
1. Within the backend terminal, press **Ctrl + C** to stop the backend application.
1. Locate this line of code, *var agentName="Coordinator";* in **\Services\AgentFrameworkService.cs**
1. Replace it with the line of code below.

```csharp
var agentName="Sales";
```

1. Return to the open terminal for the backend app in VS Code and type `dotnet run`
1. Return to the frontend application in your browser.
1. Send the same message to test the current *Sales* AgentType.
```text
I'm looking for a high interest savings account
```
1. View the response in the frontend.

 
### Stop the Application

1. Within the backend terminal, press **Ctrl + C** to stop the backend application.

## Validation Checklist

- [ ] Each Agent response is per the corresponding prompty file contents and the Tool functions.
- [ ] Semantic Search functions correctly

## Module Solution

The following sections include the completed code for this Module. Copy and paste these into your project if you run into issues and cannot resolve.

<details>
  <summary>Completed code for <strong>\Services\AgentFrameworkService.cs</strong></summary>
<br>

```csharp
using Azure.AI.OpenAI;
using Azure.Identity;
using Banking.Services;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Workflows;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Protocol;
using MultiAgentCopilot.Factories;
using MultiAgentCopilot.Models.Chat;
using MultiAgentCopilot.Models.Configuration;
using MultiAgentCopilot.Models.Debug;
using MultiAgentCopilot.MultiAgentCopilot.Factories;
using MultiAgentCopilot.MultiAgentCopilot.Helper;
using MultiAgentCopilot.MultiAgentCopilot.Services;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel.Primitives;
using System.Diagnostics.Metrics;
using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;
using ChatMessage = Microsoft.Extensions.AI.ChatMessage;
using OpenAI.Embeddings;

namespace MultiAgentCopilot.Services;

/// <summary>
/// Service responsible for managing AI agents and orchestrating multi-agent conversations
/// using the Microsoft Agents AI framework.
/// </summary>
public class AgentFrameworkService : IDisposable
{
    #region Private Fields
    
    private readonly AgentFrameworkServiceSettings _settings;
    private readonly ILoggerFactory _loggerFactory;
    private readonly ILogger<AgentFrameworkService> _logger;
    private readonly IChatClient _chatClient;
    
    private BankingDataService? _bankService;
    private MCPToolService? _mcpService;
    private List<AIAgent>? _agents;
    private List<LogProperty> _promptDebugProperties;
    
    private bool _serviceInitialized = false;

    #endregion

    #region Properties

    public bool IsInitialized => _serviceInitialized;

    #endregion

    #region Constructor

    public AgentFrameworkService(
        IOptions<AgentFrameworkServiceSettings> options,
        ILoggerFactory loggerFactory)
    {
        _settings = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _logger = _loggerFactory.CreateLogger<AgentFrameworkService>();
        _promptDebugProperties = new List<LogProperty>();


        _chatClient = CreateChatClient();

        _logger.LogInformation("Agent Framework Initialized.");

        Task.Run(Initialize).ConfigureAwait(false);
    }

    #endregion

    #region Private Methods


    /// <summary>
    /// Creates and configures the Azure OpenAI chat client.
    /// </summary>
    /// 
    //TO DO: CreateChatClient
    private IChatClient CreateChatClient()
    {
        try
        {
            var credential = CreateAzureCredential();
            var endpoint = new Uri(_settings.AzureOpenAISettings.Endpoint);
            var openAIClient = new AzureOpenAIClient(endpoint, credential, new AzureOpenAIClientOptions
            {
                Transport = new HttpClientPipelineTransport(),
            });
    
            return openAIClient
                .GetChatClient(_settings.AzureOpenAISettings.CompletionsDeployment)
                .AsIChatClient();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create chat client");
            throw;
        }
    }



    public string GetEmbeddingDeploymentName()
    {
        return _settings.AzureOpenAISettings.EmbeddingsDeployment;
    }

    /// <summary>
    /// Creates the appropriate Azure credential based on configuration.
    /// </summary>
    private DefaultAzureCredential CreateAzureCredential()
    {
        if (string.IsNullOrEmpty(_settings.AzureOpenAISettings.UserAssignedIdentityClientID))
        {
            return new DefaultAzureCredential();
        }
        
        return new DefaultAzureCredential(new DefaultAzureCredentialOptions
        {
            ManagedIdentityClientId = _settings.AzureOpenAISettings.UserAssignedIdentityClientID
        });
    }

    /// <summary>
    /// Logs messages for debugging purposes.
    /// </summary>
    private void LogMessage(string key, string value)
    {
        _promptDebugProperties.Add(new LogProperty(key, value));
    }

    /// <summary>
    /// Initializes the service asynchronously.
    /// </summary>
    private Task Initialize()
    {
        try
        {
            _serviceInitialized = true;
            _logger.LogInformation("Agent Framework service initialized.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Agent Framework service was not initialized. Error: {ErrorMessage}", ex.Message);
        }
        return Task.CompletedTask;
    }

    #endregion


    #region Public Methods

    //TO DO: Add SetInProcessToolService
        /// <summary>
    /// Sets the in-process tool service for banking operations.
    /// </summary>
    /// <param name="bankService">The banking data service instance.</param>
    /// <returns>True if the service was set successfully.</returns>
    
    public bool SetInProcessToolService(BankingDataService bankService)
    {
        _bankService = bankService ?? throw new ArgumentNullException(nameof(bankService));
        _logger.LogInformation("InProcessToolService has been set.");
        return true;
    }


    //TO DO: Add SetMCPToolService

    ////TO DO: Add RunGroupChatOrchestration

    /// <summary>
    /// Initializes the AI agents based on available tool services.
    /// </summary>
    /// <returns>True if agents were initialized successfully.</returns>
    public bool InitializeAgents()
    {
        try
        {

            if (_agents == null || _agents.Count == 0)
            {
                //TO DO: Add In Process Tools
                if (_bankService != null)
                {
                    _agents = AgentFactory.CreateAllAgentsWithInProcessTools(_chatClient, _bankService, _loggerFactory);
                }

                //TO DO: Add MCP Service Option


                if (_agents == null || _agents.Count == 0)
                {
                    _logger.LogError("No agents available for orchestration");
                    return false;
                }

                _logger.LogInformation("Successfully initialized {AgentCount} agents", _agents.Count);

                // Log agent details
                foreach (var agent in _agents)
                {
                    _logger.LogInformation("Agent: {AgentName}, Description: {Description}",
                        agent.Name, agent.Description);
                }
            }
            else
            {
                _logger.LogInformation("Agents already initialized ({AgentCount} agents available)", _agents.Count);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize agents: {ExceptionMessage}", ex.Message);
            return false;
        }
    }

    /// <summary>
    /// Processes a user message and returns the agent's response.
    /// </summary>
    /// <param name="userMessage">The user's message.</param>
    /// <param name="messageHistory">The conversation history.</param>
    /// <param name="bankService">The banking data service.</param>
    /// <param name="tenantId">The tenant identifier.</param>
    /// <param name="userId">The user identifier.</param>
    /// <returns>A tuple containing the response messages and debug logs.</returns>
    /// 
    //TO DO: Add GetResponse function
    
    public async Task<Tuple<List<Message>, List<DebugLog>>> GetResponse(
        Message userMessage,
        List<Message> messageHistory,
        BankingDataService bankService,
        string tenantId,
        string userId)
    {
        try
        {

            messageHistory.Add(userMessage);
            var chatHistory = ConvertToAIChatMessages(messageHistory);
            chatHistory.Add(new ChatMessage(ChatRole.User, userMessage.Text));
            var agentName="Sales";
            var bankAgent = _agents.FirstOrDefault(s => s.Name == agentName);
            var responseText = bankAgent.RunAsync(chatHistory).GetAwaiter().GetResult().Text;
            return CreateResponseTuple(userMessage, responseText, agentName);
            
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when getting response: {ErrorMessage}", ex.Message);
            return new Tuple<List<Message>, List<DebugLog>>(new List<Message>(), new List<DebugLog>());
        }
    }

    /// <summary>
    /// Summarizes the given text.
    /// </summary>
    /// <param name="sessionId">The session identifier.</param>
    /// <param name="userPrompt">The text to summarize.</param>
    /// <returns>A summarized version of the text.</returns>
    /// 
    //TO DO: Add Summarize function
    
    public async Task<string> Summarize(string sessionId, string userPrompt)
    {
        try
        {
            var agent = _chatClient.CreateAIAgent(
                "Summarize the text into exactly two words:", 
                "Summarizer");

            return agent.RunAsync(userPrompt).GetAwaiter().GetResult().Text;        
        
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when getting response: {ErrorMessage}", ex.Message);
            return string.Empty;
        }
    }   


    /// <summary>
    /// Disposes of the service resources.
    /// </summary>
    public void Dispose()
    {
        _mcpService?.Dispose();
        GC.SuppressFinalize(this);
    }

    #endregion

    #region Private Helper Methods

    /// <summary>
    /// Converts message history to AI chat message format.
    /// </summary>
    private List<ChatMessage> ConvertToAIChatMessages(List<Message> messageHistory)
    {
        var chatHistory = new List<ChatMessage>();
        
        foreach (var msg in messageHistory)
        {
            var role = msg.SenderRole.ToLowerInvariant() switch
            {
                "user" => ChatRole.User,
                "assistant" => ChatRole.Assistant,
                "system" => ChatRole.System,
                _ => ChatRole.User
            };

            chatHistory.Add(new ChatMessage(role, msg.Text));
        }

        return chatHistory;
    }

    /// <summary>
    /// Creates a response tuple with message and debug log.
    /// </summary>
    private Tuple<List<Message>, List<DebugLog>> CreateResponseTuple(
        Message userMessage, 
        string responseText, 
        string selectedAgentName)
    {
        var completionMessages = new List<Message>();
        var completionMessagesLogs = new List<DebugLog>();

        string messageId = Guid.NewGuid().ToString();
        string debugLogId = Guid.NewGuid().ToString();

        var responseMessage = new Message(
            userMessage.TenantId,
            userMessage.UserId,
            userMessage.SessionId,
            selectedAgentName,
            "Assistant",
            responseText,
            messageId,
            debugLogId);

        completionMessages.Add(responseMessage);

        if (_promptDebugProperties.Count > 0)
        {
            var debugLog = new DebugLog(userMessage.TenantId, userMessage.UserId, userMessage.SessionId, messageId, debugLogId)
            {
                PropertyBag = _promptDebugProperties.ToList()
            };
            completionMessagesLogs.Add(debugLog);
        }

        return new Tuple<List<Message>, List<DebugLog>>(completionMessages, completionMessagesLogs);
    }

    /// <summary>
    /// Runs the workflow asynchronously and returns the response messages and selected agent.
    /// </summary>
    private async Task<(List<ChatMessage> messages, string selectedAgent)> RunWorkflowAsync(
        Workflow workflow, 
        List<ChatMessage> messages)
    {
        try
        {

            string? lastExecutorId = null;
            string selectedAgent = "__";
            int counter = 0;

            while (selectedAgent == "__" && counter<5)
            {
                await using StreamingRun run = await InProcessExecution.StreamAsync(workflow, messages);
               
                await run.TrySendMessageAsync(new TurnToken(emitEvents: true));

                await foreach (WorkflowEvent evt in run.WatchStreamAsync().ConfigureAwait(false))               
                {
                    switch (evt)
                    {
                        case AgentRunUpdateEvent e when e.ExecutorId != lastExecutorId:
                            lastExecutorId = e.ExecutorId;
                            selectedAgent = ExtractAgentNameFromExecutorId(e.ExecutorId) ?? "__";
                            break;

                        case WorkflowOutputEvent output:
                            return (output.As<List<ChatMessage>>()!, selectedAgent);
                    }
                }
                
                counter++;
            }
            return ([], selectedAgent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during workflow execution: {ErrorMessage}", ex.Message);
            return ([], "Error");
        }
    }



    /// <summary>
    /// Extracts the agent name from the executor ID by removing the GUID suffix.
    /// </summary>
    private static string? ExtractAgentNameFromExecutorId(string? executorId)
    {
        if (string.IsNullOrEmpty(executorId))
            return null;

        var parts = executorId.Split('_');
        return parts.Length > 0 ? parts[0] : executorId;
    }

    //TO DO: Add RunGroupChatOrchestration
    


    /// <summary>
    /// Creates a custom termination function for the group chat orchestrator.
    /// </summary>
    private Func<GroupChatWorkflowHelper, IEnumerable<ChatMessage>, CancellationToken, ValueTask<bool>> CreateCustomTerminationFunction()
    {
        return async (orchestrator, messages, token) =>
        {
            try
            {
                // The AI-based termination logic is implemented in the GroupChatOrchestrator
                // This function allows for additional business logic if needed
                return false; // Let the AI make the decision
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in custom termination function");
                return false; // Continue conversation on error
            }
        };
    }

    /// <summary>
    /// Extracts the response text from the last assistant message.
    /// </summary>
    private static string ExtractResponseText(List<ChatMessage> responseMessages)
    {
        if (responseMessages?.Any() == true)
        {
            var lastAssistantMessage = responseMessages.LastOrDefault(m => m.Role == ChatRole.Assistant);
            return lastAssistantMessage?.Text ?? "";
        }
        return "";
    }

    #endregion

    public AzureOpenAIClient GetAzureOpenAIClient()
    {
        try
        {
            var credential = CreateAzureCredential();
            var endpoint = new Uri(_settings.AzureOpenAISettings.Endpoint);
            return new AzureOpenAIClient(endpoint, credential);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create AzureOpenAI client");
            throw;
        }
    }
}

```
</details>
<details>
  <summary>Completed code for <strong>\Services\ChatService.cs</strong></summary>
<br>

```csharp
using Banking.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MultiAgentCopilot.Models.Chat;
using MultiAgentCopilot.Models.Configuration;
using MultiAgentCopilot.Models.Debug;
using MultiAgentCopilot.MultiAgentCopilot.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenAI.Embeddings;
using System.Text.Json;
using OpenAI;
namespace MultiAgentCopilot.Services;

public class ChatService
{
    private readonly CosmosDBService _cosmosDBService;
    private readonly BankingDataService _bankService;
    private readonly MCPToolService _mcpService;
    private readonly  AgentFrameworkService _afService;
    private readonly ILogger _logger;


    public ChatService(
        IOptions<CosmosDBSettings> cosmosOptions,
        IOptions<AgentFrameworkServiceSettings> afOptions,
        CosmosDBService cosmosDBService,
        AgentFrameworkService afService,
        MCPToolService mcpService,
        ILoggerFactory loggerFactory)
    {
        _cosmosDBService = cosmosDBService;
        _afService = afService;
        _mcpService = mcpService;

        _logger = loggerFactory.CreateLogger<ChatService>();

        // Initialize the Agent Framework with tool service
        if (afOptions.Value.UseMCPTools)
        {

            //MCP tools
            // TO DO: Invoke SetMCPToolService
        }
        else
        {
            //In-Process Tools
            //TO DO: Invoke SetInProcessToolService
            var embeddingClient = _afService.GetAzureOpenAIClient();
            var embeddingDeployment = _afService.GetEmbeddingDeploymentName();
            EmbeddingService embeddingService = new EmbeddingService(embeddingClient, embeddingDeployment);
            _bankService = new BankingDataService(embeddingService, cosmosDBService.Database, cosmosDBService.AccountDataContainer, cosmosDBService.UserDataContainer, cosmosDBService.AccountDataContainer, cosmosDBService.OfferDataContainer, loggerFactory);

            _afService.SetInProcessToolService(_bankService);


        }

        if (!_afService.InitializeAgents())
            _logger.LogWarning("No agents initialized in ChatService.");

       
    }

    /// <summary>
    /// Returns list of chat session ids and names.
    /// </summary>
    public async Task<List<Session>> GetAllChatSessionsAsync(string tenantId, string userId)
    {
        return await _cosmosDBService.GetUserSessionsAsync(tenantId, userId);
    }

    /// <summary>
    /// Returns the chat messages related to an existing session.
    /// </summary>
    public async Task<List<Message>> GetChatSessionMessagesAsync(string tenantId, string userId, string sessionId)
    {
        ArgumentNullException.ThrowIfNull(sessionId);
        return await _cosmosDBService.GetSessionMessagesAsync(tenantId, userId, sessionId);
    }

    /// <summary>
    /// Creates a new chat session.
    /// </summary>
    public async Task<Session> CreateNewChatSessionAsync(string tenantId, string userId)
    {
        Session session = new(tenantId, userId);
        return await _cosmosDBService.InsertSessionAsync(session);
    }

    /// <summary>
    /// Rename the chat session from its default (eg., "New Chat") to the summary provided by OpenAI.
    /// </summary>
    public async Task<Session> RenameChatSessionAsync(string tenantId, string userId, string sessionId, string newChatSessionName)
    {
        ArgumentNullException.ThrowIfNull(sessionId);
        ArgumentException.ThrowIfNullOrEmpty(newChatSessionName);

        return await _cosmosDBService.UpdateSessionNameAsync(tenantId, userId, sessionId, newChatSessionName);
    }

    /// <summary>
    /// Delete a chat session and related messages.
    /// </summary>
    public async Task DeleteChatSessionAsync(string tenantId, string userId, string sessionId)
    {
        ArgumentNullException.ThrowIfNull(sessionId);
        await _cosmosDBService.DeleteSessionAndMessagesAsync(tenantId, userId, sessionId);
    }

    /// <summary>
    /// Receive a prompt from a user, vectorize it from the OpenAI service, and get a completion from the OpenAI service.
    /// </summary>
    public async Task<List<Message>> GetChatCompletionAsync(string tenantId, string userId, string? sessionId, string userPrompt)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(sessionId);

            // Retrieve conversation, including latest prompt.
            var archivedMessages = await _cosmosDBService.GetSessionMessagesAsync(tenantId, userId, sessionId);

            // Add both prompt and completion to cache, then persist in Cosmos DB
            var userMessage = new Message(tenantId, userId, sessionId, "User", "User", userPrompt);

            // Generate the completion to return to the user
            var result = await _afService.GetResponse(userMessage, archivedMessages, _bankService, tenantId, userId);

            await AddPromptCompletionMessagesAsync(tenantId, userId, sessionId, userMessage, result.Item1, result.Item2);

            return result.Item1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting completion in session {sessionId} for user prompt [{userPrompt}].");
            return new List<Message> { new Message(tenantId, userId, sessionId!, "Error", "Error", $"Error getting completion in session {sessionId} for user prompt [{userPrompt}].") };
        }
    }



    //TO DO: Add AddPromptCompletionMessagesAsync
    
    /// <summary>
    /// Add user prompt and AI assistance response to the chat session message list object and insert into the data service as a transaction.
    /// </summary>
    ///
    private async Task AddPromptCompletionMessagesAsync(string tenantId, string userId, string sessionId, Message promptMessage, List<Message> completionMessages, List<DebugLog> completionMessageLogs)
    {
        var session = await _cosmosDBService.GetSessionAsync(tenantId, userId, sessionId);
    
        completionMessages.Insert(0, promptMessage);
        await _cosmosDBService.UpsertSessionBatchAsync(completionMessages, completionMessageLogs, session);
    }

    /// <summary>
    /// Generate a name for a chat message, based on the passed in prompt.
    /// </summary>
    public async Task<string> SummarizeChatSessionNameAsync(string tenantId, string userId, string? sessionId, string prompt)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(sessionId);

            var summary = await _afService.Summarize(sessionId, prompt);

            var session = await RenameChatSessionAsync(tenantId, userId, sessionId, summary);

            return session.Name;
        }
        catch (Exception ex)
        {

            _logger.LogError(ex, $"Error getting a summary in session {sessionId} for user prompt [{prompt}].");
            return $"Error getting a summary in session {sessionId} for user prompt [{prompt}].";
        }

    }


    /// <summary>
    /// Rate an assistant message. This can be used to discover useful AI responses for training, discoverability, and other benefits down the road.
    /// </summary>
    public async Task<Message> RateChatCompletionAsync(string tenantId, string userId, string messageId, string sessionId, bool? rating)
    {
        ArgumentNullException.ThrowIfNull(messageId);
        ArgumentNullException.ThrowIfNull(sessionId);

        return await _cosmosDBService.UpdateMessageRatingAsync(tenantId, userId, sessionId, messageId, rating);
    }

    public async Task<DebugLog> GetChatCompletionDebugLogAsync(string tenantId, string userId, string sessionId, string debugLogId)
    {
        ArgumentException.ThrowIfNullOrEmpty(sessionId);
        ArgumentException.ThrowIfNullOrEmpty(debugLogId);

        return await _cosmosDBService.GetChatCompletionDebugLogAsync(tenantId, userId, sessionId, debugLogId);
    }





}

```
</details>
<details>
  <summary>Completed code for <strong>\Banking\Services\EmbeddingService.cs</strong></summary>
<br>

```csharp
using Azure.AI.OpenAI;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Banking.Services
{

    public class EmbeddingService
    {
        private readonly AzureOpenAIClient _client;
        private readonly string _deployment;

        public EmbeddingService(AzureOpenAIClient client, string deployment)
        {
            _client = client;
            _deployment = deployment;
        }

        //TO DO: Update GenerateEmbeddingAsync
        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {

            var embeddingClient = _client.GetEmbeddingClient(_deployment);
            var result = await embeddingClient.GenerateEmbeddingsAsync(new List<string> { text });
            var vector = result.Value[0].ToFloats().ToArray();

            return vector;

        }
    }
}



```
</details>
<details>
  <summary>Completed code for <strong>\Banking\Services\BankingDataService.cs</strong></summary>
<br>

```csharp
using Azure.Identity;
using Banking.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Fluent;
using Microsoft.Azure.Cosmos.Linq;
using Microsoft.Extensions.Logging;
using OpenAI;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json;
using Banking.Helper;
using Container = Microsoft.Azure.Cosmos.Container;
using PartitionKey = Microsoft.Azure.Cosmos.PartitionKey;

namespace Banking.Services
{
    public class BankingDataService
    {
        private readonly EmbeddingService _embeddingService;
        private readonly Container _accountData;
        private readonly Container _userData;
        private readonly Container _requestData;
        private readonly Container _offerData;

        private readonly Database _database;

        private readonly ILogger _logger;

        public bool IsInitialized { get; private set; }


        public BankingDataService(EmbeddingService embeddingService,
            Database database, Container accountData, Container userData, Container requestData, Container offerData, ILoggerFactory loggerFactory)
        {

            _database = database;
            _accountData = accountData;
            _userData = userData;
            _requestData = requestData;
            _offerData = offerData;
            _embeddingService = embeddingService;

            _logger = loggerFactory.CreateLogger<BankingDataService>();
                        
            _logger.LogInformation("Banking service initialized.");
        }

        public async Task<BankUser> GetUserAsync(string tenantId, string userId)
        {
            try
            {
                var partitionKey = PartitionManager.GetUserDataFullPK(tenantId);

                return await _userData.ReadItemAsync<BankUser>(
                       id: userId,
                       partitionKey: partitionKey);
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error getting user: {Message}", ex.Message);
                return null;
            }
        }

        public async Task<List<BankAccount>> GetUserRegisteredAccountsAsync(string tenantId, string userId)
        {
            try
            {
                QueryDefinition query = new QueryDefinition("SELECT * FROM c WHERE c.type = @type and c.userId=@userId")
                     .WithParameter("@type", nameof(BankAccount))
                     .WithParameter("@userId", userId);

                var partitionKey = PartitionManager.GetAccountsPartialPK(tenantId);
                FeedIterator<BankAccount> response = _accountData.GetItemQueryIterator<BankAccount>(query, null, new QueryRequestOptions() { PartitionKey = partitionKey });

                List<BankAccount> output = new();
                while (response.HasMoreResults)
                {
                    FeedResponse<BankAccount> results = await response.ReadNextAsync();
                    output.AddRange(results);
                }

                return output;
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error getting user registered accounts: {Message}", ex.Message);
                return null;
            }
        }

        public async Task<BankAccount> GetAccountDetailsAsync(string tenantId, string userId, string accountId)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(tenantId, accountId);

                return await _accountData.ReadItemAsync<BankAccount>(
                       id: accountId,
                       partitionKey: partitionKey);
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error getting account details: {Message}", ex.Message);
                return null;
            }
        }

        public async Task<List<BankTransaction>> GetTransactionsAsync(string tenantId, string accountId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(tenantId, accountId);

                QueryDefinition queryDefinition = new QueryDefinition(
                       "SELECT * FROM c WHERE c.accountId = @accountId AND c.transactionDateTime >= @startDate AND c.transactionDateTime <= @endDate AND c.type = @type")
                       .WithParameter("@accountId", accountId)
                       .WithParameter("@type", nameof(BankTransaction))
                       .WithParameter("@startDate", startDate)
                       .WithParameter("@endDate", endDate);

                List<BankTransaction> transactions = new List<BankTransaction>();
                using (FeedIterator<BankTransaction> feedIterator = _accountData.GetItemQueryIterator<BankTransaction>(queryDefinition, requestOptions: new QueryRequestOptions { PartitionKey = partitionKey }))
                {
                    while (feedIterator.HasMoreResults)
                    {
                        FeedResponse<BankTransaction> response = await feedIterator.ReadNextAsync();
                        transactions.AddRange(response);
                    }
                }

                return transactions;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogError("Error getting transactions: {Message}", ex.Message);
                return new List<BankTransaction>();
            }
        }

        public async Task<ServiceRequest> CreateFundTransferRequestAsync(string tenantId, string accountId, string userId, string requestAnnotation, string recipientEmail, string recipientPhone, decimal debitAmount)
        {
            var req = new ServiceRequest(ServiceRequestType.FundTransfer, tenantId, accountId, userId, requestAnnotation, recipientEmail, recipientPhone, debitAmount, DateTime.MinValue, null);
            return await AddServiceRequestAsync(req);
        }

        public async Task<ServiceRequest> CreateTeleBankerRequestAsync(string tenantId, string accountId, string userId, string requestAnnotation, DateTime scheduledDateTime)
        {
            var req = new ServiceRequest(ServiceRequestType.TeleBankerCallBack, tenantId, accountId, userId, requestAnnotation, string.Empty, string.Empty, 0, scheduledDateTime, null);
            return await AddServiceRequestAsync(req);
        }

        public Task<string> GetTeleBankerAvailabilityAsync()
        {
            return Task.FromResult("Monday to Friday, 8 AM to 8 PM Pacific Time");
        }

        public async Task<ServiceRequest> CreateComplaintAsync(string tenantId, string accountId, string userId, string requestAnnotation)
        {
            var req = new ServiceRequest(ServiceRequestType.Complaint, tenantId, accountId, userId, requestAnnotation, string.Empty, string.Empty, 0, DateTime.MinValue, null);
            return await AddServiceRequestAsync(req);
        }

        public async Task<ServiceRequest> CreateFulfilmentRequestAsync(string tenantId, string accountId, string userId, string requestAnnotation, Dictionary<string, string> fulfilmentDetails)
        {
            var req = new ServiceRequest(ServiceRequestType.Fulfilment, tenantId, accountId, userId, requestAnnotation, string.Empty, string.Empty, 0, DateTime.MinValue, fulfilmentDetails);
            return await AddServiceRequestAsync(req);
        }

        private async Task<ServiceRequest> AddServiceRequestAsync(ServiceRequest req)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(req.TenantId, req.AccountId);
                ItemResponse<ServiceRequest> response = await _accountData.CreateItemAsync(req, partitionKey);
                return response.Resource;
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error adding service request: {Message}", ex.Message);
                return null;
            }
        }

        public async Task<List<ServiceRequest>> GetServiceRequestsAsync(string tenantId, string accountId, string? userId = null, ServiceRequestType? SRType = null)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(tenantId, accountId);

                var queryBuilder = new StringBuilder("SELECT * FROM c WHERE c.type = @type");
                var queryDefinition = new QueryDefinition(queryBuilder.ToString())
                      .WithParameter("@type", nameof(ServiceRequest));

                if (!string.IsNullOrEmpty(userId))
                {
                    queryBuilder.Append(" AND c.userId = @userId");
                    queryDefinition = queryDefinition.WithParameter("@userId", userId);
                }

                if (SRType.HasValue)
                {
                    queryBuilder.Append(" AND c.SRType = @SRType");
                    queryDefinition = queryDefinition.WithParameter("@SRType", SRType);
                }

                List<ServiceRequest> reqs = new List<ServiceRequest>();
                using (FeedIterator<ServiceRequest> feedIterator = _requestData.GetItemQueryIterator<ServiceRequest>(queryDefinition, requestOptions: new QueryRequestOptions { PartitionKey = partitionKey }))
                {
                    while (feedIterator.HasMoreResults)
                    {
                        FeedResponse<ServiceRequest> response = await feedIterator.ReadNextAsync();
                        reqs.AddRange(response);
                    }
                }

                return reqs;
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error getting service requests: {Message}", ex.Message);
                return new List<ServiceRequest>();
            }
        }

        public async Task<bool> AddServiceRequestDescriptionAsync(string tenantId, string accountId, string requestId, string annotationToAdd)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(tenantId, accountId);

                var patchOperations = new List<PatchOperation>
                {
                    PatchOperation.Add("/requestAnnotations/-", $"[{DateTime.Now.ToUniversalTime().ToString()}] : {annotationToAdd}")
                };

                ItemResponse<ServiceRequest> response = await _requestData.PatchItemAsync<ServiceRequest>(
                    id: requestId,
                    partitionKey: partitionKey,
                    patchOperations: patchOperations
                );

                return true;
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error adding service request description: {Message}", ex.Message);
                return false;
            }
        }


        //TO DO: Update SearchOfferTermsAsync
        public async Task<List<OfferTerm>> SearchOfferTermsAsync(string tenantId, AccountType accountType, string requirementDescription)
        {
            try
            {

                // Generate embeddings for the requirement description
                var queryVector = await _embeddingService.GenerateEmbeddingAsync(requirementDescription);


                // Build the vector search query with filters
                var query = new QueryDefinition(@"
                            SELECT 
                                c.id, 
                                c.tenantId, 
                                c.offerId, 
                                c.name, 
                                c.text, 
                                c.type, 
                                c.accountType, 
                                VectorDistance(c.vector, @queryVector) AS similarityScore
                            FROM c 
                            WHERE c.type = @type 
                              AND c.tenantId = @tenantId 
                              AND c.accountType = @accountType
                            ORDER BY VectorDistance(c.vector, @queryVector)
                        ")
                .WithParameter("@queryVector", queryVector)
                .WithParameter("@type", "Term")
                .WithParameter("@tenantId", tenantId)
                .WithParameter("@accountType", accountType.ToString());

                // Define partition key
                var partitionKey = new PartitionKey(tenantId);

                // Run query
                var offerTerms = new List<OfferTerm>();
                using (FeedIterator<OfferTerm> feedIterator = _offerData.GetItemQueryIterator<OfferTerm>(
                    query,
                    requestOptions: new QueryRequestOptions
                    {
                        PartitionKey = partitionKey,
                        MaxItemCount = 10 // Limit for performance
                    }))
                {
                    while (feedIterator.HasMoreResults)
                    {
                        FeedResponse<OfferTerm> response = await feedIterator.ReadNextAsync();
                        offerTerms.AddRange(response);
                    }
                }

                return offerTerms;

            }
            catch (Exception ex)
            {
                _logger.LogError("Error searching offer terms: {Message}", ex.Message);
                return new List<OfferTerm>();
            }
        }

        public async Task<Offer> GetOfferDetailsAsync(string tenantId, string offerId)
        {
            try
            {
                var partitionKey = new PartitionKey(tenantId);

                return await _offerData.ReadItemAsync<Offer>(
                       id: offerId,
                       partitionKey: new PartitionKey(tenantId));
            }
            catch (CosmosException ex)
            {
                _logger.LogError("Error getting offer details: {Message}", ex.Message);
                return null;
            }
        }
        
    }
}

```
</details>
<details>
  <summary>Completed code for <strong>\MultiAgentCopilot\Factories\AgentFactory.cs</strong></summary>
<br>

```csharp
using Azure.Core;
using Banking.Services;
using Microsoft.Agents.AI;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.Extensions.AI;
using MultiAgentCopilot.Models;
using MultiAgentCopilot.MultiAgentCopilot.Services;
using MultiAgentCopilot.Services;
using MultiAgentCopilot.Tools;
using OpenAI;
using OpenAI.Chat;
using OpenAI.Responses;
using System;
using System.Buffers.Text;
using System.ComponentModel;
using System.Net.Http;
using System.Reflection;
using System.Text.Json;

namespace MultiAgentCopilot.Factories
{
    /// <summary>
    /// Diagnostics information for MCP integration validation
    /// </summary>
    public class AgentMCPDiagnostics
    {
        public AgentType AgentType { get; set; }
        public string AgentName { get; set; } = string.Empty;
        public bool IsConfigured { get; set; }
        public bool IsConnected { get; set; }
        public string? ServerUrl { get; set; }
        public int ToolCount { get; set; }
        public List<string> Tools { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public static class AgentFactory
    {
        //TO DO: Add Agent Creation with Tools
               /// <summary>
        /// Create all banking agents with proper instructions and tools
        /// </summary>
        public static List<AIAgent> CreateAllAgentsWithInProcessTools(IChatClient chatClient, BankingDataService bankService, ILoggerFactory loggerFactory)
        {           

            var agents = new List<AIAgent>();
            ILogger logger = loggerFactory.CreateLogger("AgentFactory");

            // Get all agent types from the enum
            var agentTypes = Enum.GetValues<AgentType>();

            // Create agents for each agent type
            foreach (var agentType in agentTypes)
            {
                logger.LogInformation("Creating agent {AgentType} with InProcess tools", agentType);
                
                var aiFunctions = GetInProcessAgentTools(agentType, bankService, loggerFactory).ToArray();

                var agent = chatClient.CreateAIAgent(
                        instructions: GetAgentPrompt(agentType),
                        name: GetAgentName(agentType),
                        description: GetAgentDescription(agentType)
                    );

                agents.Add(agent);
                logger.LogInformation("Created agent {AgentName} with {ToolCount} InProcess", agent.Name, aiFunctions.Count());
            }

            logger.LogInformation("Successfully created {AgentCount} banking agents", agents.Count);
            return agents;
        }

        //TO DO: Add Agent Creation with MCP Tools

        //TO DO: Add Agent Details
                /// <summary>
        /// Get agent prompt based on type
        /// </summary>
        private static string GetAgentPrompt(AgentType agentType)
        {
            string promptFile = $"{GetAgentName(agentType)}.prompty";

            string prompt = $"{File.ReadAllText($"Prompts/{promptFile}")}{File.ReadAllText("Prompts/CommonAgentRules.prompty")}";

            return prompt;
        }

        /// <summary>
        /// Get agent name based on type
        /// </summary>
        public static string GetAgentName(AgentType agentType)
        {
            return agentType switch
            {
                AgentType.Sales => "Sales",
                AgentType.Transactions => "Transactions",
                AgentType.CustomerSupport => "CustomerSupport",
                AgentType.Coordinator => "Coordinator",
                _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
            };
        }

        /// <summary>
        /// Get agent description
        /// </summary>
        private static string GetAgentDescription(AgentType agentType)
        {
            return agentType switch
            {
                AgentType.Sales => "Handles sales inquiries, account registration, and offers",
                AgentType.Transactions => "Manages transactions, transfers, and transaction history",
                AgentType.CustomerSupport => "Provides customer support, handles complaints and service requests",
                AgentType.Coordinator => "Coordinates and routes requests to appropriate agents",
                _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
            };
        }


        //TO DO: Create Agent Tools
                /// <summary>
        /// Get tools for specific agent type using existing tool classes
        /// </summary>
        private static IList<AIFunction>? GetInProcessAgentTools(AgentType agentType, BankingDataService bankService, ILoggerFactory loggerFactory)
        {
            ILogger logger = loggerFactory.CreateLogger<AgentFrameworkService>();
            try
            {
                logger.LogInformation("Creating in-process tools for agent type: {AgentType}", agentType);

                // Create the appropriate tools class based on agent type
                BaseTools toolsClass = agentType switch
                {
                    AgentType.Sales => new SalesTools(loggerFactory.CreateLogger<SalesTools>(), bankService),
                    AgentType.Transactions => new TransactionTools(loggerFactory.CreateLogger<TransactionTools>(), bankService),
                    AgentType.CustomerSupport => new CustomerSupportTools(loggerFactory.CreateLogger<CustomerSupportTools>(), bankService),
                    AgentType.Coordinator => new CoordinatorTools(loggerFactory.CreateLogger<CoordinatorTools>(), bankService),
                    _ => throw new ArgumentOutOfRangeException(nameof(agentType), agentType, null)
                };

                // Log the tool class creation for debugging
                logger.LogInformation("Created {ToolClassName} for agent type: {AgentType}", toolsClass.GetType().Name, agentType);

                // Get methods with Description attributes and create AI functions
                var methods = toolsClass.GetType().GetMethods()
                    .Where(m => m.GetCustomAttributes(typeof(DescriptionAttribute), false).Length > 0);

                IList<AIFunction> functions = new List<AIFunction>();
                
                foreach (var method in methods)
                {
                    try
                    {
                        var aiFunction = AIFunctionFactory.Create(method, toolsClass);
                        functions.Add(aiFunction);
                        
                        var description = method.GetCustomAttribute<DescriptionAttribute>().Description;
                        logger.LogDebug("Agent {AgentType} in-process tool: '{MethodName}' - {Description}",
                            agentType, method.Name, description);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to create AI function for method {MethodName} in {AgentType}: {Message}",
                            method.Name, agentType, ex.Message);
                    }
                }

                logger.LogInformation("Created {FunctionCount} in-process tools for agent type: {AgentType}", 
                    functions.Count, agentType);

                return functions.Count > 0 ? functions : null;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating in-process tools for agent type: {AgentType}", agentType);
                return null;
            }
        }

        

    }
}

```

</details>
<details>
  <summary>Completed code for <strong>\MultiAgentCopilot\Tools\TransactionTools.cs</strong></summary>
<br>

```csharp
using Microsoft.Extensions.AI;
using MultiAgentCopilot.Services;
using System.ComponentModel;
using Banking.Models;
using Banking.Services;

namespace MultiAgentCopilot.Tools
{
    public class TransactionTools : BaseTools
    {
        public TransactionTools(ILogger<TransactionTools> logger, BankingDataService bankService)
            : base(logger, bankService)
        {
        }
        
                [Description("Adds a new Account Transaction request")]
        public async Task<ServiceRequest> AddFunTransferRequest(string tenantId, string userId,
            string debitAccountId,
            decimal amount,
            string requestAnnotation,
            string? recipientPhoneNumber = null,
            string? recipientEmailId = null)
        {
            _logger.LogTrace("Adding AccountTransaction request for User ID: {UserId}, Debit Account: {DebitAccountId}", userId, debitAccountId);

            // Ensure non-null values for recipientEmailId and recipientPhoneNumber
            string emailId = recipientEmailId ?? string.Empty;
            string phoneNumber = recipientPhoneNumber ?? string.Empty;

            return await _bankService.CreateFundTransferRequestAsync(tenantId, debitAccountId, userId, requestAnnotation, emailId, phoneNumber, amount);
        }

        [Description("Get the transactions history between 2 dates")]
        public async Task<List<BankTransaction>> GetTransactionHistory(string tenantId, string userId,string accountId, DateTime startDate, DateTime endDate)
        {
            _logger.LogTrace("Fetching AccountTransaction history for Account: {AccountId}, From: {StartDate} To: {EndDate}", accountId, startDate, endDate);
            return await _bankService.GetTransactionsAsync(tenantId, accountId, startDate, endDate);
        }
    }
}

```
</details>

## Next Steps

Proceed to Module 4 - [Multi-Agent Orchestration](./Module-04.md)
