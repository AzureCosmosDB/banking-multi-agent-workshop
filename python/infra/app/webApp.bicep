param name string
param appServicePlanName string
param location string = resourceGroup().location


resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'   // Use P1V3 for large workloads
    tier: 'Basic' // Use PremiumV2 for large workloads
  }
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  properties: {
    serverFarmId: appServicePlan.id    
  }
}

output name string = webApp.name
output url string = 'https://${webApp.properties.defaultHostName}'
