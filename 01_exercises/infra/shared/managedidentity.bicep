
param location string = resourceGroup().location
param identityName string
param tags object = {}


// Create user assigned managed identity
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

output name string = identity.name
