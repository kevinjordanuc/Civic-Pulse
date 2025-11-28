"""Civic event model for the map panel."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CivicEvent(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float
    municipality: str
    address: str | None = None
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    tags: list[str] = Field(default_factory=list)
