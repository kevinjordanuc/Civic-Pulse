"""Chat endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_app_context
from ..models import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/completions", response_model=ChatResponse)
async def create_completion(payload: ChatRequest, context=Depends(get_app_context)) -> ChatResponse:
    return await context.chat_service.chat(payload)


@router.post("/orchestrator", response_model=ChatResponse)
async def orchestrate_chat(payload: ChatRequest, context=Depends(get_app_context)) -> ChatResponse:
    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    try:
        profile = context.profile_service.get_profile(payload.profile_id) if payload.profile_id else None
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    latest_message = payload.messages[-1].content
    user_profile = profile.model_dump() if profile else {"locale": payload.locale}
    answer = context.orchestrator.process_request(latest_message, user_profile)
    return ChatResponse(answer=answer, citations=[])
