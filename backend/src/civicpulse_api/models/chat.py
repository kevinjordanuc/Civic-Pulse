"""Chat-related DTOs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    profile_id: str | None = None
    locale: str = "es-MX"


class ChatResponse(BaseModel):
    answer: str
    citations: list[str] = Field(default_factory=list)
    moderated: bool = False
