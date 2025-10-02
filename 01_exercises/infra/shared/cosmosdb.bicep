param databaseName string
param accountsContainerName string
param chatsContainerName string
param offersContainerName string
param usersContainerName string
param checkpointsContainerName string
param chatHistoryContainerName string
param debugContainerName string
param location string = resourceGroup().location
param name string
param tags object = {}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: name
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        failoverPriority: 0
        isZoneRedundant: false
        locationName: location
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'		
      }
	  {
        name: 'EnableNoSQLVectorSearch'
	  }
    ]
  }
  tags: tags
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosDb
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
  tags: tags
}

resource cosmosContainerAccounts 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
	parent: database
	name: accountsContainerName
	properties: {
	  resource: {
		id: accountsContainerName
		partitionKey: {
		  paths: [
			'/tenantId'
			'/accountId'
		  ]
		  kind: 'MultiHash'
		  version: 2
		}
	  }
	}
	tags: tags
}

resource cosmosContainerChats 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
    parent: database
    name: chatsContainerName
    properties: {
      resource: {
        id: chatsContainerName
        partitionKey: {
          paths: [
            '/tenantId'
            '/userId'
            '/sessionId'
          ]
          kind: 'MultiHash'
          version: 2
        }
      }
    }
    tags: tags
  }
  
resource cosmosContainerOffers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-12-01-preview' = {
    parent: database
    name: offersContainerName
    properties: {
        resource: {
            id: offersContainerName
            partitionKey: {
                paths: [
                    '/tenantId'
                ]
                kind: 'Hash'
                version: 2
            }
            indexingPolicy: {
                indexingMode: 'consistent'
                automatic: true
                includedPaths: [
						{
							path: '/*'
						}
					]
					excludedPaths: [
						{
							path: '/"_etag"/?'
						}						
					]
					vectorIndexes: [
						{
							path: '/vector'
							type: 'quantizedFlat'
						}
					]
			}
			vectorEmbeddingPolicy: {
				vectorEmbeddings: [
					{
						path: '/vector'
						dataType: 'float32'
						distanceFunction: 'cosine'
						dimensions: 1536
					}
				]
            }
        }
    }
    tags: tags
}


  
resource cosmosContainerUsers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
    parent: database
    name: usersContainerName
    properties: {
      resource: {
        id: usersContainerName
        partitionKey: {
          paths: [
            '/tenantId'
          ]
          kind: 'Hash'
          version: 2
        }
      }
    }
    tags: tags
  }

resource cosmosContainerCheckpoints 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
    parent: database
    name: checkpointsContainerName
    properties: {
      resource: {
        id: checkpointsContainerName
        partitionKey: {
          paths: [
            '/partition_key'
          ]
          kind: 'Hash'
          version: 2
        }
      }
    }
    tags: tags
  }

resource cosmosContainerChatHistory 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
    parent: database
    name: chatHistoryContainerName
    properties: {
      resource: {
        id: chatHistoryContainerName
        partitionKey: {
          paths: [
            '/sessionId'
          ]
          kind: 'Hash'
          version: 2
        }
      }
    }
    tags: tags
  }

resource cosmosContainerDebug 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
    parent: database
    name: debugContainerName
    properties: {
      resource: {
        id: debugContainerName
        partitionKey: {
          paths: [
            '/sessionId'
          ]
          kind: 'Hash'
          version: 2
        }
      }
    }
    tags: tags
  }


output endpoint string = cosmosDb.properties.documentEndpoint
output name string = cosmosDb.name
