param location string
param namePrefix string
param tags object
param logAnalyticsId string
param workloadProfile string

var vnetName = '${namePrefix}-vnet'
var appsSubnetName = 'snet-apps'
var dataSubnetName = 'snet-data'
var managedEnvName = '${namePrefix}-aca-env'

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.20.0.0/20'
      ]
    }
  }
}

resource subnetApps 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' = {
  name: '${vnet.name}/${appsSubnetName}'
  properties: {
    addressPrefix: '10.20.0.0/23'
    delegations: [
      {
        name: 'delegateContainerApps'
        properties: {
          serviceName: 'Microsoft.App/environments'
        }
      }
    ]
  }
}

resource subnetData 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' = {
  name: '${vnet.name}/${dataSubnetName}'
  properties: {
    addressPrefix: '10.20.2.0/23'
  }
}

var logAnalyticsKeys = listKeys(logAnalyticsId, '2015-11-01-preview')

resource managedEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: managedEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsId, '2020-08-01').customerId
        sharedKey: logAnalyticsKeys.primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: workloadProfile
        workloadProfileType: workloadProfile
      }
    ]
    vnetConfiguration: {
      infrastructureSubnetId: subnetApps.id
    }
  }
}

output managedEnvironmentId string = managedEnv.id
output appsSubnetId string = subnetApps.id
output dataSubnetId string = subnetData.id
output vnetId string = vnet.id
