"""App-wide dependency container to keep wiring centralized."""

from __future__ import annotations

from dataclasses import dataclass

from .config import Settings


@dataclass(slots=True)
class AppContext:
    """Holds singleton services and configuration for dependency injection."""

    settings: Settings
    profile_service: "ProfileService"
    forum_service: "ForumService"
    chat_service: "ChatService"
    notifications_service: "NotificationsService"
    map_service: "MapService"
    accessibility_service: "AccessibilityService"
    moderation_service: "ModerationService"
    orchestrator: "Orchestrator"


def build_context(settings: Settings) -> AppContext:
    """Bootstraps the dependency tree."""

    from ..repositories.profile_repository import ProfileRepository
    from ..repositories.forum_repository import ForumRepository
    from ..repositories.events_repository import CivicEventRepository
    from ..services.profile_service import ProfileService
    from ..services.forum_service import ForumService
    from ..services.chat_service import ChatService
    from ..services.notifications_service import NotificationsService
    from ..services.map_service import MapService
    from ..services.accessibility_service import AccessibilityService
    from ..services.moderation_service import ModerationService
    from src.agents.orchestrator import Orchestrator

    profile_repo = ProfileRepository(settings)
    forum_repo = ForumRepository(settings)
    events_repo = CivicEventRepository(settings)

    profile_service = ProfileService(profile_repo)
    forum_service = ForumService(forum_repo)
    chat_service = ChatService(profile_service)
    notifications_service = NotificationsService(profile_service)
    map_service = MapService(events_repo)
    accessibility_service = AccessibilityService()
    moderation_service = ModerationService()
    orchestrator = Orchestrator()

    return AppContext(
        settings=settings,
        profile_service=profile_service,
        forum_service=forum_service,
        chat_service=chat_service,
        notifications_service=notifications_service,
        map_service=map_service,
        accessibility_service=accessibility_service,
        moderation_service=moderation_service,
        orchestrator=orchestrator,
    )
