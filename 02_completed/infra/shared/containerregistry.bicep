@description('Location for the Container Registry.')
param location string = resourceGroup().location

@description('Name of the Container Registry.')
param acrName string

@description('Tags to apply to Container Registry.')
param tags object = {}

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
  tags: tags
}

output loginServer string = containerRegistry.properties.loginServer
output name string = containerRegistry.name
output resourceId string = containerRegistry.id

