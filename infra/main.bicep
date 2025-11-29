targetScope = 'resourceGroup'

@description('Azure region for all resources. eastus supports Container Apps, OpenAI, AI Search, Content Safety, Translator, Maps and ACS at low cost.')
param location string = 'eastus'

@description('Resource name prefix (e.g., civic).')
param namePrefix string = 'civic'

@description('Deployment environment tag (dev/test/prod).')
param environment string = 'prod'

@minValue(400)
@description('Base RU/s for the Mongo API database.')
param cosmosThroughput int = 400

@description('SKU for Azure AI Search (basic keeps cost low).')
@allowed([ 'basic' 'standard' ])
param aiSearchSku string = 'basic'

@description('Log Analytics SKU for diagnostics.')
@allowed([ 'PerGB2018' ])
param logAnalyticsSku string = 'PerGB2018'

@description('Container Apps workload profile. Consumption is the most affordable tier.')
@allowed([ 'Consumption' ])
param workloadProfile string = 'Consumption'

var tags = {
  Project: 'CivicPulse'
  Environment: toUpper(environment)
}

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    logAnalyticsSku: logAnalyticsSku
  }
}

module network 'modules/network.bicep' = {
  name: 'networking'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    logAnalyticsId: monitoring.outputs.logAnalyticsId
    workloadProfile: workloadProfile
  }
}

module registry 'modules/registry.bicep' = {
  name: 'registry'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
  }
}

module security 'modules/security.bicep' = {
  name: 'security'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
  }
}

module data 'modules/data.bicep' = {
  name: 'data'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    cosmosThroughput: cosmosThroughput
  }
}

module ai 'modules/ai.bicep' = {
  name: 'ai'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    aiSearchSku: aiSearchSku
  }
}

module containerApps 'modules/containerApps.bicep' = {
  name: 'containerApps'
  params: {
    location: location
    namePrefix: namePrefix
    tags: tags
    managedEnvironmentId: network.outputs.managedEnvironmentId
    registryServer: registry.outputs.registryServer
    registryName: registry.outputs.registryName
    registryResourceId: registry.outputs.registryResourceId
    keyVaultId: security.outputs.keyVaultId
    userIdentityId: security.outputs.userIdentityId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
  }
}

// Optional: To enable CDN/WAF later, add an Azure Front Door Standard/Premium resource that routes / to aca-frontend and /api to aca-backend, enforcing WAF policies + TLS offload.

output containerAppsEnvironmentId string = network.outputs.managedEnvironmentId
output logAnalyticsWorkspaceId string = monitoring.outputs.logAnalyticsId
output applicationInsightsConnectionString string = monitoring.outputs.appInsightsConnectionString
output keyVaultUri string = security.outputs.keyVaultUri
