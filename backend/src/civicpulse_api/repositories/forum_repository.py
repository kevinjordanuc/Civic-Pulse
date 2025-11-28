"""Forums data access."""

from __future__ import annotations

from .base import JSONRepository
from ..core.config import Settings
from ..models.forum import ForumThread


class ForumRepository(JSONRepository):
    def __init__(self, settings: Settings) -> None:
        super().__init__(settings, "user_forums.json")

    def list(self) -> list[ForumThread]:
        return [ForumThread.model_validate(item) for item in self.load()]
