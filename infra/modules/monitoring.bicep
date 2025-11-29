@description('Azure region for monitoring resources.')
param location string
param namePrefix string
param tags object
param logAnalyticsSku string

var lawName = '${namePrefix}-log'
var appInsightsName = '${namePrefix}-appi'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: lawName
  location: location
  tags: tags
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  sku: {
    name: logAnalyticsSku
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    WorkspaceResourceId: logAnalytics.id
  }
}

output logAnalyticsId string = logAnalytics.id
output appInsightsConnectionString string = appInsights.properties.ConnectionString
