"""Profiles endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..dependencies import get_app_context
from ..models import CivicProfile, NotificationPreference
from ..services.notifications_service import NotificationsService

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/", response_model=list[CivicProfile])
def list_profiles(context=Depends(get_app_context)) -> list[CivicProfile]:
    return context.profile_service.list_profiles()


@router.get("/{profile_id}/notifications", response_model=list)
def preview_notifications(profile_id: str, context=Depends(get_app_context)) -> list:
    return [item.model_dump() for item in context.notifications_service.preview_notifications(profile_id)]


@router.put("/{profile_id}/notifications", response_model=NotificationPreference)
def update_notification_preferences(
    profile_id: str,
    payload: NotificationPreference,
    context=Depends(get_app_context),
) -> NotificationPreference:
    return context.notifications_service.save_preferences(profile_id, payload)
