"""Capas de accesibilidad básicas para CivicAI Hub."""
from __future__ import annotations

from typing import Literal, Optional
from gtts import gTTS  # type: ignore
import base64
import io

SUPPORTED_LANGS = {"es": "Español", "en": "English"}


def translate_text(texto: str, idioma_destino: str) -> str:
    """Traduce de manera simplificada hasta que se conecte Azure Translator."""
    if idioma_destino not in SUPPORTED_LANGS:
        return texto
    # MVP: sin motor externo para evitar dependencias no deseadas.
    # Para producción debe usarse Azure AI Translator y detección automática.
    if idioma_destino == "en":
        return (
            "(Traducción automática) "
            + texto.replace("¿", "?").replace("á", "a").replace("é", "e")
        )
    return texto


def synthesize_audio(texto: str, idioma: Literal["es", "en"] = "es") -> Optional[str]:
    """Genera audio MP3 en base64; retorna None si falla para no bloquear la UI."""
    try:
        voz = gTTS(text=texto, lang=idioma)
        buffer = io.BytesIO()
        voz.write_to_fp(buffer)
        buffer.seek(0)
        audio_b64 = base64.b64encode(buffer.read()).decode("utf-8")
        return f"data:audio/mp3;base64,{audio_b64}"
    except Exception:
        return None
