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


// Outputs
output RG_NAME string = 'rg-${environmentName}'
output COSMOSDB_ENDPOINT string = cosmos.outputs.endpoint
output AZURE_OPENAI_ENDPOINT string = openAi.outputs.endpoint
output AZURE_OPENAI_COMPLETIONSDEPLOYMENTID string = openAiModelDeployments[0].outputs.name
output AZURE_OPENAI_EMBEDDINGDEPLOYMENTID string = openAiModelDeployments[1].outputs.name
