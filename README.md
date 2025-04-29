# Multi Agent Workshop

Welcome to our multi-agent sample and workshop for a retail banking scenario. Implemented in both C# using Semantic Kernel Agents and Python using LangGraph.

## Build a Multi-Agent AI application using Semantic Kernel Agents or LangGraph

This sample application and full-day workshop shows how to build a multi-tenant, multi-agent, banking application with containerized applications built using two multi-agent frameworks

- Semantic Kernel Agents in C#
- LangGraph in Python

Both are hosted on Azure Container Apps, with Azure Cosmos DB for NoSQL as the transactional database and vector store with Azure OpenAI Service for embeddings and completions. This complete sample and full-day workshop provides practical guidance on many concepts you will need to design and build these types of applications.

## Architecture Diagram

Here’s the deployment architecture and components of the workshop!

<img src="media/mult-agent.png" alt="Multi-Agent Image">

## User Experience

https://github.com/user-attachments/assets/0e943130-13c5-4bb5-a40b-51b6c85dd58c

## Complete the Workshop Exercises

The workshop for this sample is on the [Start branch](https://github.com/AzureCosmosDB/banking-multi-agent-workshop/tree/start) in this repository. To navigate and complete this workshop select one of the following:

- Navigate to the [LangGraph Python Workshop](https://github.com/AzureCosmosDB/banking-multi-agent-workshop/blob/start/python/workshop/Module-00.md)
- Navigate to the [Semantic Kernel Csharp Workshop](https://github.com/AzureCosmosDB/banking-multi-agent-workshop/blob/start/csharp/workshop/Module-00.md)

## Explore the Complete Samples

There are two completely separate implementations for this sample multi-agent application with different instructions on how to deploy and configure for use.

- [LangGraph Multi-Agent Sample](./python/readme.md)
- [Semantic Kernel Multi-Agent Sample](./csharp/README.md)

## Important Security Notice

This template, the application code and configuration it contains, has been built to showcase Microsoft Azure specific services and tools. We strongly advise our customers not to make this code part of their production environments without implementing or enabling additional security features.

## Guidance

### Region Availability

This template uses gpt-4o and text-embedding-3-large models which may not be available in all Azure regions. Check for [up-to-date region availability](https://learn.microsoft.com/azure/ai-services/openai/concepts/models#standard-deployment-model-availability) and select a region during deployment accordingly.

### Costs

You can estimate the cost of this project's architecture with [Azure's pricing calculator](https://azure.microsoft.com/pricing/calculator/)

As an example in US dollars, here's how the sample is currently built:

Average Monthly Cost:

- Azure Cosmos DB Serverless ($0.25 USD per 1M RU/s): $0.25
- Azure Container Apps (1 CPU, 2 Gi memory): $8.00
- Azure Container Registry(Standard): $5:50
- Azure App Service (B3 Plan): $1.20
- Azure OpenAI (GPT-4o 1M input/output tokens): $20 (Sample uses 10K tokens)
- Azure OpenAI (text-3-embedding-large): < $0.01 (Sample uses 5K tokens)
- Log Analytics (Pay as you go): < $0.12

## Resources

To learn more about the services and features demonstrated in this sample, see the following:

- [Azure Cosmos DB for NoSQL Vector Search announcement](https://aka.ms/CosmosDBDiskANNBlog/)
- [Azure OpenAI Service documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Semantic Kernel](https://learn.microsoft.com/semantic-kernel/overview)
- [Azure App Service documentation](https://learn.microsoft.com/azure/app-service/)
- [ASP.NET Core Blazor documentation](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor)
