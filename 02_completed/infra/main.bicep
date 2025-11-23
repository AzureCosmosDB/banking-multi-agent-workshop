targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string

@description('Id of the service principal to assign application roles (optional - if not provided, SP roles will be skipped)')
param servicePrincipalId string = ''

@description('Owner tag for resource tagging')
param owner string = 'defaultuser@example.com'

var tags = {
  'azd-env-name': environmentName
  'owner': owner
}

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

// Deploy Managed Identity
module managedIdentity './shared/managedidentity.bicep' = {
  name: 'managed-identity'
  params: {
    identityName: '${abbrs.managedIdentityUserAssignedIdentities}${resourceToken}'
    location: location
    tags: tags
  }
  scope: rg
}

// Deploy Azure Cosmos DB
module cosmos './shared/cosmosdb.bicep' = {
  name: 'cosmos'
  params: {    
    name: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    location: location
    tags: tags
    databaseName: 'MultiAgentBanking'
	  chatsContainerName: 'ChatsData'
	  accountsContainerName: 'AccountsData'
	  offersContainerName:'OffersData'
	  usersContainerName:'Users'
	  checkpointsContainerName:'Checkpoints'
	  chatHistoryContainerName:'ChatHistory'
	  debugContainerName:'Debug'
  }
  scope: rg
}

// Deploy OpenAI
module openAi './shared/openai.bicep' = {
  name: 'openai-account'
  params: {
    name: '${abbrs.openAiAccounts}${resourceToken}'
    location: location
    tags: tags
    sku: 'S0'
  }
  scope: rg
}

//Deploy OpenAI Deployments
var deployments = [
  {
    name: 'gpt-4.1-mini'
    skuCapacity: 30
	skuName: 'GlobalStandard'
    modelName: 'gpt-4.1-mini'
    modelVersion: '2025-04-14'
  }
  {
    name: 'text-embedding-3-small'
    skuCapacity: 5
	skuName: 'GlobalStandard'
    modelName: 'text-embedding-3-small'
    modelVersion: '1'
  }
]

@batchSize(1)
module openAiModelDeployments './shared/modeldeployment.bicep' = [
  for (deployment, _) in deployments: {
    name: 'openai-model-deployment-${deployment.name}'
    params: {
      name: deployment.name
      parentAccountName: openAi.outputs.name
      skuName: deployment.skuName
      skuCapacity: deployment.skuCapacity
      modelName: deployment.modelName
      modelVersion: deployment.modelVersion
      modelFormat: 'OpenAI'
    }
	scope: rg
  }
]

//Assign Roles to Managed Identities
module AssignRoles './shared/assignroles.bicep' = {
  name: 'AssignRoles'
  params: {
    cosmosDbAccountName: cosmos.outputs.name
    openAIName: openAi.outputs.name
    identityName: managedIdentity.outputs.name
	  userPrincipalId: !empty(principalId) ? principalId : null
    servicePrincipalId: !empty(servicePrincipalId) ? servicePrincipalId : ''
  }
  scope: rg
}

// Deploy Azure Container Registry
module containerRegistry './shared/containerregistry.bicep' = {
  name: 'container-registry'
  params: {
    acrName: '${abbrs.containerRegistryRegistries}${resourceToken}'
    location: location
    tags: tags
  }
  scope: rg
}

// Deploy MultiAgentCopilot Container App
module multiAgentCopilotContainerApp './shared/multiagentcopilot-containerapp.bicep' = {
  name: 'multiagentcopilot-containerapp'
  params: {
    location: location
    tags: tags
    containerAppsEnvironmentName: '${abbrs.appManagedEnvironments}${environmentName}'
    containerAppName: '${abbrs.appContainerApps}${environmentName}-multiagentcopilot'
    logAnalyticsWorkspaceName: '${abbrs.operationalInsightsWorkspaces}${environmentName}'
    containerRegistryLoginServer: containerRegistry.outputs.loginServer
    containerRegistryName: containerRegistry.outputs.name
    containerImage: '' // Empty for now - will be set after building and pushing the image
    userAssignedIdentityName: managedIdentity.outputs.name
    userAssignedIdentityPrincipalId: managedIdentity.outputs.principalId
    cosmosDbEndpoint: cosmos.outputs.endpoint
    openAiEndpoint: openAi.outputs.endpoint
    openAiCompletionsDeployment: openAiModelDeployments[0].outputs.name
    openAiEmbeddingsDeployment: openAiModelDeployments[1].outputs.name
    userAssignedIdentityClientId: AssignRoles.outputs.identityId
  }
  scope: rg
  dependsOn: [containerRegistry]
}

// Outputs
output RG_NAME string = 'rg-${environmentName}'
output COSMOSDB_ENDPOINT string = cosmos.outputs.endpoint
output AZURE_OPENAI_ENDPOINT string = openAi.outputs.endpoint
output AZURE_OPENAI_COMPLETIONSDEPLOYMENTID string = openAiModelDeployments[0].outputs.name
output AZURE_OPENAI_EMBEDDINGDEPLOYMENTID string = openAiModelDeployments[1].outputs.name
output MULTIAGENTCOPILOT_CONTAINERAPP_NAME string = multiAgentCopilotContainerApp.outputs.containerAppNameOutput
output MULTIAGENTCOPILOT_CONTAINERAPP_URL string = 'https://${multiAgentCopilotContainerApp.outputs.containerAppFqdn}'
output CONTAINER_REGISTRY_LOGIN_SERVER string = containerRegistry.outputs.loginServer
output CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
