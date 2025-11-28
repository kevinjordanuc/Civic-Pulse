"""Moderation façade for Azure Content Safety."""

from __future__ import annotations

from ..clients.content_safety import ContentSafetyClient


class ModerationService:
    def __init__(self) -> None:
        self._client: ContentSafetyClient | None = None

    def register_client(self, client: ContentSafetyClient | None) -> None:
        self._client = client

    async def is_safe(self, text: str) -> bool:
        if not self._client:
            return True
        return await self._client.is_safe(text)
