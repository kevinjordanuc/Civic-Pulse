"""FastAPI dependency helpers."""

from __future__ import annotations

from functools import lru_cache

from .clients.azure_openai import AzureOpenAIClient
from .clients.azure_search import AzureSearchClient
from .clients.content_safety import ContentSafetyClient
from .core.config import Settings, get_settings
from .core.context import AppContext, build_context


@lru_cache(maxsize=1)
def get_app_settings() -> Settings:
    """Return cached settings instance."""

    return get_settings()


@lru_cache(maxsize=1)
def get_app_context() -> AppContext:
    """Return a bootstrapped service container."""

    context = build_context(get_app_settings())
    context.chat_service.register_clients(
        llm_client=AzureOpenAIClient(context.settings),
        search_client=AzureSearchClient(context.settings),
    )
    context.moderation_service.register_client(
        ContentSafetyClient(context.settings)
    )
    return context
