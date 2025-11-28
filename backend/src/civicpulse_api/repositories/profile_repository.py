"""Profile repository backed by static JSON demo data."""

from __future__ import annotations

from typing import Iterable

from .base import JSONRepository
from ..core.config import Settings
from ..models.user import CivicProfile


class ProfileRepository(JSONRepository):
    def __init__(self, settings: Settings) -> None:
        super().__init__(settings, "profiles.json")

    def list(self) -> list[CivicProfile]:
        return [CivicProfile.model_validate(item) for item in self.load()]

    def get_by_id(self, profile_id: str) -> CivicProfile | None:
        return next((profile for profile in self.list() if profile.id == profile_id), None)

    def search_by_tags(self, tags: Iterable[str]) -> list[CivicProfile]:
        tag_set = {tag.lower() for tag in tags}
        return [profile for profile in self.list() if tag_set.intersection({t.lower() for t in profile.tags})]
