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
        return null;        
        
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
            return CreateResponseTuple(userMessage, $"##Replaying user Message: {userMessage.Text} ##", "Starter Agent");

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
             return "TBD";
 
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
            string selectedAgent = "__";
            List<ChatMessage> latestMessages = [];
            await using StreamingRun run = await InProcessExecution.RunStreamingAsync(
                workflow,
                messages,
                sessionId: null,
                cancellationToken: CancellationToken.None);

            await run.TrySendMessageAsync(new TurnToken(emitEvents: true));

            await foreach (WorkflowEvent evt in run.WatchStreamAsync().ConfigureAwait(false))
            {
                switch (evt)
                {
                    case AgentResponseUpdateEvent update:
                        // Process streaming agent responses (debug only)
                        AgentResponse response = update.AsResponse();
                        foreach (ChatMessage message in response.Messages)
                        {
                            //Console.WriteLine($"[{update.ExecutorId}]: {message.Text}");
                        }
                        break;

                    case WorkflowOutputEvent output:
                        if (output.Is<List<ChatMessage>>(out var outputMessages) && outputMessages is { Count: > 0 })
                        {
                            latestMessages = outputMessages;
                            var lastAssistant = latestMessages.LastOrDefault(m => m.Role == ChatRole.Assistant);
                            if (!string.IsNullOrWhiteSpace(lastAssistant?.AuthorName))
                            {
                                selectedAgent = lastAssistant.AuthorName;
                            }
                        }
                        else if (output.Is<ChatMessage>(out var singleMessage) && singleMessage is not null)
                        {
                            latestMessages = [singleMessage];
                            if (singleMessage.Role == ChatRole.Assistant && !string.IsNullOrWhiteSpace(singleMessage.AuthorName))
                            {
                                selectedAgent = singleMessage.AuthorName;
                            }
                        }
                        else if (output.Is<string>(out var textOutput) && !string.IsNullOrWhiteSpace(textOutput))
                        {
                            latestMessages = [new ChatMessage(ChatRole.Assistant, textOutput)];
                        }
                        break;
                }
            }

            return (latestMessages, selectedAgent);
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
            if (lastAssistantMessage is null)
            {
                return "";
            }

            if (!string.IsNullOrWhiteSpace(lastAssistantMessage.Text))
            {
                return lastAssistantMessage.Text;
            }

            // GA responses may store text content in message contents instead of Text.
            var contentText = string.Join("\n", lastAssistantMessage.Contents
                .OfType<TextContent>()
                .Select(content => content.Text)
                .Where(text => !string.IsNullOrWhiteSpace(text)));

            return contentText;
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