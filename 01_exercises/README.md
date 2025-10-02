# Multi Agent Workshop

Welcome to our multi-agent samples repository showcasing a retail banking scenario using 

- LangGraph in Python

This folder contains the starter files for the exercises. Begin with the minimal scaffolding code and follow the step-by-step instructions to complete each exercise.

Work through the exercises to build the application step by step:

- [LangGraph (Python)](python/workshop/Module-00.md)  


If you prefer to skip the exercises and go to the final code and [artifacts for running as demo](../02_completed/README.md).

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
- [Azure App Service documentation](https://learn.microsoft.com/azure/app-service/)

