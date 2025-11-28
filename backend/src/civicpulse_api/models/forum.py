"""Forum threads and posts."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ForumPost(BaseModel):
    id: str
    author: str
    content: str
    created_at: datetime
    moderated: bool = False


class ForumThread(BaseModel):
    id: str
    title: str
    municipality: str
    tags: list[str] = Field(default_factory=list)
    posts: list[ForumPost] = Field(default_factory=list)
