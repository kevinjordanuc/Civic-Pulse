"""Notification filtering service."""

from __future__ import annotations

from datetime import datetime, timedelta

from ..models import NotificationItem, NotificationPreference
from ..services.profile_service import ProfileService


class NotificationsService:
    def __init__(self, profile_service: ProfileService) -> None:
        self._profile_service = profile_service

    def preview_notifications(self, profile_id: str) -> list[NotificationItem]:
        profile = self._profile_service.get_profile(profile_id)
        horizon = datetime.utcnow() - timedelta(days=7)
        base = NotificationItem(
            id="demo",
            title="Actualización de servicios",
            body="Nueva clínica municipal disponible en tu área",
            municipality=profile.municipality,
            published_at=datetime.utcnow(),
            tags=profile.interests,
        )
        return [base]

    def save_preferences(self, profile_id: str, prefs: NotificationPreference) -> NotificationPreference:
        # TODO: Persist in a real data store
        return prefs
