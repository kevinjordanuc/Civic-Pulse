
**Civic-Pulse** es una plataforma de inteligencia cívica **multi-agente** construida con Azure AI. Se adapta al entorno y necesidades del usuario, ingiriendo datos públicos, respondiendo consultas, brindando explicaciones educativas, entregando notificaciones personalizadas y aplicando moderación de seguridad para una participación comunitaria informada.

Este MVP fue construido con Streamlit para el Hackathon Innovation Challenge 2025.

## 🎯 El Problema
A pesar de que la información pública existe, es difícil de consumir. Los ciudadanos enfrentan barreras de lenguaje técnico, datos dispersos y canales de comunicación estáticos que no responden dudas personales. Esta fricción genera desinformación, apatía y desconexión con la vida comunitaria local.

## 💡 La Solución
**Civic-Pulse** ues una plataforma de inteligencia cívica multi-agente impulsada por Azure AI. No solo muestra datos; "traduce" la burocracia a un lenguaje ciudadano mediante un chat educativo neutral, personaliza alertas según los intereses del vecino y protege el tejido social mediante foros con moderación automática de seguridad.

## Características principales

- **Ingreso y perfil persistente**: Preferencias de idioma, intereses, ubicación y opciones de accesibilidad (tamaño de texto, traducción, lectura en voz alta).
- **Chat Cívico Inteligente**: Orquestado por **Semantic Kernel** y **Azure OpenAI**. Responde preguntas sobre eventos y boletas electorales con contexto local y neutralidad garantizada.
- **Mapa interactivo**: Visualización de eventos y servicios públicos relevantes para la ubicación del ciudadano.
- **Notificaciones personalizadas**: Sistema de alertas filtradas por municipio, intereses y frecuencia deseada.
- **Foros moderados por IA**: Espacios de diálogo protegidos por **Azure AI Content Safety**, que detecta y bloquea automáticamente discursos de odio o violencia.
- **Accesibilidad Universal**: Integración con **Azure AI Speech** (texto a voz neural) y **Azure Translator** para romper barreras de idioma y lectura.

## 🧪 Casos de Uso (Demo)

Para probar las capacidades del sistema, intenta estas interacciones en el chat:

1.  **Educación Cívica**: *"¿Qué significa la pregunta 1 de la boleta electoral?"* (El agente buscará en la data oficial y explicará términos complejos).
2.  **Información Hiperlocal**: *"¿Hay algún evento de reciclaje cerca de mi municipio?"* (El orquestador filtrará eventos por tu ubicación en el perfil).
3.  **Moderación de Seguridad**: Intenta escribir un mensaje agresivo en el foro. (El agente `ModerationAgent` interceptará el mensaje antes de publicarlo).

### Flujo de Orquestación

```mermaid
graph TD
  A[Usuario] -->|Consulta| B(Orquestador FastAPI)
  B -->|Análisis de Seguridad| C{Azure Content Safety}
  C -->|Inseguro| D[Bloqueo / Advertencia (ACS + Logs)]
  C -->|Seguro| E{Router de Intención}
  E -->|Duda compleja| F[Educator Agent \n (Azure OpenAI + Azure Search)]
  E -->|Dato oficial| G[RAG Agent \n (Azure OpenAI + Azure Search Index)]
  E -->|Novedades| H[Notification Agent \n (Event Grid + Communication Services)]
  F & G & H -->|Respuesta Generada| I[Respuesta Final \n (Web App / Web PubSub)]
```

- El frontend Next.js entrega la consulta al orquestador FastAPI, que aplica Azure Content Safety antes de cualquier procesamiento.
- El router de intención enruta la petición al agente adecuado: `Educator Agent` usa Azure OpenAI y Azure Search para explicaciones, `RAG Agent` obtiene información oficial desde Azure AI Search/Cosmos DB, y `Notification Agent` publica tareas en Event Grid y Azure Communication Services.
- La respuesta final se entrega al usuario vía WebSockets (Web PubSub) o REST, y se audita mediante Application Insights.

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
# Windows:
.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
streamlit run app.py
```

## Configuración (Obligatoria)

Para que los agentes de IA funcionen, debes configurar tus credenciales en un archivo `.env` (basado en `config/.env.example`):

1.  **Chat**: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION` (o `AZURE_OPENAI_KEY` si no usas DefaultAzureCredential).
2.  **Moderación**: `AZURE_CONTENT_SAFETY_ENDPOINT`, `AZURE_CONTENT_SAFETY_KEY`.
3.  **Identidad Administrada**: `en el servicio donde hospedarás el MVP y asigna permisos mínimos (Cognitive Services Contributor, Search Index Data Reader, Maps Data Reader, etc.).`
4.  **Accesibilidad**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`.

> **Nota**: Si no configuras estas variables, la aplicación funcionará en "modo local" con funcionalidades limitadas (respuestas predefinidas, sin moderación).




| Componente | Agente / Archivo | Descripción |
| --- | --- | --- |
| Chat Cívico | `Orchestrator` + `EducatorAgent` | Coordina la respuesta usando Semantic Kernel. `EducatorAgent` explica conceptos. |
| Datos oficiales | `RAGAgent` | Busca información en documentos oficiales (simulado o Azure Search). |
| Mapa interactivo | `app.py` + `IngestionAgent` | `IngestionAgent` carga eventos georreferenciados. |
| Notificaciones | `NotificationAgent` | Filtra alertas relevantes y conecta con Azure Communication Services. |
| Foros | `ModerationAgent` | Evalúa toxicidad con Azure AI Content Safety antes de publicar. |
| Accesibilidad | `accessibility.py` | Servicios de Azure Speech y Translator. |

## Arquitectura Multi-Agente

| Agente / Módulo | Estado | Tecnología Azure |
| --- | --- | --- |
| **Agente Conversacional** | ✅ Implementado | Semantic Kernel + Azure OpenAI |
| **Agente de Moderación** | ✅ Implementado | Azure AI Content Safety |
| **Agente de Accesibilidad** | ✅ Implementado | Azure AI Speech + Translator |
| **Datos Oficiales** | ⚠️ Simulado (JSON) | (Próximo paso: Azure AI Search) |
| **Mapa** | ⚠️ PyDeck | (Próximo paso: Azure Maps) |

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
