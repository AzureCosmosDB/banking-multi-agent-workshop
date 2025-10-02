param name string
param location string = resourceGroup().location
param tags object = {}
param environmentId string
param containerRegistryName string
param exists bool = false
param envSettings array = []
param identityName string
param registryServer string

// Get the principal ID of the user assigned managed identity user
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: identityName
}

module fetchLatestImage '../modules/fetch-container-image.bicep' = {
  name: '${name}-fetch-image'
  params: {
    name: name
    exists: exists
  }
}

resource app 'Microsoft.App/containerApps@2024-02-02-preview' = {
  name: name
  location: location
  tags: union(tags, {'azd-service-name': 'MCPServer'})
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${identity.id}': {} }
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['DELETE', 'GET', 'POST', 'PUT']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: registryServer
          identity: identity.id
        }
      ]
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: [
        {
          name: 'mcp-server'
          image: fetchLatestImage.outputs.?containers[?0].image ?? 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
          env: union([
            {
              name: 'PORT'
              value: '8080'
            }
            {
              name: 'MCP_SERVER_HOST'
              value: '0.0.0.0'
            }
            {
              name: 'MCP_SERVER_PORT'
              value: '8080'
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: identity.properties.clientId
            }
          ], envSettings)
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
}

output name string = app.name
output uri string = 'https://${app.properties.configuration.ingress.fqdn}'
output id string = app.id
output identityPrincipalId string = identity.properties.principalId