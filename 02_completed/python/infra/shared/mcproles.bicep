param mcpServerName string
param cosmosDbAccountName string
param openAIName string

resource mcpServer 'Microsoft.App/containerApps@2023-05-01' existing = {
  name: mcpServerName
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

resource openAi 'Microsoft.CognitiveServices/accounts@2024-10-01' existing = {
  name: openAIName
}

// Assign Cosmos DB Data Contributor role to MCP Server
resource cosmosDbRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cosmosDb.id, mcpServer.id, 'cosmos-data-contributor')
  scope: cosmosDb
  properties: {
    principalId: mcpServer.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Cosmos DB Data Contributor
    principalType: 'ServicePrincipal'
  }
}

// Assign Cognitive Services User role to MCP Server
resource cognitiveServicesRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(openAi.id, mcpServer.id, 'cognitive-services-user')
  scope: openAi
  properties: {
    principalId: mcpServer.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908') // Cognitive Services User
    principalType: 'ServicePrincipal'
  }
}

output mcpServerPrincipalId string = mcpServer.identity.principalId