"""Conectores listos para Microsoft Foundry (Azure AI) usando Semantic Kernel."""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

try:  # pragma: no cover - depende de paquetes opcionales
    from semantic_kernel import Kernel
    from semantic_kernel.connectors.ai.azure_ai_inference import AzureAIInferenceChatCompletion
    from azure.identity import DefaultAzureCredential
except Exception:  # pragma: no cover
    Kernel = None  # type: ignore
    AzureAIInferenceChatCompletion = None  # type: ignore
    DefaultAzureCredential = None  # type: ignore

KernelType = Any

load_dotenv()


@dataclass
class AzureConfig:
    endpoint: str
    deployment: str
    api_version: str
    project_scope: Optional[str] = None

    @classmethod
    def from_env(cls) -> "AzureConfig":
        return cls(
            endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", ""),
            deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT", ""),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
            project_scope=os.getenv("AZURE_PROJECT", None),
        )


class AzureSemanticKernelClient:
    """Inicializa Semantic Kernel y ejecuta prompts con contexto estructurado."""

    def __init__(self, config: Optional[AzureConfig] = None) -> None:
        self.config = config or AzureConfig.from_env()
        self.kernel: Optional[KernelType] = None
        if Kernel and AzureAIInferenceChatCompletion and DefaultAzureCredential:
            credential = DefaultAzureCredential(exclude_shared_token_cache_credential=True)
            try:
                # Intentamos conectar con Azure AI Inference (MaaS) o Azure OpenAI
                # Si se prefiere Azure OpenAI nativo, cambiar a AzureChatCompletion
                connector = AzureAIInferenceChatCompletion(
                    ai_model_id=self.config.deployment,
                    endpoint=self.config.endpoint,
                    credential=credential,
                )
                self.kernel = Kernel()
                self.kernel.add_service(connector)
            except Exception as e:
                print(f"Warning: No se pudo inicializar Azure AI Kernel: {e}")
                self.kernel = None

    def summarize_context(self, piezas: List[Dict[str, Any]]) -> str:
        """Compacta registros para ahorrar tokens antes de llamar al modelo."""
        bloques = []
        for pieza in piezas:
            titulo = pieza.get("titulo") or pieza.get("nombre")
            resumen = pieza.get("descripcion") or pieza.get("resumen")
            ubicacion = pieza.get("municipio", "")
            bloques.append(f"- {titulo} ({ubicacion}): {resumen}")
        return "\n".join(bloques[:6])

    async def run_chat(
        self,
        pregunta: str,
        perfil: Dict[str, Any],
        contexto: List[Dict[str, Any]],
        limitacion: str = "No se permiten recomendaciones políticas",
    ) -> str:
        """Construye prompt seguro y obtiene respuesta de Azure AI."""
        if not self.kernel:
            return (
                "(Modo sin conexión) Conecta Semantic Kernel para obtener respuestas "
                "enriquecidas con tus fuentes oficiales."
            )
        contexto_compacto = self.summarize_context(contexto)
        prompt = (
            "Eres CivicAI, una asistente cívica neutral. Responde en el idioma preferido del usuario.\n"
            f"Idioma: {perfil.get('idioma', 'es')}\n"
            f"Ubicación usuario: {perfil.get('municipio')}\n"
            f"Temas de interés: {', '.join(perfil.get('intereses', []))}\n"
            f"Restricción dura: {limitacion}. No emitas opiniones políticas.\n"
            "Contexto oficial disponible:\n"
            f"{contexto_compacto}\n"
            "Pregunta ciudadana: {{input}}\n"
            "Responde con tono educativo, máximo 3 párrafos cortos.")
        function = self.kernel.create_semantic_function(prompt, max_tokens=400, temperature=0.2)
        resultado = await function.invoke_async(input=pregunta)
        return str(resultado)
