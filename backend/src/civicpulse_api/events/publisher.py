"""Event publisher placeholder for Azure Event Grid / ACS."""

from __future__ import annotations


class NotificationPublisher:
    async def publish(self, payload: dict) -> None:  # pragma: no cover - stub
        # TODO: Wire Azure Event Grid or Communication Services
        return None
