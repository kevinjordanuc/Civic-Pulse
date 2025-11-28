"""Map endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..dependencies import get_app_context
from ..models import CivicEvent

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/events", response_model=list[CivicEvent])
def list_events(
    municipality: str | None = Query(default=None, description="Filters events by municipality"),
    context=Depends(get_app_context),
) -> list[CivicEvent]:
    return context.map_service.list_events(municipality)
