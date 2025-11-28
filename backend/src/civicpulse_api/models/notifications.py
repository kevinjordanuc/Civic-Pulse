"""Notification DTOs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class NotificationPreference(BaseModel):
    channels: list[str] = Field(default_factory=lambda: ["email"])
    frequency: str = "daily"
    interests: list[str] = Field(default_factory=list)


class NotificationItem(BaseModel):
    id: str
    title: str
    body: str
    municipality: str
    published_at: datetime
    tags: list[str] = Field(default_factory=list)
