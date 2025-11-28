"""Forums endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..dependencies import get_app_context
from ..models import ForumThread

router = APIRouter(prefix="/forums", tags=["forums"])


@router.get("/", response_model=list[ForumThread])
def list_threads(context=Depends(get_app_context)) -> list[ForumThread]:
    return context.forum_service.list_threads()
