"""Map-focused application service."""

from __future__ import annotations

from ..models import CivicEvent
from ..repositories.events_repository import CivicEventRepository


class MapService:
    def __init__(self, repository: CivicEventRepository) -> None:
        self._repository = repository

    def list_events(self, municipality: str | None = None) -> list[CivicEvent]:
        events = self._repository.list()
        if municipality:
            return [event for event in events if event.municipality == municipality]
        return events
