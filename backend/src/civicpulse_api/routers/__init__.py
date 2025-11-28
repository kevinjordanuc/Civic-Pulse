"""API router wiring."""

from __future__ import annotations

from fastapi import APIRouter

from . import accessibility, chat, forums, health, map, notifications, profiles

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(profiles.router)
api_router.include_router(chat.router)
api_router.include_router(map.router)
api_router.include_router(notifications.router)
api_router.include_router(forums.router)
api_router.include_router(accessibility.router)

__all__ = ["api_router"]
