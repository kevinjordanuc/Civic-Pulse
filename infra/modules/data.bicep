param location string
param namePrefix string
param tags object
param cosmosThroughput int

var cosmosAccountName = '${namePrefix}-cosmos'
var databaseName = 'civic'
var collections = [ 'profiles' 'events' 'services' 'forums' 'auditlogs' ]
var storageAccountName = toLower('${namePrefix}stdata')

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosAccountName
  location: location
  tags: tags
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
  }
}

resource mongoDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  name: '${cosmosAccount.name}/${databaseName}'
  properties: {
    resource: {
      id: databaseName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: cosmosThroughput
      }
    }
  }
}

resource mongoCollections 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-04-15' = [for collection in collections: {
  name: '${cosmosAccount.name}/${databaseName}/${collection}'
  properties: {
    resource: {
      id: collection
      shardKey: {
        _id: 'Hash'
      }
    }
  }
}]

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource storageContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = [
  {
    name: '${storageAccount.name}/default/sources'
    properties: {
      publicAccess: 'None'
    }
  }
  {
    name: '${storageAccount.name}/default/media'
    properties: {
      publicAccess: 'None'
    }
  }
  {
    name: '${storageAccount.name}/default/exports'
    properties: {
      publicAccess: 'None'
    }
  }
]

output cosmosAccountId string = cosmosAccount.id
output cosmosDatabaseName string = databaseName
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
