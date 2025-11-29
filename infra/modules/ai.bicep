param location string
param namePrefix string
param tags object
param aiSearchSku string

var openAiName = '${namePrefix}-aoai'
var searchName = '${namePrefix}-search'
var contentSafetyName = '${namePrefix}-csafety'
var cognitiveName = '${namePrefix}-cogs'
var commName = '${namePrefix}-acs'
var mapsName = '${namePrefix}-maps'

resource openAi 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openAiName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  tags: tags
  properties: {
    customSubDomainName: '${namePrefix}aoai'
  }
}

resource search 'Microsoft.Search/searchServices@2023-11-01' = {
  name: searchName
  location: location
  tags: tags
  sku: {
    name: aiSearchSku
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
  }
}

resource contentSafety 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: contentSafetyName
  location: location
  kind: 'ContentSafety'
  sku: {
    name: 'S0'
  }
  tags: tags
}

resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: cognitiveName
  location: location
  kind: 'CognitiveServices'
  sku: {
    name: 'S0'
  }
  tags: tags
}

resource communication 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: commName
  location: location
  tags: tags
  properties: {
    dataLocation: 'UnitedStates'
  }
}

resource maps 'Microsoft.Maps/accounts@2023-06-01' = {
  name: mapsName
  location: location
  kind: 'Gen1'
  sku: {
    name: 'S0'
  }
  tags: tags
}

output openAiId string = openAi.id
output searchServiceId string = search.id
output contentSafetyId string = contentSafety.id
output cognitiveServicesId string = cognitiveServices.id
output communicationServicesId string = communication.id
output mapsAccountId string = maps.id
