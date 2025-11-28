"""Placeholder Azure Maps client."""

from __future__ import annotations

from dataclasses import dataclass

from ..core.config import Settings


@dataclass
class AzureMapsClient:
    settings: Settings

    async def geocode(self, query: str) -> dict[str, float]:  # pragma: no cover - stub
        if not self.settings.azure_maps_client_id:
            return {"lat": 0.0, "lng": 0.0}
        # TODO: Call Azure Maps REST APIs
        return {"lat": 19.4326, "lng": -99.1332}
