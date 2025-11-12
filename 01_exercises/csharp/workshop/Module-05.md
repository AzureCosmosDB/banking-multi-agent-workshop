# Module 05 - MCP Integration

## Introduction

In this module, you'll learn how to integrate external MCP (Model Context Protocol) server tools to extend your agents' capabilities beyond in-process functions. This enables your agents to interact with external services and systems through standardized protocols.

## Learning Objectives

- Understand MCP (Model Context Protocol) architecture and benefits
- Learn how to configure and consume external MCP server tools
- Implement agent-to-MCP server communication and authentication
- Test and debug external tool integration in multi-agent scenarios

## Module Exercises

1. [Activity 1: Configure MCP Client Integration](#activity-1-configure-mcp-client-integration)
1. [Activity 2: Implement MCP Tool Service](#activity-2-implement-mcp-tool-service)
1. [Activity 3: Test your Work](#activity-3-test-your-work)

## Activity 1: Configure MCP Client Integration

When dealing with multiple agents, integrating external tools through MCP servers allows for better scalability and separation of concerns. MCP (Model Context Protocol) is a standardized protocol that enables agents to securely access external tools and services.

### MCP Client Creation

MCP servers provide tools and resources that agents can consume remotely. This architecture allows for better modularity and enables agents to access specialized capabilities without embedding all functionality directly in the agent code.

1. In VS Code, navigate to the **MultiAgentCopilot** project.
1. Navigate to the **/Services** folder
1. Navigate to **MCPToolService.cs**
1. Replace **CreateMcpClientAsync()** method with the code below

This method creates an authenticated MCP client for connecting to external tool servers. It handles transport configuration and authentication for secure communication.

```csharp
/// <summary>
/// Creates or retrieves a cached MCP client for the specified agent type
/// </summary>
private async Task<McpClient> CreateMcpClientAsync(AgentType agentType, MCPServerSettings settings)
{
    // Create authenticated transport with enhanced error handling
    IClientTransport clientTransport;
    try
    {
        // Create transport with authentication and streamable-http support
        var wrapper = new AuthenticatedHttpWrapper(settings.Url, settings.Key);
        clientTransport = wrapper.CreateTransport();
        
        // Configure transport for streamable-http if needed
        if (clientTransport is HttpClientTransport httpTransport)
        {
            await ConfigureTransportForStreamableHttp(httpTransport, settings);
        }

    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to create transport for agent {AgentType}: {Message}", agentType, ex.Message);
        throw new InvalidOperationException($"Failed to create MCP transport for agent '{agentType}': {ex.Message}", ex);
    }

    // Create MCP client
    try
    {
        var mcpClient = await McpClient.CreateAsync(clientTransport);
        _logger.LogInformation("MCP client created successfully for agent: {AgentType}", agentType);
        return mcpClient;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to create MCP client for agent {AgentType}: {Message}", agentType, ex.Message);
        
        
        throw new InvalidOperationException($"Failed to create MCP client for agent '{agentType}': {ex.Message}", ex);
    }
}
```

In our workshop, each agent can connect to a different MCP server based on their specialization. Let's configure the MCP server settings for each agent type.

1. Stay in **MCPToolService.cs**
1. Replace **GetMCPServerSettings()** method with the code below

This method retrieves MCP server configuration for specific agent types. It validates server settings and ensures proper authentication configuration.

```csharp
private MCPServerSettings GetMCPServerSettings(AgentType agentType)
{
    var agentName = AgentFactory.GetAgentName(agentType);

    
    // Find the server configuration for this agent type
    var serverSettings = _mcpSettings.Servers?.FirstOrDefault(s => 
        string.Equals(s.AgentName, agentName, StringComparison.OrdinalIgnoreCase));

    if (serverSettings == null)
    {
        throw new InvalidOperationException($"MCP server configuration for agent '{agentName}' not found in MCPSettings.Servers.");
    }

    // Validate the server settings
    if (string.IsNullOrWhiteSpace(serverSettings.Url))
    {
        throw new InvalidOperationException($"MCP server URL for agent '{agentName}' is not configured.");
    }

    if (string.IsNullOrWhiteSpace(serverSettings.Key))
    {
        throw new InvalidOperationException($"MCP server API key for agent '{agentName}' is not configured.");
    }

    return serverSettings;
}
``` 

## Activity 2: Implement MCP Tool Service

1. Stay in **MCPToolService.cs**
1. Replace the **GetMcpTools()** method with the code below

This method retrieves and filters MCP tools for specific agents. It handles connection errors gracefully and provides appropriate logging for debugging.

```csharp
public async Task<IList<McpClientTool>> GetMcpTools(AgentType agent)
{
    _logger.LogInformation("Getting MCP tools for agent: {AgentType}", agent);

    try
    {
        // Get agent configuration
        var settings = GetMCPServerSettings(agent);

        // Get or create MCP client with authentication and streamable-http support
        var mcpClient = await CreateMcpClientAsync(agent,settings);

        // List available tools from the MCP server
        var tools = await  mcpClient.ListToolsAsync();

        var filteredTools = FilterToolsByTags(tools, settings.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray());

        _logger.LogInformation("Filtered {ToolCount} tools for agent {AgentType} with {Tags}", filteredTools.Count, agent, settings.Tags);

        // Log each tool for debugging
        foreach (var tool in filteredTools)
        {
            _logger.LogDebug("Tool available - Name: {ToolName}, Description: {ToolDescription}", 
                tool.Name, tool.Description);
        }

        return filteredTools;
    }
    catch (InvalidOperationException)
    {
        // Configuration errors - already logged, re-throw
        throw;
    }
    catch (HttpRequestException httpEx)
    {
        _logger.LogError(httpEx, "HTTP error when connecting to MCP server for agent {AgentType}: {Message}", 
            agent, httpEx.Message);
        
        // Check if it's an authentication error
        if (httpEx.Message.Contains("401") || httpEx.Message.Contains("Unauthorized"))
        {
            _logger.LogError("Authentication failed - check X-MCP-API-Key configuration for agent {AgentType}", agent);
        }

        return new List<McpClientTool>();
    }
    catch (TaskCanceledException timeoutEx)
    {
        _logger.LogError(timeoutEx, "Timeout when connecting to MCP server for agent {AgentType}: {Message}", 
            agent, timeoutEx.Message);
        return new List<McpClientTool>();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error getting MCP tools for agent {AgentType}: {Message} | StackTrace: {StackTrace}", 
            agent, ex.Message, ex.StackTrace);
        return new List<McpClientTool>();
    }    
}

```

### Update Agent Factory to Use MCP Tools

1. In VS Code, navigate to the **MultiAgentCopilot/Factories** folder
1. Navigate to **AgentFactory.cs**
1. Search for **//TO DO: Add Agent Creation with MCP Tools** and paste the code below

```csharp
public static async Task<List<AIAgent>> CreateAllAgentsWithMCPToolsAsync(IChatClient chatClient, MCPToolService mcpService, ILoggerFactory loggerFactory)
{ 
    var agents = new List<AIAgent>();
    ILogger logger = loggerFactory.CreateLogger("AgentFactory");

    // Get all agent types from the enum
    var agentTypes = Enum.GetValues<AgentType>();

    // Create agents for each agent type
    foreach (var agentType in agentTypes)
    {
        logger.LogInformation("Creating agent {AgentType} with MCP tools", agentType);

        var aiFunctions = await mcpService.GetMcpTools(agentType);

        var agent = chatClient.CreateAIAgent(
                instructions: GetAgentPrompt(agentType),
                name: GetAgentName(agentType),
                description: GetAgentDescription(agentType),
                tools: aiFunctions.ToArray()
            );

        agents.Add(agent);
        logger.LogInformation("Created agent {AgentName} with {ToolCount} MCP tools", agent.Name, aiFunctions.Count());
    }

    logger.LogInformation("Successfully created {AgentCount} banking agents", agents.Count);
    return agents;
}
```

## Integrate MCP Tools with Agent Framework

1. Navigate to **MultiAgentFramework/Services/AgentFrameworkService.cs**
1. Search for **//TO DO: Add MCP Service Option** and paste the code below **within** the method. Do **not** replace the entire method.

This code integrates MCP tool service as an option for agent creation. It provides a fallback mechanism when MCP tools are preferred over in-process tools.

```csharp
 else if (_mcpService != null)
 {
     _agents = AgentFactory.CreateAllAgentsWithMCPToolsAsync(_chatClient, _mcpService, _loggerFactory).GetAwaiter().GetResult();
 }                
 else
 {
     _logger.LogError("No tool services available - cannot create agents");
 }
```

1. Next search for **//TO DO: Add SetMCPToolService** and paste the code below

This method enables setting the MCP tool service for agent framework integration. It provides a way to configure external tool capabilities for agents.
```csharp
    /// <summary>
    /// Sets the MCP (Model Context Protocol) tool service.
    /// </summary>
    /// <param name="mcpService">The MCP tool service instance.</param>
    /// <returns>True if the service was set successfully.</returns>
    
    public bool SetMCPToolService(MCPToolService mcpService)
    {
        _mcpService = mcpService ?? throw new ArgumentNullException(nameof(mcpService));
        _logger.LogInformation("MCPToolService has been set");
        return true;
    }
```

## Set MCP Tools in Chat Service

1. Navigate to **MultiAgentCopilot/Services/ChatService.cs**
1. Search for **//TO DO: Invoke SetMCPToolService** and paste the code below **within** the method. Do **not** replace the entire method.

```csharp

_afService.SetMCPToolService(_mcpService);

``` 

### Enable MCP Tools as the Preferred Option

1. Finally, open **MultiAgentCopilot\appsettings.development.json** and set the value of **UseMCPTools** to true.


## Activity 3: Test your Work

### Start the MCPServer
1. Within VS Code, open a new terminal.
1. Navigate to the `mcpserver` folder, `cd .\01_exercises\mcpserver\csharp\`
1. Run the below command to run the MCP Server.
    ```shell
    
    dotnet run
    
    ```


### Start the Backend

- Return to the open terminal for the backend app in VS Code. Ensure you are in `01_exercises\csharp\src\MultiAgentCopilot`. Type `dotnet run`

### Start a Chat Session

1. Return to the frontend application in your browser.
1. Start a new conversation.
1. Try the below prompts. Provide more information if prompted.
    1. Who can help me here?
    1. Transfer $50 to my friend.
    1. When prompted for account and email, enter, "Account is Acc001 and Email is Sandeep@contoso.com"
    1. Looking for a Savings account with high interest rate.
    1. File a complaint about theft from my account.
    1. When prompted confirm its the same account or enter a new account (Acc001 to Acc009) and provide any details it asks for.
    1. How much did I spend on groceries? (If prompted, say over the last 6 months)
    1. Provide me a statement of my account. (If prompted, give it an account number ranging from *Acc001* to *Acc009*)

### Stop the Application

1. In the backend terminal, press **Ctrl + C** to stop the application.

## Validation Checklist

- [ ] Depending on the user prompt the agent selection is dynamic.
- [ ] All the agents have context of the previous messages in the conversation.
- [ ] The agents are able to invoke the right plugin function to interact with **BankingService**.
- [ ] Vector search  works as expected.

## Common Issues and Solutions

1. Multiple agents respond together or Wrong agent responding:

   - View the 'DebugLog' by using the **Bug** icon in each impacted AI response.
   - Study the Termination Reason
   - Edit the appropriate Prompty files to resolve the conflict.

1. Agent responses are invalid:

   - Change in model and/or its version can cause invalid/irrelevant agent behavior.
   - Thorough testing with updated prompts will be required.

## Module Solution

The following sections include the completed code for this Module. Copy and paste these into your project if you run into issues and cannot resolve.


<details>
  <summary>Completed code for <strong>\MultiAgentCopilot\Services\AgentFrameworkService.cs</strong></summary>
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
    /// <summary>
    /// Sets the MCP (Model Context Protocol) tool service.
    /// </summary>
    /// <param name="mcpService">The MCP tool service instance.</param>
    /// <returns>True if the service was set successfully.</returns>

    public bool SetMCPToolService(MCPToolService mcpService)
    {
        _mcpService = mcpService ?? throw new ArgumentNullException(nameof(mcpService));
        _logger.LogInformation("MCPToolService has been set");
        return true;
    }
    
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
                else if (_mcpService != null)
                {
                    _agents = AgentFactory.CreateAllAgentsWithMCPToolsAsync(_chatClient, _mcpService, _loggerFactory).GetAwaiter().GetResult();
                }                
                else
                {
                    _logger.LogError("No tool services available - cannot create agents");
                }

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
            var (responseText, selectedAgentName) = await RunGroupChatOrchestration(chatHistory, tenantId, userId);

            return CreateResponseTuple(userMessage, responseText, selectedAgentName);
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
    /// Orchestrates the group chat with AI agents.
    /// </summary>
    private async Task<(string responseText, string selectedAgentName)> RunGroupChatOrchestration(
        List<ChatMessage> chatHistory,
        string tenantId,
        string userId)
    {
        try
        {
            _logger.LogInformation("Starting Agent Framework Group Chat");
                       
            // Add system context
            chatHistory.Add(new ChatMessage(ChatRole.System, $"User Id: {userId}, Tenant Id: {tenantId}"));

            // Create custom termination function
            var customTerminationFunc = CreateCustomTerminationFunction();

            // Create the workflow
            var workflow = AgentWorkflowBuilder.CreateGroupChatBuilderWith(agents =>
                    new GroupChatWorkflowHelper(_agents!, _chatClient, LogMessage, customTerminationFunc)
                    {
                        MaximumIterationCount = 5
                    })
                    .AddParticipants(_agents!)
                    .Build();

            //run the workflow
            var (responseMessages, selectedAgentName) = await RunWorkflowAsync(workflow,chatHistory);

            //log the function calls from the response messages
            for (int i = chatHistory.Count; i < responseMessages.Count; i++)
            {
                if (responseMessages[i].Role.Value == "assistant")
                {
                    foreach (var content in responseMessages[i].Contents)
                    {
                        // Enhanced logging based on content type
                        switch (content)
                        {
                            case FunctionCallContent functionCall:
                                LogMessage("Function Call", $"Name: {functionCall.Name}, CallId: {functionCall.CallId}");
                                LogMessage("Function Arguments", JsonSerializer.Serialize(functionCall.Arguments, new JsonSerializerOptions { WriteIndented = true }));
                                break;
                        }
                    }
                }
            }

            if (selectedAgentName == "__")
            {
                _logger.LogError("Error in getting response");
                return ("I’m sorry, I didn’t quite understand that. Could you please rephrase your message?", "Oops!");
            }
            // Extract response text
            string responseText = ExtractResponseText(responseMessages);

            _logger.LogInformation("Agent Framework orchestration completed with agent: {AgentName}", selectedAgentName);

            return (responseText, selectedAgentName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Agent Framework orchestration");
            return ("I’m sorry, I didn’t quite understand that. Could you please rephrase your message?", "Oops!");
        }
    }


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
<details>
  <summary>Completed code for <strong>\MultiAgentCopilot\Services\ChatService.cs</strong></summary>
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
            //TO DO: Invoke SetMCPToolService
            _afService.SetMCPToolService(_mcpService);

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
  <summary>Completed code for <strong>\MultiAgentCopilot\Services\MCPToolService.cs</strong></summary>
<br>

```csharp
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Client;
using MultiAgentCopilot.Factories;
using MultiAgentCopilot.Models;
using MultiAgentCopilot.Models.Configuration;
using MultiAgentCopilot.Transport;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text.Json;

namespace MultiAgentCopilot.MultiAgentCopilot.Services
{
    public class MCPToolService : IAsyncDisposable, IDisposable
    {
        private readonly ILogger<MCPToolService> _logger;
        private readonly MCPSettings _mcpSettings;
        private readonly ILoggerFactory _loggerFactory;


        public MCPToolService(IOptions<MCPSettings> mcpOptions, ILogger<MCPToolService> logger, ILoggerFactory loggerFactory)
        {
            _mcpSettings = mcpOptions.Value ?? throw new ArgumentNullException(nameof(mcpOptions));
            _logger = logger;
            _loggerFactory = loggerFactory;

            // Validate configuration
            ValidateConfiguration();
        }

        private void ValidateConfiguration()
        {
            if (_mcpSettings.Servers == null || !_mcpSettings.Servers.Any())
            {
                _logger.LogWarning("No MCP servers configured in MCPSettings.Servers");
                return;
            }

            foreach (var server in _mcpSettings.Servers)
            {
                if (string.IsNullOrWhiteSpace(server.AgentName))
                {
                    _logger.LogWarning("MCP server configuration has empty AgentName");
                }

                if (string.IsNullOrWhiteSpace(server.Url))
                {
                    _logger.LogWarning("MCP server '{AgentName}' has empty Url", server.AgentName);
                }

                if (string.IsNullOrWhiteSpace(server.Key))
                {
                    _logger.LogWarning("MCP server '{AgentName}' has empty API Key", server.AgentName);
                }

                // Validate URL format
                if (!string.IsNullOrWhiteSpace(server.Url) && !Uri.TryCreate(server.Url, UriKind.Absolute, out _))
                {
                    _logger.LogWarning("MCP server '{AgentName}' has invalid Url format: {Url}", server.AgentName, server.Url);
                }
            }

            _logger.LogInformation("MCP configuration validated for {ServerCount} servers", _mcpSettings.Servers.Count);
        }


        
        private MCPServerSettings GetMCPServerSettings(AgentType agentType)
        {
            var agentName = AgentFactory.GetAgentName(agentType);

            
            // Find the server configuration for this agent type
            var serverSettings = _mcpSettings.Servers?.FirstOrDefault(s => 
                string.Equals(s.AgentName, agentName, StringComparison.OrdinalIgnoreCase));

            if (serverSettings == null)
            {
                throw new InvalidOperationException($"MCP server configuration for agent '{agentName}' not found in MCPSettings.Servers.");
            }

            // Validate the server settings
            if (string.IsNullOrWhiteSpace(serverSettings.Url))
            {
                throw new InvalidOperationException($"MCP server URL for agent '{agentName}' is not configured.");
            }

            if (string.IsNullOrWhiteSpace(serverSettings.Key))
            {
                throw new InvalidOperationException($"MCP server API key for agent '{agentName}' is not configured.");
            }

            return serverSettings;
        }
       

        /// <summary>
        /// Creates or retrieves a cached MCP client for the specified agent type
        /// </summary>
        /// <summary>
        private async Task<McpClient> CreateMcpClientAsync(AgentType agentType, MCPServerSettings settings)
        {
            // Create authenticated transport with enhanced error handling
            IClientTransport clientTransport;
            try
            {
                // Create transport with authentication and streamable-http support
                var wrapper = new AuthenticatedHttpWrapper(settings.Url, settings.Key);
                clientTransport = wrapper.CreateTransport();
                
                // Configure transport for streamable-http if needed
                if (clientTransport is HttpClientTransport httpTransport)
                {
                    await ConfigureTransportForStreamableHttp(httpTransport, settings);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create transport for agent {AgentType}: {Message}", agentType, ex.Message);
                throw new InvalidOperationException($"Failed to create MCP transport for agent '{agentType}': {ex.Message}", ex);
            }

            // Create MCP client
            try
            {
                var mcpClient = await McpClient.CreateAsync(clientTransport);
                _logger.LogInformation("MCP client created successfully for agent: {AgentType}", agentType);
                return mcpClient;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create MCP client for agent {AgentType}: {Message}", agentType, ex.Message);
                
                
                throw new InvalidOperationException($"Failed to create MCP client for agent '{agentType}': {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Configures the HTTP transport for streamable-http support
        /// </summary>
        private async Task ConfigureTransportForStreamableHttp(HttpClientTransport transport, MCPServerSettings settings)
        {
            try
            {
                _logger.LogDebug("Configuring transport for streamable-http support...");

                // Use reflection to access the underlying HttpClient
                var transportType = transport.GetType();
                var httpClientField = transportType.GetField("_httpClient", BindingFlags.NonPublic | BindingFlags.Instance);
                
                if (httpClientField?.GetValue(transport) is HttpClient httpClient)
                {
                    // Ensure proper headers for streamable-http
                    if (!httpClient.DefaultRequestHeaders.Accept.Any(h => h.MediaType == "application/json"))
                    {
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    }

                    // Support for MCP content types
                    if (!httpClient.DefaultRequestHeaders.Accept.Any(h => h.MediaType == "application/vnd.mcp"))
                    {
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.mcp"));
                    }

                    // Verify API key header is present
                    if (!httpClient.DefaultRequestHeaders.Contains("X-MCP-API-Key"))
                    {
                        _logger.LogWarning("X-MCP-API-Key header not found, adding manually...");
                        httpClient.DefaultRequestHeaders.Add("X-MCP-API-Key", settings.Key);
                    }

                    // Set appropriate timeout for MCP operations
                    if (httpClient.Timeout == System.Threading.Timeout.InfiniteTimeSpan)
                    {
                        httpClient.Timeout = TimeSpan.FromSeconds(30);
                    }

                    _logger.LogDebug("Transport configured for streamable-http");
                }
                else
                {
                    _logger.LogWarning("Could not access HttpClient to configure streamable-http support");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to configure transport for streamable-http: {Message}", ex.Message);
                // Non-fatal error, continue with default configuration
            }

            await Task.CompletedTask;
        }

        //TO DO: ADD GetMcpTools

        public async Task<IList<McpClientTool>> GetMcpTools(AgentType agent)
        {
            _logger.LogInformation("Getting MCP tools for agent: {AgentType}", agent);

            try
            {
                // Get agent configuration
                var settings = GetMCPServerSettings(agent);

                // Get or create MCP client with authentication and streamable-http support
                var mcpClient = await CreateMcpClientAsync(agent,settings);

                // List available tools from the MCP server
                var tools = await  mcpClient.ListToolsAsync();

                var filteredTools = FilterToolsByTags(tools, settings.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray());

                _logger.LogInformation("Filtered {ToolCount} tools for agent {AgentType} with {Tags}", filteredTools.Count, agent, settings.Tags);

                // Log each tool for debugging
                foreach (var tool in filteredTools)
                {
                    _logger.LogDebug("Tool available - Name: {ToolName}, Description: {ToolDescription}", 
                        tool.Name, tool.Description);
                }

                return filteredTools;
            }
            catch (InvalidOperationException)
            {
                // Configuration errors - already logged, re-throw
                throw;
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "HTTP error when connecting to MCP server for agent {AgentType}: {Message}", 
                    agent, httpEx.Message);
                
                // Check if it's an authentication error
                if (httpEx.Message.Contains("401") || httpEx.Message.Contains("Unauthorized"))
                {
                    _logger.LogError("Authentication failed - check X-MCP-API-Key configuration for agent {AgentType}", agent);
                }

                return new List<McpClientTool>();
            }
            catch (TaskCanceledException timeoutEx)
            {
                _logger.LogError(timeoutEx, "Timeout when connecting to MCP server for agent {AgentType}: {Message}", 
                    agent, timeoutEx.Message);
                return new List<McpClientTool>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error getting MCP tools for agent {AgentType}: {Message} | StackTrace: {StackTrace}", 
                    agent, ex.Message, ex.StackTrace);
                return new List<McpClientTool>();
            }    
        }


        /// <summary>
        ///  Filter MCP tools  by tags from the tool's description or metadata
        /// </summary>
        public IList<McpClientTool> FilterToolsByTags(IList<McpClientTool> allTools, params string[] tags)
        {
             if (!tags.Any())
                return allTools;

            // Filter tools by tags - now parse embedded tags from description and exclude tag pattern from description search
            var filteredTools = allTools.Where(tool =>
            {
                var toolTags = ExtractTagsFromDescription(tool.Description);                
                return tags.Any(tag =>
                    tool.Description.Contains(tag, StringComparison.OrdinalIgnoreCase));
            }).ToList();


            _logger.LogInformation("Filtered to {FilteredCount} tools from {TotalCount} total tools", 
                filteredTools.Count, allTools.Count);

            return filteredTools;
        }
                
        /// <summary>
        /// Extracts tags from tool description that are embedded in [TAGS: ...] format
        /// </summary>
        private List<string> ExtractTagsFromDescription(string description)
        {
            var tags = new List<string>();
            
            if (string.IsNullOrEmpty(description))
                return tags;

            // Look for [TAGS: tag1,tag2,tag3] pattern
            var tagPattern = @"\[TAGS:\s*([^\]]+)\]";
            var match = System.Text.RegularExpressions.Regex.Match(description, tagPattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            
            if (match.Success)
            {
                var tagString = match.Groups[1].Value;
                tags.AddRange(tagString.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(tag => tag.Trim())
                    .Where(tag => !tag.StartsWith("priority:", StringComparison.OrdinalIgnoreCase)));
            }

            return tags;
        }

       

        public async ValueTask DisposeAsync()
        {
            _logger.LogInformation("Disposing MCPToolService...");

        }

        public void Dispose()
        {
            // Synchronous dispose for compatibility
            try
            {
                DisposeAsync().AsTask().GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during synchronous dispose: {Message}", ex.Message);
            }
            
            GC.SuppressFinalize(this);
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
        public static async Task<List<AIAgent>> CreateAllAgentsWithMCPToolsAsync(IChatClient chatClient, MCPToolService mcpService, ILoggerFactory loggerFactory)
        { 
            var agents = new List<AIAgent>();
            ILogger logger = loggerFactory.CreateLogger("AgentFactory");

            // Get all agent types from the enum
            var agentTypes = Enum.GetValues<AgentType>();

            // Create agents for each agent type
            foreach (var agentType in agentTypes)
            {
                logger.LogInformation("Creating agent {AgentType} with MCP tools", agentType);

                var aiFunctions = await mcpService.GetMcpTools(agentType);

                var agent = chatClient.CreateAIAgent(
                        instructions: GetAgentPrompt(agentType),
                        name: GetAgentName(agentType),
                        description: GetAgentDescription(agentType),
                        tools: aiFunctions.ToArray()
                    );

                agents.Add(agent);
                logger.LogInformation("Created agent {AgentName} with {ToolCount} MCP tools", agent.Name, aiFunctions.Count());
            }

            logger.LogInformation("Successfully created {AgentCount} banking agents", agents.Count);
            return agents;
        }
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


## Next Steps

Congratulations!!! You have completed this hands-on-lab!!!

You can see the full source code for this lab at <https://github.com/AzureCosmosDB/banking-multi-agent-workshop/>. We hope you enjoyed this lab.
