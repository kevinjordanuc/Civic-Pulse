from typing import Dict, Any
import os

try:
    from semantic_kernel import Kernel
    from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
    SK_AVAILABLE = True
except ImportError:
    SK_AVAILABLE = False


class EducatorAgent:
    """
    Agente que transforma preguntas del usuario en explicaciones claras y neutrales
    usando Azure OpenAI vía Semantic Kernel. Si no hay SK o credenciales, se usa
    un fallback local.
    """

    def __init__(self):
        # Detectamos si hay credenciales configuradas
        self.azure_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.azure_model = os.getenv("AZURE_OPENAI_MODEL", "civicai-gpt1")

        self.use_real_llm = (
            SK_AVAILABLE and
            self.azure_key and
            self.azure_endpoint
        )

        if self.use_real_llm:
            self.kernel = Kernel()
            self.kernel.add_service(
                AzureChatCompletion(
                    api_key=self.azure_key,
                    deployment_name=self.azure_model,
                    endpoint=self.azure_endpoint,
                )
            )
        else:
            self.kernel = None

    # ------------------------------------------------------------------
    # ENTRY POINT
    # ------------------------------------------------------------------
    def explain(self, query: str, user_profile: Dict[str, Any]) -> str:
        """
        Devuelve una explicación educativa sobre un concepto consultado.
        """

        if not self.use_real_llm:
            return self._fallback_response(query)

        prompt = self._build_prompt(query, user_profile)

        # Enviamos la solicitud
        try:
            response = self.kernel.chat_completion.complete(
                prompt=prompt,
                max_tokens=350,
                temperature=0.45,
            )
            return str(response)
        except Exception as e:
            return f"[EducatorAgent] Error llamando al LLM: {e}"

    # ------------------------------------------------------------------
    # PROMPT BUILDER
    # ------------------------------------------------------------------
    def _build_prompt(self, query: str, profile: Dict[str, Any]) -> str:
        idioma = profile.get("idioma", "es")
        nivel_detalle = profile.get("nivel_explicacion", "medio")

        return f"""
Eres un educador cívico que responde con lenguaje claro, neutral y verificable.

Usuario:
- Idioma preferido: {idioma}
- Nivel de detalle: {nivel_detalle}

Tarea:
Explica el siguiente concepto relacionado con civismo o sociedad:

Pregunta:
{query}

Requisitos:
- Usa ejemplos cuando ayuden.
- No hagas suposiciones sin datos.
- Mantén la respuesta en el idioma del usuario ({idioma}).
"""

    # ------------------------------------------------------------------
    # FALLBACK
    # ------------------------------------------------------------------
    def _fallback_response(self, query: str) -> str:
        return (
            f"Recibí tu pregunta: '{query}'. "
            "Sin embargo, el modelo de lenguaje no está disponible todavía. "
            "Cuando configuremos Azure OpenAI, aquí recibirás una explicación completa."
        )
