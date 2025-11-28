"""Placeholder client for Azure AI Content Safety."""

from __future__ import annotations

from dataclasses import dataclass

from ..core.config import Settings


@dataclass
class ContentSafetyClient:
    settings: Settings

    async def is_safe(self, text: str) -> bool:  # pragma: no cover - stub
        if not self.settings.azure_content_safety_endpoint:
            return True
        # TODO: Add Azure Content Safety SDK call
        return True
