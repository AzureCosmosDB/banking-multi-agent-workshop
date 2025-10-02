using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Fluent;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Text.Json;


//Create a new host builder and configure the services
var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        //Add the Cosmos DB client to the services collection
        services.AddSingleton<CosmosClient>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            
            // Get Cosmos DB endpoint from environment variable
            var uri = Environment.GetEnvironmentVariable("COSMOSDB_ENDPOINT");
            if (string.IsNullOrEmpty(uri))
            {
                throw new InvalidOperationException("COSMOSDB_ENDPOINT environment variable is not set.");
            }

            DefaultAzureCredential credential = new DefaultAzureCredential();

            CosmosClientOptions options = new CosmosClientOptions
            {
                AllowBulkExecution = true
            };

            CosmosClient client = new CosmosClient(uri, credential, options);

            return client;
        });

    })
    .Build();

var hostTask = host.RunAsync();


//Retrieve the Cosmos DB client
var cosmosClient = host.Services.GetRequiredService<CosmosClient>();

Database database = cosmosClient.GetDatabase("MultiAgentBanking");

Container userData = database.GetContainer("Users");
Container offersData = database.GetContainer("OffersData");
Container accountsData = database.GetContainer("AccountsData");

// Get the base directory of the application
var baseDirectory = AppContext.BaseDirectory;

// Construct the full paths to the JSON files
var accountsDataPath = Path.Combine(baseDirectory, "AccountsData.json");
var offersDataPath = Path.Combine(baseDirectory, "OffersData.json");
var userDataPath = Path.Combine(baseDirectory, "UserData.json");

//Open a stream reader to read the AccountsData JSON file
using var readerAccounts = new StreamReader(accountsDataPath);
{
    //Read the JSON file and deserialize it into a dynamic object
    var json = await readerAccounts.ReadToEndAsync();
    var accounts = JsonConvert.DeserializeObject<dynamic>(json)!;

    //Iterate through the accounts and insert them into the Cosmos DB container
    foreach (var account in accounts)
    {
        PartitionKey partitionKey = new PartitionKeyBuilder()
        // Create a new partition key with the tenantId and accountId
            .Add(account["tenantId"].ToString())
            .Add(account["accountId"].ToString())
            .Build();

        // Create a new item in the container with a hierarchical partition key
        await accountsData.CreateItemAsync(account, partitionKey);
    }
}

//Open a stream reader to read the OffersData JSON file
using var readerOffers = new StreamReader(offersDataPath);
{
    //Read the JSON file and deserialize it into a dynamic object
    var json = await readerOffers.ReadToEndAsync();
    var offers = JsonConvert.DeserializeObject<dynamic>(json)!;

    //Iterate through the offers and insert them into the Cosmos DB container
    foreach (var offer in offers)
    {
        // Create a new item in the container with a hierarchical partition key
        await offersData.CreateItemAsync(offer, new PartitionKey(offer["tenantId"].ToString()));
    }
}

//Open a stream reader to read the Users JSON file
using var readerUsers = new StreamReader(userDataPath);
{
    //Read the JSON file and deserialize it into a dynamic object
    var json = await readerUsers.ReadToEndAsync();
    var users = JsonConvert.DeserializeObject<dynamic>(json)!;

    //Iterate through the users and insert them into the Cosmos DB container
    foreach (var user in users)
    {
        // Create a new item in the container with a hierarchical partition key
        await userData.CreateItemAsync(user, new PartitionKey(user["tenantId"].ToString()));
    }
}


Console.WriteLine($"Data loading complete.");

// Stop the host gracefully
await host.StopAsync();

await hostTask;