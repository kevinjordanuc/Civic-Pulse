"""Profile management service."""

from __future__ import annotations

from ..models import CivicProfile
from ..repositories.profile_repository import ProfileRepository


class ProfileService:
    def __init__(self, repository: ProfileRepository) -> None:
        self._repository = repository

    def list_profiles(self) -> list[CivicProfile]:
        return self._repository.list()

    def get_profile(self, profile_id: str) -> CivicProfile:
        profile = self._repository.get_by_id(profile_id)
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")
        return profile
