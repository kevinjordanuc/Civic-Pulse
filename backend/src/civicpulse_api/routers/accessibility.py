"""Accessibility endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..dependencies import get_app_context

router = APIRouter(prefix="/accessibility", tags=["accessibility"])


@router.post("/tts")
async def text_to_speech(payload: dict[str, str], context=Depends(get_app_context)) -> dict[str, str]:
    text = payload.get("text", "")
    language = payload.get("language", "es-MX")
    audio_bytes = await context.accessibility_service.synthesize(text, language)
    return {"preview": audio_bytes.decode("utf-8", errors="ignore")}
