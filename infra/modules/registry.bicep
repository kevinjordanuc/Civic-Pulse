param location string
param namePrefix string
param tags object

var registryName = '${namePrefix}acr'

resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' = {
  name: registryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    zoneRedundancy: 'Disabled'
    policies: {
      trustPolicy: {
        type: 'Notary'
        status: 'disabled'
      }
    }
  }
}

output registryName string = acr.name
output registryServer string = acr.properties.loginServer
output registryResourceId string = acr.id
