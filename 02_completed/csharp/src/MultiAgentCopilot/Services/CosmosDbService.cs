using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Fluent;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using MultiAgentCopilot.Helper;
using MultiAgentCopilot.Models.Chat;
using MultiAgentCopilot.Models.Configuration;
using MultiAgentCopilot.Models.Debug;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Transactions;
using Container = Microsoft.Azure.Cosmos.Container;
using Message = MultiAgentCopilot.Models.Chat.Message;
using PartitionKey = Microsoft.Azure.Cosmos.PartitionKey;
using Session = MultiAgentCopilot.Models.Chat.Session;
using Banking.Models;
using CosmosDBSettings = MultiAgentCopilot.Models.Configuration.CosmosDBSettings;

namespace MultiAgentCopilot.Services
{
    /// <summary>
    /// Service to access Azure Cosmos DB for NoSQL.
    /// </summary>
    public class CosmosDBService
    {
        public Container ChatDataContainer { get; }
        public Container UserDataContainer { get; }
        public Container OfferDataContainer { get; }
        public Container AccountDataContainer { get; }

        public Database Database { get; }

        private readonly CosmosDBSettings _settings;
        private readonly ILogger _logger;


        public CosmosDBService(
            IOptions<Models.Configuration.CosmosDBSettings> settings,
            ILogger<CosmosDBService> logger)
        {
            _settings = settings.Value;
            ArgumentException.ThrowIfNullOrEmpty(_settings.CosmosUri);

            _logger = logger;
            _logger.LogInformation("Initializing Cosmos DB service.");

            if (!_settings.EnableTracing)
            {
                Type defaultTrace = Type.GetType("Microsoft.Azure.Cosmos.Core.Trace.DefaultTrace,Microsoft.Azure.Cosmos.Direct");
                TraceSource traceSource = (TraceSource)defaultTrace.GetProperty("TraceSource").GetValue(null);
                traceSource.Switch.Level = SourceLevels.All;
                traceSource.Listeners.Clear();
            }

            CosmosSerializationOptions options = new()
            {
                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
            };


            DefaultAzureCredential credential;
            if (string.IsNullOrEmpty(_settings.UserAssignedIdentityClientID))
            {
                credential = new DefaultAzureCredential();
            }
            else
            {
                credential = new DefaultAzureCredential(new DefaultAzureCredentialOptions
                {
                    ManagedIdentityClientId = _settings.UserAssignedIdentityClientID
                });

            }


            var jsonSerializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            CosmosClient client = new CosmosClientBuilder(_settings.CosmosUri, credential)
                .WithSystemTextJsonSerializerOptions(jsonSerializerOptions)
                .WithConnectionModeGateway()
                .Build();

            Database = client?.GetDatabase(_settings.Database) ??
                        throw new ArgumentException("Unable to connect to existing Azure Cosmos DB database.");

            ChatDataContainer = Database.GetContainer(_settings.ChatDataContainer.Trim());
            UserDataContainer = Database.GetContainer(_settings.UserDataContainer.Trim());
            OfferDataContainer = Database.GetContainer(_settings.OfferDataContainer.Trim());
            AccountDataContainer = Database.GetContainer(_settings.AccountsContainer.Trim());

            _logger.LogInformation("Cosmos DB service initialized.");
        }

