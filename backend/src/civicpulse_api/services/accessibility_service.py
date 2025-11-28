"""Accessibility helpers (translation, TTS stubs)."""

from __future__ import annotations


class AccessibilityService:
    async def synthesize(self, text: str, language: str = "es-MX") -> bytes:
        # TODO: Integrate Azure Speech once credentials are configured
        return text.encode("utf-8")
