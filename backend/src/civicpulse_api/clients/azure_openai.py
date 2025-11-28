"""Azure OpenAI client with graceful fallbacks."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Optional

from azure.ai.openai import OpenAIClient
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential

from ..core.config import Settings


@dataclass
class AzureOpenAIClient:
    settings: Settings
    _client: Optional[OpenAIClient] = None

    def __post_init__(self) -> None:
        endpoint = self.settings.azure_openai_endpoint
        deployment = self.settings.azure_openai_deployment
        if not (endpoint and deployment):
            return

        credential: AzureKeyCredential | DefaultAzureCredential
        if self.settings.azure_openai_api_key:
            credential = AzureKeyCredential(self.settings.azure_openai_api_key)
        else:
            credential = DefaultAzureCredential()

        self._client = OpenAIClient(
            endpoint=endpoint,
            credential=credential,
            api_version=self.settings.azure_openai_api_version,
        )

    async def respond(self, prompt: str) -> str:  # pragma: no cover - stub
        """Return an Azure OpenAI answer or a descriptive fallback."""

        if not (self._client and self.settings.azure_openai_deployment):
            return (
                "Este es un stub del asistente cívico. Configure Azure OpenAI para respuestas reales."
            )

        def _invoke() -> str:
            response = self._client.get_chat_completions(
                deployment_id=self.settings.azure_openai_deployment,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Eres un asistente municipal imparcial. Usa datos oficiales y cites fuentes "
                            "cuando estén disponibles."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=400,
            )
            choice = response.choices[0]
            content = choice.message.content
            if isinstance(content, list):
                return "".join(getattr(part, "text", "") for part in content)
            return str(content or "")

        try:
            return await asyncio.to_thread(_invoke)
        except Exception as exc:  # pragma: no cover - network issues
            return f"No pudimos contactar Azure OpenAI ({exc})."
