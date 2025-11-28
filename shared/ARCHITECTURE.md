# Civic Pulse Architecture (Nov 2025)

## High-level Overview

```mermaid
graph TD
    subgraph Frontend (Next.js 15 / App Router)
        AppShell --> Panels[Chat, Map, Notifications, Feed]
        Panels --> Stores[Zustand Stores]
        Stores --> APIClient
        Panels --> MockData[Offline datasets]
    end

    subgraph Backend (FastAPI)
        APIRouter --> Services --> Repositories --> DataSets
        Services --> AzureClients[Azure SDK facades]
        APIRouter --> WS[WebSockets]
    end

    APIClient -->|REST / WS| APIRouter
    MockData --> Panels
    AzureClients -->|Azure creds| Azure[Azure Services]
```

## Current Behaviour & Data Flow

1. **Frontend resilience:** `MapPanel`, agenda y calendario usan `fetchEvents`. Si la API falla o responde vacío, el cliente recurre a `src/data/civicEvents.ts`, que contiene los eventos reales (incluidos los PDFs del HCD proporcionados).
2. **AppShell:** renderiza paneles y sidebar. `MapPanel` se carga dinámicamente sin SSR y emplea Leaflet con OSM tiles. Los demás paneles consumen datos estáticos (`communityPosts`, `feedInsights`) o API mocks.
3. **Calendario y rutas /eventos:** el modal del calendario consulta el mapa para habilitar días; la página `/eventos/[date]` vuelve a usar los mocks si la API no responde, garantizando contenido offline.
4. **Backend FastAPI:** expone `/api/map/events`, `/api/chat/...`, `/api/notifications/...` etc. Cada router delega en servicios y repositorios que leen `backend/data/*.json`. Los agentes (educator, moderation, RAG, etc.) ya están conectados a settings pero requieren credenciales reales para operar contra Azure.
5. **Azure clients:** `clients/azure_openai.py`, `azure_search.py`, `content_safety.py` encapsulan los SDK. Hoy se inicializan con los valores del `.env`, pero el backend puede arrancar aun si faltan claves al permanecer en modo demo (retorna datos de JSON).
6. **Config:** `backend/config/.env.example` documenta todas las claves necesarias (OpenAI, Search, Content Safety, ACS, storage, instrumentation y Service Principal). El settings carga primero `config/.env`, luego `.env` en la raíz si existe.
7. **Notifications & WebSockets:** el servicio usa `notifications_agent.py` con Azure Communication Services (`AZURE_COMMUNICATION_CONNECTION_STRING`). Los endpoints WebSocket están listos en `ws/routes.py`, aunque la UI aún no consume streaming en producción.
