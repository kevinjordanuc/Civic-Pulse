"""Moderación híbrida: reglas locales + Azure AI Content Safety."""
from __future__ import annotations

import os
from typing import Dict

from dotenv import load_dotenv

try:
    from azure.ai.contentsafety import ContentSafetyClient
    from azure.ai.contentsafety.models import AnalyzeTextOptions, TextCategory
    from azure.core.credentials import AzureKeyCredential
except ImportError:
    ContentSafetyClient = None

load_dotenv()

BANNED_TOKENS = {"odio", "violencia", "ataque"}

def _get_client():
    endpoint = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")
    key = os.getenv("AZURE_CONTENT_SAFETY_KEY")
    if endpoint and key and ContentSafetyClient:
        return ContentSafetyClient(endpoint, AzureKeyCredential(key))
    return None

def is_safe_text(texto: str) -> Dict[str, str]:
    """Evalúa texto usando Azure Content Safety (si está disponible) o reglas locales."""
    
    # 1. Reglas locales (siempre activas como primera línea de defensa)
    tokens = set(texto.lower().split())
    if tokens & BANNED_TOKENS:
        return {
            "action": "block",
            "detail": "Se detectaron palabras vetadas (filtro local)."
        }

    # 2. Azure AI Content Safety
    client = _get_client()
    if client:
        try:
            request = AnalyzeTextOptions(text=texto)
            result = client.analyze_text(request)
            
            # Verificamos si alguna categoría viola el umbral (ej. severidad > 0)
            # Categorías: Hate, SelfHarm, Sexual, Violence
            for category in result.categories_analysis:
                if category.severity > 0: # Umbral estricto para demo
                    return {
                        "action": "block",
                        "detail": f"Azure Content Safety detectó: {category.category} (Nivel {category.severity})"
                    }
            
            return {"action": "allow", "detail": "Validado por Azure AI Content Safety."}
            
        except Exception as e:
            print(f"Error llamando a Azure Content Safety: {e}")
            # Fallback a permitir si falla el servicio (fail-open) o bloquear (fail-closed)
            # Para demo, hacemos fail-open con advertencia
            return {"action": "allow", "detail": "Validación local (Azure no disponible)."}

    return {"action": "allow", "detail": "Validación local (sin conexión a Azure)."}

def azure_content_safety_placeholder(payload: str) -> Dict[str, str]:
    """(Deprecado) Mantenido por compatibilidad, redirige a la función principal."""
    return is_safe_text(payload)
