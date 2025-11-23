<<<<<<< HEAD
# CivicAI Hub

MVP construido con Streamlit para el Hackathon Innovation Challenge 2025. El objetivo es brindar información cívica oficial, personalizada e inclusiva mediante chat neutral, mapa interactivo y foros moderados.

## Características principales

- **Ingreso y perfil** con preferencias de idioma, intereses, ubicación y opciones de accesibilidad (tamaño de texto, traducción, lectura en voz alta).
- **Chat Cívico** orquestado a través de `CivicChatEngine`, preparado para Semantic Kernel y Microsoft Foundry (Azure AI). Incluye respuesta local de respaldo para demostraciones sin conexión.
- **Mapa interactivo** basado en `pydeck` con eventos y servicios públicos relevantes para la ubicación del ciudadano.
- **Notificaciones personalizadas** filtradas por municipio, intereses y frecuencia deseada.
- **Foros moderados** con reglas básicas y ganchos para conectarse a Azure AI Content Safety.

## Estructura del repositorio

```
CivicAIHub/
├── app.py                  # App Streamlit principal
├── requirements.txt        # Dependencias
├── README.md
├── config/.env.example     # Variables sugeridas para conectar a Microsoft Foundry / Azure
├── data/                   # Catálogos de ejemplo (eventos, servicios, boletas, alertas)
└── src/
    ├── accessibility.py    # Traducción simplificada y TTS (stub a reemplazar por Azure Speech)
    ├── azure_integration.py# Cliente Semantic Kernel + AzureAIInference
    ├── chat_engine.py      # Orquestador del asistente neutral
    ├── data_loader.py      # Utilidades para leer catálogos
    ├── moderation.py       # Reglas básicas + placeholder de Azure Content Safety
    └── notifications.py    # Filtro para alertas personalizadas
```

## Requerimientos previos

- Python 3.10+
- Cuenta en Microsoft Foundry o Azure con acceso a:
  - Azure OpenAI / Models (para Semantic Kernel)
  - Azure AI Search (para indexar boletines oficiales)
  - Azure Maps (para capas geoespaciales)
  - Azure Communication Services o Event Grid (para alertas)
  - Azure AI Content Safety (para moderación de foros)

## Instalación y ejecución local

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## Configurar credenciales de Azure / Microsoft Foundry

1. Copia `config/.env.example` a `.env` y completa los valores:
   - `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION` (usa identidad administrada cuando despliegues en Azure App Service o Container Apps).
   - `AZURE_AI_SEARCH_ENDPOINT` y `AZURE_AI_SEARCH_INDEX` para recuperar boletines indexados.
   - `AZURE_MAPS_CLIENT_ID` para sustituir `pydeck` por Azure Maps.
2. Configura una **Identidad Administrada** en el servicio donde hospedarás el MVP y asigna permisos mínimos (Cognitive Services Contributor, Search Index Data Reader, Maps Data Reader, etc.).
3. (Opcional) Define `AZURE_TELEMETRY_CONNECTION` para enviar métricas a Application Insights.

## Cómo conectar cada módulo a Azure

| Módulo | Archivo | Paso siguiente |
| --- | --- | --- |
| Chat Cívico | `src/azure_integration.py` | Instala `semantic-kernel` y `agent-framework-azure-ai --pre`, registra el deployment de Microsoft Foundry, reemplaza los stubs y llena `.env`. |
| Datos oficiales | `src/chat_engine.py` | Integra Azure AI Search o Cosmos DB para traer recortes oficiales en `build_context`. |
| Mapa interactivo | `app.py` (`_render_map`) | Sustituye `pydeck` por Azure Maps Web Control o Map Control SDK usando `AZURE_MAPS_CLIENT_ID`. |
| Notificaciones | `src/notifications.py` | Conecta los resultados filtrados con Azure Communication Services (correo/SMS) o Azure Event Grid. |
| Foros | `src/moderation.py` | Llama a Azure AI Content Safety y usa Azure Web PubSub/SignalR para actualizaciones en vivo. |
| Accesibilidad | `src/accessibility.py` | Cambia `gTTS` por Azure AI Speech y Azure Translator para cobertura completa de idiomas. |

## Buenas prácticas de seguridad

- No guardes secretos en texto plano. Utiliza Azure Key Vault o variables de entorno gestionadas.
- Habilita `DefaultAzureCredential` para usar Identidad Administrada en producción.
- Valida entradas del usuario (ej. `is_safe_text`) y complementa con Azure Content Safety.
- Limita el número de tokens y agrega registro/auditoría usando Application Insights.

## Roadmap sugerido

1. Conectar fuentes reales mediante Azure AI Search y tableros oficiales.
2. Sustituir el stub del chat por un agente completo en Semantic Kernel con herramientas (RAG + funciones).
3. Integrar Azure Maps con capas dinámicas y geofencing.
4. Automatizar notificaciones con Event Grid + Communication Services.
5. Implementar foros en tiempo real con Azure Web PubSub y moderación reforzada.

## Referencias

- [Semantic Kernel Python](https://github.com/microsoft/semantic-kernel)
- [Microsoft Foundry (Azure AI) Documentation](https://learn.microsoft.com/azure/ai-services/)
- [Azure Content Safety](https://learn.microsoft.com/azure/ai-services/content-safety/) 
=======
# Civic-Pulse
CivicPulse is a multi-agent civic intelligence platform built with Azure AI. It adapts to the user’s environment and needs, ingesting public data, answering queries, providing educational explanations, delivering personalized notifications, and applying safety moderation for informed community engagement.
>>>>>>> 8ef57b581d91e3f089dcf44b934253e44b72efdb
