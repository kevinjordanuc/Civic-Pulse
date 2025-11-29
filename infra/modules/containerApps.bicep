param location string
param namePrefix string
param tags object
param managedEnvironmentId string
param registryServer string
param registryName string
param registryResourceId string
param keyVaultId string
param userIdentityId string
param appInsightsConnectionString string

var frontendAppName = '${namePrefix}-frontend'
var backendAppName = '${namePrefix}-backend'
var notificationJobName = '${namePrefix}-job-notify'
var ingestionJobName = '${namePrefix}-job-ingest'

var acrCreds = listCredentials(registryResourceId, '2023-06-01-preview')
var keyVaultUri = reference(keyVaultId, '2023-07-01').properties.vaultUri

resource frontend 'Microsoft.App/containerApps@2024-03-01' = {
  name: frontendAppName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: managedEnvironmentId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: registryServer
          username: acrCreds.username
          passwordSecretRef: 'acr-pwd'
        }
      ]
      secrets: [
        {
          name: 'acr-pwd'
          value: acrCreds.passwords[0].value
        }
        {
          name: 'appinsights'
          value: appInsightsConnectionString
        }
        {
          name: 'cosmos-conn'
          keyVaultReference: {
            secretName: 'cosmos-conn'
            keyVaultUri: keyVaultUri
          }
        }
      ]
      corsPolicy: {
        allowCredentials: false
        allowedOrigins: [ '*' ]
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${registryServer}/frontend:latest'
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
          env: [
            {
              name: 'APPINSIGHTS_CONNECTION_STRING'
              secretRef: 'appinsights'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: []
      }
    }
  }
}

resource backend 'Microsoft.App/containerApps@2024-03-01' = {
  name: backendAppName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: managedEnvironmentId
    configuration: {
      ingress: {
        external: false
        targetPort: 8000
      }
      registries: [
        {
          server: registryServer
          username: acrCreds.username
          passwordSecretRef: 'acr-pwd'
        }
      ]
      secrets: [
        {
          name: 'acr-pwd'
          value: acrCreds.passwords[0].value
        }
        {
          name: 'cosmos-conn'
          keyVaultReference: {
            secretName: 'cosmos-conn'
            keyVaultUri: keyVaultUri
          }
        }
        {
          name: 'openai-endpoint'
          keyVaultReference: {
            secretName: 'openai-endpoint'
            keyVaultUri: keyVaultUri
          }
        }
        {
          name: 'search-endpoint'
          keyVaultReference: {
            secretName: 'search-endpoint'
            keyVaultUri: keyVaultUri
          }
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${registryServer}/backend:latest'
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
          env: [
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              secretRef: 'openai-endpoint'
            }
            {
              name: 'AZURE_AI_SEARCH_ENDPOINT'
              secretRef: 'search-endpoint'
            }
            {
              name: 'COSMOS_CONNECTION_STRING'
              secretRef: 'cosmos-conn'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: []
      }
    }
  }
}

resource notificationJob 'Microsoft.App/jobs@2024-03-01' = {
  name: notificationJobName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityId}': {}
    }
  }
  properties: {
    environmentId: managedEnvironmentId
    configuration: {
      triggerType: 'Event'
      replicaRetryLimit: 3
      secrets: [
        {
          name: 'acr-pwd'
          value: acrCreds.passwords[0].value
        }
        {
          name: 'acs-conn'
          keyVaultReference: {
            secretName: 'acs-conn'
            keyVaultUri: keyVaultUri
          }
        }
      ]
      registries: [
        {
          server: registryServer
          username: acrCreds.username
          passwordSecretRef: 'acr-pwd'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'notifications'
          image: '${registryServer}/agents:latest'
          resources: {
            cpu: 0.25
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'ACS_CONNECTION_STRING'
              secretRef: 'acs-conn'
            }
          ]
        }
      ]
      scale: {
        minExecutions: 0
        maxExecutions: 3
      }
    }
  }
}

resource ingestionJob 'Microsoft.App/jobs@2024-03-01' = {
  name: ingestionJobName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityId}': {}
    }
  }
  properties: {
    environmentId: managedEnvironmentId
    configuration: {
      triggerType: 'Schedule'
      replicaRetryLimit: 2
      scheduleTriggerConfig: {
        cronExpression: '0 */6 * * *'
        parallelism: 1
      }
      secrets: [
        {
          name: 'acr-pwd'
          value: acrCreds.passwords[0].value
        }
        {
          name: 'storage-conn'
          keyVaultReference: {
            secretName: 'storage-conn'
            keyVaultUri: keyVaultUri
          }
        }
      ]
      registries: [
        {
          server: registryServer
          username: acrCreds.username
          passwordSecretRef: 'acr-pwd'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ingestion'
          image: '${registryServer}/agents:latest'
          resources: {
            cpu: 0.25
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'STORAGE_CONNECTION_STRING'
              secretRef: 'storage-conn'
            }
          ]
        }
      ]
      scale: {
        minExecutions: 0
        maxExecutions: 1
      }
    }
  }
}

output frontendAppId string = frontend.id
output backendAppId string = backend.id
output notificationJobName string = notificationJob.name
output ingestionJobName string = ingestionJob.name
