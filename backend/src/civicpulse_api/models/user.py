"""User and profile models."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AccessibilityPreferences(BaseModel):
    language: str = "es"
    font_scale: float = Field(default=1.0, ge=0.8, le=2.0)
    high_contrast: bool = False
    prefers_audio: bool = False


class CivicProfile(BaseModel):
    id: str
    display_name: str
    municipality: str
    interests: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    email: str | None = None
    phone: str | None = None
    accessibility: AccessibilityPreferences = Field(default_factory=AccessibilityPreferences)
    role: Literal["resident", "staff", "moderator"] = "resident"
