"""FastAPI entrypoint for Civic Pulse."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.logging import configure_logging
from .dependencies import get_app_context, get_app_settings
from .routers import api_router
from .ws.routes import register_ws_routes


def create_app() -> FastAPI:
    """Application factory so tests can override dependencies."""

    configure_logging()
    settings = get_app_settings()

    app = FastAPI(title=settings.app_name, version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    app.include_router(api_router, prefix=settings.api_prefix)
    register_ws_routes(app)

    # Prime context on startup to fail fast if datasets are missing
    @app.on_event("startup")
    async def _startup() -> None:  # pragma: no cover - FastAPI hook
        get_app_context()

    return app


app = create_app()
