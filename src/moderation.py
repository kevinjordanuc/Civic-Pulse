"""Moderación ligera in-app y puntos de integración con Azure AI Content Safety."""
from __future__ import annotations

from typing import Dict

BANNED_TOKENS = {"odio", "violencia", "ataque"}


def is_safe_text(texto: str) -> Dict[str, str]:
    """Evalúa reglas simples y devuelve resultado estándar para mostrar en UI."""
    tokens = set(texto.lower().split())
    accion = "allow"
    detalle = "Sin banderas locales"
    if tokens & BANNED_TOKENS:
        accion = "block"
        detalle = "Se detectaron palabras vetadas."
    return {"action": accion, "detail": detalle}


def azure_content_safety_placeholder(payload: str) -> Dict[str, str]:
    """Describe cómo se invocaría Azure Content Safety para inspecciones avanzadas."""
    return {
        "action": "review",
        "detail": (
            "Configura Azure AI Content Safety y reemplaza este stub para obtener "
            "clasificaciones de odio, autolesión, violencia y sexualidad."
        ),
        "payload_preview": payload[:120],
    }
