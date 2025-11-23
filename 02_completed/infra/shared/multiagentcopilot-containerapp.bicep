@description('Location for the Container Apps resources.')
param location string = resourceGroup().location

@description('Tags to apply to Container Apps resources.')
param tags object = {}

@description('Name of the Container Apps Environment.')
param containerAppsEnvironmentName string

@description('Name of the Container App hosting the MultiAgentCopilot API.')
param containerAppName string

@description('User-assigned managed identity resource name.')
param userAssignedIdentityName string

@description('Cosmos DB account endpoint.')
param cosmosDbEndpoint string

@description('Azure OpenAI endpoint.')
param openAiEndpoint string

@description('Azure OpenAI completions deployment name.')
param openAiCompletionsDeployment string

@description('Azure OpenAI embeddings deployment name.')
param openAiEmbeddingsDeployment string

@description('Client ID of the user-assigned managed identity.')
param userAssignedIdentityClientId string

@description('Principal ID of the user-assigned managed identity (for ACR role assignment).')
param userAssignedIdentityPrincipalId string

@description('Name of the Log Analytics workspace.')
param logAnalyticsWorkspaceName string

@description('Container Registry login server (e.g., myregistry.azurecr.io).')
param containerRegistryLoginServer string = ''

@description('Container image name and tag (e.g., multiagentcopilot:latest). Leave empty to use placeholder hello world image.')
param containerImage string = ''

@description('Container Registry resource name (for role assignment).')
param containerRegistryName string = ''

// Log Analytics Workspace for Container Apps logs
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: tags
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppsEnvironmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
  tags: tags
  dependsOn: [logAnalyticsWorkspace]
}

// Container App for MultiAgentCopilot
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', userAssignedIdentityName)}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        allowInsecure: false
        transport: 'auto'
      }
      registries: !empty(containerRegistryName) ? [
        {
          server: containerRegistryLoginServer
          identity: resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', userAssignedIdentityName)
        }
      ] : []
    }
    template: {
      containers: [
        {
          name: 'multiagentcopilot'
          image: !empty(containerRegistryLoginServer) && !empty(containerImage) ? '${containerRegistryLoginServer}/${containerImage}' : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          env: [
            {
              name: 'CosmosDBSettings__CosmosUri'
              value: cosmosDbEndpoint
            }
            {
              name: 'AgentFrameworkServiceSettings__AzureOpenAISettings__Endpoint'
              value: openAiEndpoint
            }
            {
              name: 'AgentFrameworkServiceSettings__AzureOpenAISettings__CompletionsDeployment'
              value: openAiCompletionsDeployment
            }
            {
              name: 'AgentFrameworkServiceSettings__AzureOpenAISettings__EmbeddingsDeployment'
              value: openAiEmbeddingsDeployment
            }
            {
              name: 'CosmosDBSettings__UserAssignedIdentityClientID'
              value: userAssignedIdentityClientId
            }
            {
              name: 'AgentFrameworkServiceSettings__AzureOpenAISettings__UserAssignedIdentityClientID'
              value: userAssignedIdentityClientId
            }
            {
              name: 'AgentFrameworkServiceSettings__UseMCPTools'
              value: 'false'
            }
            {
              name: 'ASPNETCORE_URLS'
              value: 'http://+:8080'
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  tags: tags
}

// Grant Container App managed identity AcrPull role on ACR (if ACR is provided)
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = if (!empty(containerRegistryName)) {
  name: containerRegistryName
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(containerRegistryName)) {
  name: guid(containerApp.id, 'acr-pull')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: userAssignedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

output containerAppNameOutput string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn

