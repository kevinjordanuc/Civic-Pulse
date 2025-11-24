# src/agents/moderation_agent.py
import os
from typing import Dict, Any, Optional

try:
    from azure.ai.contentsafety import ContentSafetyClient
    from azure.core.credentials import AzureKeyCredential
    from azure.ai.contentsafety.models import AnalyzeTextOptions
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False


class ModerationAgent:
    """
    Moderación híbrida:
    - Si existen credenciales de Azure, usa Content Safety.
    - Si no, aplica reglas locales mínimas.
    """

    def __init__(self):
        self.cs_endpoint = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")
        self.cs_key = os.getenv("AZURE_CONTENT_SAFETY_KEY")

        # Bandera para saber si está habilitada la integración real
        self.azure_enabled = (
            AZURE_AVAILABLE
            and self.cs_endpoint
            and self.cs_key
        )

        if self.azure_enabled:
            self.client = ContentSafetyClient(
                endpoint=self.cs_endpoint,
                credential=AzureKeyCredential(self.cs_key)
            )

        # Lista mínima de palabras prohibidas para modo sin Azure
        self.local_banned_words = [
            "matar",
            "amenaza",
            "violencia extrema",
            "golpear",
            "bomba",
            "ataque"
        ]

    # ----------------------------------------------------------
    # MÉTODO PRINCIPAL
    # ----------------------------------------------------------
    def evaluate(self, text: str) -> Dict[str, Any]:
        """
        Evalúa el texto y devuelve:
        {
            "allowed": True/False,
            "message": "Explicación si se bloquea"
        }
        """

        # 1) Si Azure está activo → usar Content Safety
        if self.azure_enabled:
            return self._azure_check(text)

        # 2) Si no → usar validación local mínima
        return self._local_check(text)

    # ----------------------------------------------------------
    # VALIDACIÓN LOCAL BASE
    # ----------------------------------------------------------
    def _local_check(self, text: str) -> Dict[str, Any]:
        t = text.lower()

        for bad in self.local_banned_words:
            if bad in t:
                return {
                    "allowed": False,
                    "message": (
                        "⚠️ Tu mensaje contiene lenguaje que infringe "
                        "las reglas básicas de seguridad. Reformúlalo, por favor."
                    )
                }

        return {"allowed": True}

    # ----------------------------------------------------------
    # VALIDACIÓN CON AZURE CONTENT SAFETY
    # ----------------------------------------------------------
    def _azure_check(self, text: str) -> Dict[str, Any]:
        try:
            result = self.client.analyze_text(
                AnalyzeTextOptions(text=text)
            )
        except Exception as e:
            # Fallback de emergencia
            print(f"[ModerationAgent] Error al consultar Azure: {e}")
            return {"allowed": True}

        # Azure devuelve riesgos por categorías
        blocks = []
        if result.hate_result and result.hate_result.severity > 1:
            blocks.append("Discurso de odio")

        if result.violence_result and result.violence_result.severity > 1:
            blocks.append("Violencia")

        if result.self_harm_result and result.self_harm_result.severity > 1:
            blocks.append("Autolesiones")

        if result.sexual_result and result.sexual_result.severity > 2:
            blocks.append("Contenido sexual")

        # Si no hay problemas
        if not blocks:
            return {"allowed": True}

        # Mensaje bloqueado
        categories = ", ".join(blocks)
        return {
            "allowed": False,
            "message": (
                f"⚠️ Tu mensaje fue bloqueado porque Azure Content Safety "
                f"detectó contenido sensible: {categories}. "
                "Reescribe tu pregunta de una manera neutral."
            )
        }