        public async Task<List<Session>> GetUserSessionsAsync(string tenantId, string userId)
        {
            try
            {
                QueryDefinition query = new QueryDefinition("SELECT DISTINCT * FROM c WHERE c.type = @type")
                    .WithParameter("@type", nameof(Session));

                var partitionKey = PartitionManager.GetChatDataPartialPK(tenantId, userId);
                FeedIterator<Session> response = ChatDataContainer.GetItemQueryIterator<Session>(query, null, new QueryRequestOptions() { PartitionKey = partitionKey });

                List<Session> output = new();
                while (response.HasMoreResults)
                {
                    FeedResponse<Session> results = await response.ReadNextAsync();
                    output.AddRange(results);
                }

                return output;
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Session> GetSessionAsync(string tenantId, string userId, string sessionId)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                return await ChatDataContainer.ReadItemAsync<Session>(
                    id: sessionId,
                    partitionKey: partitionKey);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<List<Message>> GetSessionMessagesAsync(string tenantId, string userId, string sessionId)
        {
            try
            {
                QueryDefinition query =
                    new QueryDefinition("SELECT * FROM c WHERE c.type = @type")
                        .WithParameter("@type", nameof(Message));

                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                FeedIterator<Message> results = ChatDataContainer.GetItemQueryIterator<Message>(query, null, new QueryRequestOptions() { PartitionKey = partitionKey });

                List<Message> output = new();
                while (results.HasMoreResults)
                {
                    FeedResponse<Message> response = await results.ReadNextAsync();
                    output.AddRange(response);
                }

                return output;
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Session> InsertSessionAsync(Session session)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(session.TenantId, session.UserId, session.SessionId);

                var response = await ChatDataContainer.CreateItemAsync(
                    item: session,
                    partitionKey: partitionKey
                );

                return response;
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Message> InsertMessageAsync(Message message)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(message.TenantId, message.UserId, message.SessionId);

                return await ChatDataContainer.CreateItemAsync(
                    item: message,
                    partitionKey: partitionKey
                );
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Message> UpdateMessageAsync(Message message)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(message.TenantId, message.UserId, message.SessionId);

                return await ChatDataContainer.ReplaceItemAsync(
                    item: message,
                    id: message.Id,
                    partitionKey: partitionKey
                );
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Message> UpdateMessageRatingAsync(string tenantId, string userId, string sessionId, string messageId, bool? rating)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                var response = await ChatDataContainer.PatchItemAsync<Message>(
                id: messageId,
                partitionKey: partitionKey,
                    patchOperations: new[]
                    {
                            PatchOperation.Set("/rating", rating),
                    }
                );
                return response.Resource;
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Session> UpdateSessionAsync(Session session)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(session.TenantId, session.UserId, session.SessionId);

                return await ChatDataContainer.ReplaceItemAsync(
                    item: session,
                    id: session.Id,
                    partitionKey: partitionKey
                );
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<Session> UpdateSessionNameAsync(string tenantId, string userId, string sessionId, string name)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                var response = await ChatDataContainer.PatchItemAsync<Session>(
                    id: sessionId,
                    partitionKey: partitionKey,
                    patchOperations: new[]
                    {
                        PatchOperation.Set("/name", name),
                    }
                );


                return response.Resource;
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }



        public async Task UpsertSessionBatchAsync(List<Message> messages, List<DebugLog> debugLogs, Session session)
        {
            try
            {
                if (messages.Select(m => m.SessionId).Distinct().Count() > 1 || session.SessionId != messages.Select(m => m.SessionId).FirstOrDefault())
                {
                    throw new ArgumentException("All items must have the same partition key.");
                }

                if (debugLogs.Count > 0 && (debugLogs.Select(m => m.SessionId).Distinct().Count() > 1 || session.SessionId != debugLogs.Select(m => m.SessionId).FirstOrDefault()))
                {
                    throw new ArgumentException("All items must have the same partition key as message.");
                }

                PartitionKey partitionKey = PartitionManager.GetChatDataFullPK(session.TenantId, session.UserId, session.SessionId);
                var batch = ChatDataContainer.CreateTransactionalBatch(partitionKey);
                foreach (var message in messages)
                {
                    batch.UpsertItem(
                        item: message
                    );
                }

                foreach (var log in debugLogs)
                {
                    batch.UpsertItem(
                        item: log
                    );
                }

                batch.UpsertItem(
                    item: session
                );

                await batch.ExecuteAsync();
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task DeleteSessionAndMessagesAsync(string tenantId, string userId, string sessionId)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                var query = new QueryDefinition("SELECT c.id FROM c WHERE c.sessionId = @sessionId")
                    .WithParameter("@sessionId", sessionId);

                var response = ChatDataContainer.GetItemQueryIterator<Message>(query);

                var batch = ChatDataContainer.CreateTransactionalBatch(partitionKey);
                while (response.HasMoreResults)
                {
                    var results = await response.ReadNextAsync();
                    foreach (var item in results)
                    {
                        batch.DeleteItem(
                            id: item.Id
                        );
                    }
                }

                await batch.ExecuteAsync();
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }

        public async Task<DebugLog> GetChatCompletionDebugLogAsync(string tenantId, string userId, string sessionId, string debugLogId)
        {
            try
            {
                var partitionKey = PartitionManager.GetChatDataFullPK(tenantId, userId, sessionId);

                return await ChatDataContainer.ReadItemAsync<DebugLog>(
                    id: debugLogId,
                    partitionKey: partitionKey);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex.ToString());
                throw;
            }
        }


        public async Task<bool> AddDocument(string containerName, JsonElement document)
        {
            try
            {
                // Extract raw JSON from JsonElement
                var json = document.GetRawText();
                var docJObject = JsonConvert.DeserializeObject<JObject>(json);

                // Ensure "id" exists
                if (!docJObject!.ContainsKey("id"))
                {
                    throw new ArgumentException("Document must contain an 'id' property.");
                }

                return await InsertDocumentAsync(containerName, docJObject);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding document to container {containerName}.");
                return false;
            }
        }


        public async Task<List<ServiceRequest>> GetServiceRequestsAsync(string tenantId)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsPartialPK(tenantId);

                var queryBuilder = new StringBuilder("SELECT TOP 10 * FROM c WHERE c.type = @type AND c.tenantId = @tenantId ORDER BY c.RequestedOn DESC");
                var queryDefinition = new QueryDefinition(queryBuilder.ToString())
                      .WithParameter("@type", nameof(ServiceRequest))
                      .WithParameter("@tenantId", tenantId);

                List<ServiceRequest> reqs = new List<ServiceRequest>();
                using (FeedIterator<ServiceRequest> feedIterator = AccountDataContainer.GetItemQueryIterator<ServiceRequest>(queryDefinition, requestOptions: new QueryRequestOptions { PartitionKey = partitionKey }))
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
                _logger.LogError(ex.ToString());
                return new List<ServiceRequest>();
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
                FeedIterator<BankAccount> response = AccountDataContainer.GetItemQueryIterator<BankAccount>(query, null, new QueryRequestOptions() { PartitionKey = partitionKey });

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
                _logger.LogError(ex.ToString());
                return null;
            }
        }

        public async Task<List<BankTransaction>> GetAccountTransactionsAsync(string tenantId, string userId, string accountId)
        {
            try
            {
                var partitionKey = PartitionManager.GetAccountsDataFullPK(tenantId, accountId);

                QueryDefinition queryDefinition = new QueryDefinition(
               "SELECT TOP 10 * FROM c WHERE c.accountId = @accountId AND c.type = @type ORDER BY c.transactionDateTime ASC")
               .WithParameter("@accountId", accountId)
               .WithParameter("@type", nameof(BankTransaction));

                List<BankTransaction> transactions = new List<BankTransaction>();
                using (FeedIterator<BankTransaction> feedIterator = AccountDataContainer.GetItemQueryIterator<BankTransaction>(queryDefinition, requestOptions: new QueryRequestOptions
                {
                    PartitionKey = partitionKey
                }))
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
                _logger.LogError(ex.ToString());
                return new List<BankTransaction>();
            }
        }

        private async Task<bool> InsertDocumentAsync(string containerName, JObject document)
        {
            Container container = null;

            switch (containerName)
            {
                case "OfferData":
                    container = OfferDataContainer;
                    break;
                case "AccountData":
                    container = AccountDataContainer;
                    break;
                case "UserData":
                    container = UserDataContainer;
                    break;
            }
            try
            {

                // Insert cleaned document
                await container.CreateItemAsync(document);


                return true;
            }
            catch (CosmosException ex)
            {
                // Ignore conflict errors.
                if (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    _logger.LogInformation($"Duplicate document detected.");
                }
                else
                {
                    _logger.LogError(ex, "Error inserting document.");
                    throw;
                }
                return false;
            }
        }

    }
}