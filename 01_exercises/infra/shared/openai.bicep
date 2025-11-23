param location string = resourceGroup().location
param name string
param sku string = 'S0'
param tags object = {}

resource openAi 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  kind: 'OpenAI'
  properties: {
    customSubDomainName: name
    publicNetworkAccess: 'Enabled'
    restore: true
  }
  tags: tags
}

output endpoint string = 'https://${openAi.name}.openai.azure.com/'
output name string = openAi.name

