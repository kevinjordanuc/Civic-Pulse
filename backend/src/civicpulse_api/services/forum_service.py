"""Forum service handling moderation hooks."""

from __future__ import annotations

from ..models import ForumThread
from ..repositories.forum_repository import ForumRepository


class ForumService:
    def __init__(self, repository: ForumRepository) -> None:
        self._repository = repository

    def list_threads(self) -> list[ForumThread]:
        return self._repository.list()
