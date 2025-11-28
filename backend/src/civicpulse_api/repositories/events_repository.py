"""Repository for civic events and services."""

from __future__ import annotations

from .base import JSONRepository
from ..core.config import Settings
from ..models.map import CivicEvent


class CivicEventRepository(JSONRepository):
    def __init__(self, settings: Settings) -> None:
        super().__init__(settings, "events.json")

    def list(self) -> list[CivicEvent]:
        return [CivicEvent.model_validate(item) for item in self.load()]
