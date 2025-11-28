"""Notification routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..dependencies import get_app_context
from ..models import NotificationItem

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/preview", response_model=list[NotificationItem])
def preview(profile_id: str = Query(...), context=Depends(get_app_context)) -> list[NotificationItem]:
    return context.notifications_service.preview_notifications(profile_id)
