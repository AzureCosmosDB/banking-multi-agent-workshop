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
                
                var aiFunctions = GetInProcessAgentTools(agentType, bankService, loggerFactory)?.ToArray() ?? [];

                var agent = chatClient.AsAIAgent(
                        instructions: GetAgentPrompt(agentType),
                        name: GetAgentName(agentType),
                        description: GetAgentDescription(agentType),
                        tools: aiFunctions
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

                var agent = chatClient.AsAIAgent(
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