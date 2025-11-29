
**Civic-Pulse** is a multi-agent civic intelligence platform built with Azure AI. It adapts to the user’s environment and needs by ingesting public data, answering queries, providing educational explanations, delivering personalized notifications, and applying safety moderation for informed community participation. This MVP was built with Streamlit for the Hackathon Innovation Challenge 2025.

## 🎯 The problem
Although public information exists, it is difficult to consume. Citizens face barriers such as technical language, scattered data, and static communication channels that do not respond to personal questions. This friction generates misinformation, apathy, and disconnection from local community life.

## 💡 The solution
**Civic-Pulse** is a multi-agent civic intelligence platform powered by Azure AI. It doesn’t just display data; it “translates” bureaucracy into citizen-friendly language through a neutral educational chat, personalizes alerts based on residents’ interests, and protects the social fabric through forums with automatic safety moderation.

## Key features

- **Persistent login and profile**: Language preferences, interests, location, and accessibility options (text size, translation, text-to-speech).
- **Smart Civic Chat**: Orchestrated by **Semantic Kernel** and **Azure OpenAI**. Answers questions about events and ballots with local context and guaranteed neutrality.
- **Interactive Map**: Visualization of events and public services relevant to the citizen’s location.
- **Personalized notifications**: Alert system filtered by municipality, interests, and desired frequency.
- **AI-Moderated forums**: Dialogue spaces protected by **Azure AI Content Safety**, which automatically detects and blocks hate speech or violence.
- **Universal accessibility**: Integration with **Azure AI Speech** (neural text-to-speech) and **Azure Translator** to break language and reading barriers.

## 🧪 Use Cases

1.  **Civic education**: *“What does question 1 on the ballot mean?”* (The agent will search official data and explain complex terms.)
2.  **Hyperlocal Information**: *“Is there a recycling event near my municipality?”* (The orchestrator will filter events by your profile location.)
3.  **Safety moderation**: Try writing an aggressive message in the forum. (The ModerationAgent will intercept the message before publishing.)

### Azure Infrastructure Overview

![Azure Infrastructure](assets/Azure%20Infraestructure.png)

### Orchestration flow

- The Next.js frontend sends the query to the FastAPI orchestrator, which applies Azure Content Safety before any processing.
- The intent router directs the request to the appropriate agent:
    - Educator Agent uses Azure OpenAI and Azure Search for explanations.
    - RAG Agent retrieves official information from Azure AI Search/Cosmos DB.
    - Notification Agent publishes tasks in Event Grid and Communication Services.
- The final response is delivered to the user via WebSockets (Web PubSub) or REST, and audited through Application Insights.

## Prerequisites

- Python 3.10+
- Account in Microsoft Foundry or Azure with access to:
  - Azure OpenAI / Models (for Semantic Kernel)
  - Azure AI Search (to index official bulletins)
  - Azure Maps (for geospatial layers)
  - Azure Communication Services o Event Grid (for alerts)
  - Azure AI Content Safety (for forum moderation)

## Infrastructure Deployment

This project includes a Bicep template to automate the provisioning of the required Azure infrastructure (App Service, Azure OpenAI, Cosmos DB, etc.).

1.  **Install Azure CLI**: Ensure you have the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed.
2.  **Login**: `az login`
3.  **Create Resource Group**:
    ```bash
    az group create --name rg-civic-pulse-dev --location eastus
    ```
4.  **Deploy Resources**:
    ```bash
    az deployment group create --resource-group rg-civic-pulse-dev --template-file infra/main.bicep --parameters infra/parameters.json
    ```
5.  **Configure Environment**: Use the outputs from the deployment to populate your `.env` file.

## Installation and local execution

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
streamlit run app.py
```

## Configuration

For the AI agents to work, you must configure your credentials in a .env file (based on config/.env.example):

1.  **Chat**: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION` (or `AZURE_OPENAI_KEY` if you are not using DefaultAzureCredential).
2.  **Moderation**: `AZURE_CONTENT_SAFETY_ENDPOINT`, `AZURE_CONTENT_SAFETY_KEY`.
3.  **Managed Identity**: `n the service where you will host the MVP, assign minimum permissions (Cognitive Services Contributor, Search Index Data Reader, Maps Data Reader, etc.).`
4.  **Accessibility**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`.

> **Note**: If you don’t configure these variables, the application will run in “local mode” with limited functionality (predefined responses, no moderation).




| Component | Agente / Archivo | Descripción |
| --- | --- | --- |
| Civic Chat | `Orchestrator` + `EducatorAgent` | Coordinates responses using Semantic Kernel. `EducatorAgent` explains concepts. |
| Official Data | `RAGAgent` | Searches information in official documents (simulated or Azure Search). |
| Interactive Map | `app.py` + `IngestionAgent` | `IngestionAgent` loads georeferenced events. |
| Notifications | `NotificationAgent` | Filters relevant alerts and connects with Azure Communication Services. |
| Forums | `ModerationAgent` | Evaluates toxicity with Azure AI Content Safety before publishing. |
| Accessibility | `accessibility.py` | Azure Speech and Translator services. |


## Security Best Practices

- Do not store secrets in plain text. Use Azure Key Vault or managed environment variables.
- Enable DefaultAzureCredential to use Managed Identity in production.
- Validate user inputs (e.g., is_safe_text) and complement with Azure Content Safety.
- Limit the number of tokens and add logging/auditing using Application Insights.

## Suggested Roadmap 

1.- Connect real sources via Azure AI Search and official dashboards.
2.- Replace the chat stub with a full agent in Semantic Kernel with tools (RAG + functions).
3.- Integrate Azure Maps with dynamic layers and geofencing.
4.- Automate notifications with Event Grid + Communication Services.
5.- Implement real-time forums with Azure Web PubSub and reinforced moderation.

## References

- [Semantic Kernel Python](https://github.com/microsoft/semantic-kernel)
- [Microsoft Foundry (Azure AI) Documentation](https://learn.microsoft.com/azure/ai-services/)
- [Azure Content Safety](https://learn.microsoft.com/azure/ai-services/content-safety/)
