"""Chat orchestration service."""

from __future__ import annotations

from ..clients.azure_openai import AzureOpenAIClient
from ..clients.azure_search import AzureSearchClient
from ..models import ChatRequest, ChatResponse
from ..services.profile_service import ProfileService


class ChatService:
    def __init__(self, profile_service: ProfileService) -> None:
        self._profile_service = profile_service
        self._llm_client: AzureOpenAIClient | None = None
        self._search_client: AzureSearchClient | None = None

    def register_clients(
        self,
        llm_client: AzureOpenAIClient | None,
        search_client: AzureSearchClient | None,
    ) -> None:
        self._llm_client = llm_client
        self._search_client = search_client

    async def chat(self, payload: ChatRequest) -> ChatResponse:
        profile = (
            self._profile_service.get_profile(payload.profile_id)
            if payload.profile_id
            else None
        )
        summary = profile.display_name if profile else "ciudadano"
        question = payload.messages[-1].content if payload.messages else ""

        if self._llm_client:
            answer = await self._llm_client.respond(question)
        else:
            answer = (
                "Hola {name}, pronto conectaremos este chat con Azure OpenAI para informes oficiales."
            ).format(name=summary)

        citations: list[str] = []
        if self._search_client:
            snippets = await self._search_client.search(question)
            citations = [item.get("url", "") for item in snippets]

        return ChatResponse(answer=answer, citations=[c for c in citations if c])
