param name string
param tags object = {}
param containerAppName string
param location string = resourceGroup().location
param environmentId string
param imageName string
param containerImageTag string = 'latest'
param registryServer string
param identityName string
param containerPort int = 8080
param applicationInsightsName string
param envSettings array = []

// Get the principal ID of the user assigned managed identity user
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: identityName
}


resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: applicationInsightsName
}


module fetchLatestImage '../modules/fetch-container-image.bicep' = {
  name: '${name}-fetch-image'
  params: {
    name: name
	exists:false
  }
}

resource chatservicewebapi 'Microsoft.App/containerApps@2024-02-02-preview' = {
  name: name
  location: location
  tags: union(tags, {'azd-service-name': 'ChatServiceWebApi' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${identity.id}': {} }
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      ingress:  {
        external: true
        targetPort: 8080
        transport: 'auto'      
        corsPolicy: {
          allowedOrigins: [
				'*'
          ]
		  allowedMethods: [
			'DELETE'
			'GET'
			'POST'
			'PUT'
          ]
		  allowedHeaders: [
			'*'
          ]
        }
	  }
      registries: [
        {
          server: '${registryServer}.azurecr.io'
          identity: identity.id
        }
      ]
	  activeRevisionsMode: 'Single' // Ensures only one active revision at a time
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: fetchLatestImage.outputs.?containers[?0].image ?? 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          env: union(
            [
			  {
				name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
				value: applicationInsights.properties.ConnectionString
			  }
			  {
				name: 'PORT'
				value: '8080'
			  }
			  {
				name: 'AZURE_CLIENT_ID'
				value: identity.properties.clientId
			  }
            ],
            envSettings
          )
          resources: {
            cpu: json('1.0')
            memory: '2.0Gi'
          }  
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
      }
    }
  }
}

output name string = chatservicewebapi.name
output uri string = 'https://${chatservicewebapi.properties.configuration.ingress.fqdn}'
output id string = chatservicewebapi.id

