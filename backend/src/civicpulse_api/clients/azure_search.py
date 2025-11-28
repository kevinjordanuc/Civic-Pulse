"""Azure AI Search helper with safe fallbacks."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Optional

from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient

from ..core.config import Settings


@dataclass
class AzureSearchClient:
    settings: Settings
    _client: Optional[SearchClient] = None

    def __post_init__(self) -> None:
        if not (self.settings.azure_search_endpoint and self.settings.azure_search_index):
            return

        if self.settings.azure_search_api_key:
            credential: AzureKeyCredential | DefaultAzureCredential = AzureKeyCredential(
                self.settings.azure_search_api_key
            )
        else:
            credential = DefaultAzureCredential()

        self._client = SearchClient(
            endpoint=self.settings.azure_search_endpoint,
            index_name=self.settings.azure_search_index,
            credential=credential,
        )

    async def search(self, query: str) -> list[dict[str, str]]:  # pragma: no cover - stub
        if not self._client:
            return []

        def _run_search() -> list[dict[str, str]]:
            results = self._client.search(
                search_text=query or "*",
                top=3,
                include_total_count=False,
            )
            payload: list[dict[str, str]] = []
            for item in results:
                payload.append(
                    {
                        "title": str(item.get("title") or item.get("name") or "Documento oficial"),
                        "snippet": str(item.get("content") or item.get("summary") or ""),
                        "url": str(item.get("url") or ""),
                    }
                )
            return payload

        try:
            return await asyncio.to_thread(_run_search)
        except Exception:  # pragma: no cover - network/credential errors
            return []
