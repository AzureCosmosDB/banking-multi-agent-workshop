using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Workflows;
using Microsoft.Extensions.AI;
using MultiAgentCopilot.Models.ChatInfoFormats;
using MultiAgentCopilot.MultiAgentCopilot.Factories;
using OpenAI;
using OpenAI.Chat;
using System.Text.Json;
using ChatMessage = Microsoft.Extensions.AI.ChatMessage;

namespace MultiAgentCopilot.MultiAgentCopilot.Helper
{
    public class GroupChatWorkflowHelper : GroupChatManager
    {
        private readonly IReadOnlyList<AIAgent> _agents;
        private readonly Func<GroupChatWorkflowHelper, IEnumerable<ChatMessage>, CancellationToken, ValueTask<bool>>? _shouldTerminateFunc;
        private readonly IChatClient _chatClient; // Add this field
        private int _nextIndex;
        private LogCallback _logCallback;

        public delegate void LogCallback(string key, string value);

        public GroupChatWorkflowHelper(
            IReadOnlyList<AIAgent> agents,
            IChatClient chatClient,
            LogCallback logCallback,
            Func<GroupChatWorkflowHelper, IEnumerable<ChatMessage>, CancellationToken, ValueTask<bool>>? shouldTerminateFunc = null)
        {
            _agents = agents;
            _chatClient = chatClient; // Store the chat client
            _logCallback = logCallback;
            _shouldTerminateFunc = shouldTerminateFunc;
        }

        private string GetAgentNames()
        {
            return string.Join(", ", _agents.Select(a => a.Name));
        }


         protected override async ValueTask<AIAgent> SelectNextAgentAsync(IReadOnlyList<ChatMessage> history, CancellationToken cancellationToken = default(CancellationToken))
        {
            // Convert chat history to a string representation for the prompt
            var historyText = string.Join("\n", history.TakeLast(5).Select(msg => 
            {
                var role = msg.Role.ToString();
                var content = msg.Text ?? "";
                return $"{role}: {content}";
            }));
            
            // Create a moderator agent to decide which agent should respond next
            var moderatorAgent = _chatClient.AsAIAgent(
                instructions: PromptFactory.Selection(historyText, GetAgentNames()),
                name: "Moderator");

            var runOptions = new ChatClientAgentRunOptions
            {
                ChatOptions = new()
                {
                    ResponseFormat = Microsoft.Extensions.AI.ChatResponseFormat.ForJsonSchema(
                        schema: AIJsonUtilities.CreateJsonSchema(typeof(ContinuationInfo)),
                        schemaName: "ContinuationInfo",
                        schemaDescription: "Information about selecting next agent in a conversation.")
                }
            };

            // Get the selection recommendation from the moderator
            var response = await moderatorAgent.RunAsync(history, null, runOptions, cancellationToken);
            var selectionInfo = string.IsNullOrWhiteSpace(response.Text)
                ? null
                : JsonSerializer.Deserialize<ContinuationInfo>(response.Text, JsonSerializerOptions.Web);

            var selectedAgentName = selectionInfo?.AgentName?.ToString();
            var reason = selectionInfo?.Reason;

            // Log the selection decision (uncomment if you have logging)
            _logCallback?.Invoke("SelectNextAgentAsync", $"{{Agent: {selectedAgentName}, Reason: {reason}}}");

            // Find the matching agent from your agents list
            var selectedAgent = _agents.FirstOrDefault(agent =>
                string.Equals(agent.Name, selectedAgentName, StringComparison.OrdinalIgnoreCase));

            // Return the selected agent, or default to the first agent if no match found
            return selectedAgent ?? _agents[0];
            
        }
      

        protected override async ValueTask<bool> ShouldTerminateAsync(IReadOnlyList<ChatMessage> history, CancellationToken cancellationToken = default(CancellationToken))
        {

            // Check if the last user message was from user, if so, do not terminate, skip system messages
            for(int i = history.Count -1; i >=0; i--)
            {
                if(history[i].Role == ChatRole.System)
                {
                    continue;
                }
                else if(history[i].Role == ChatRole.User)
                {
                    return false;
                }
                else
                {
                    break;
                }
            }       

            // First check if there's a custom termination function
            if (_shouldTerminateFunc != null)
            {
                bool customResult = await _shouldTerminateFunc(this, history, cancellationToken).ConfigureAwait(continueOnCapturedContext: false);
                if (customResult)
                {
                    return true;
                }
            }

            // Use AI-based termination decision using TerminationStrategy.prompty
            try
            {
                var shouldTerminate = await ShouldTerminateWithAI(history, cancellationToken);
                if (shouldTerminate)
                {
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logCallback.Invoke("ShouldTerminateAsync Error", ex.Message);
            }

            // Fall back to base implementation
            return await base.ShouldTerminateAsync(history, cancellationToken).ConfigureAwait(continueOnCapturedContext: false);
        }

        private async Task<bool> ShouldTerminateWithAI(IReadOnlyList<ChatMessage> history, CancellationToken cancellationToken)
        {
            if (history == null || !history.Any())
                return false;

            // Convert chat history to a string representation for the prompt
            var historyText = string.Join("\n", history.TakeLast(10).Select(msg =>
            {
                var role = msg.Role.ToString();
                var content = msg.Text ?? "";
                return $"{role}: {content}";
            }));

            // Create a termination decision agent using the TerminationStrategy.prompty
            var terminationAgent = _chatClient.AsAIAgent(
                instructions: PromptFactory.Termination(historyText),
                name: "TerminationDecider");

            var runOptions = new ChatClientAgentRunOptions
            {
                ChatOptions = new()
                {
                    ResponseFormat = Microsoft.Extensions.AI.ChatResponseFormat.ForJsonSchema(
                        schema: AIJsonUtilities.CreateJsonSchema(typeof(TerminationInfo)),
                        schemaName: "TerminationInfo",
                        schemaDescription: "Information about whether the conversation should continue or terminate.")
                }
            };

            try
            {
                // Get the termination decision from the AI agent
                var response = await terminationAgent.RunAsync(history, null, runOptions, cancellationToken);
                var terminationInfo = string.IsNullOrWhiteSpace(response.Text)
                    ? null
                    : JsonSerializer.Deserialize<TerminationInfo>(response.Text, JsonSerializerOptions.Web);

                var shouldContinue = terminationInfo?.ShouldContinue ?? true;
                var reason = terminationInfo?.Reason ?? "No reason provided";

                // Log the termination decision
                _logCallback?.Invoke("ShouldTerminateAsync", $"{{Continue: {shouldContinue.ToString()}, Reason: {reason}}}");

                // Return true if we should terminate (i.e., should NOT continue)
                return !shouldContinue;
            }
            catch (Exception ex)
            {
                _logCallback?.Invoke("ShouldTerminateWithAI Error", ex.Message);
                // Default to continue if there's an error
                return false;
            }

        }

        protected override void Reset()
        {
            base.Reset();
            _nextIndex = 0;
        }
    }
}
