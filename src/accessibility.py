"""Capas de accesibilidad: Traducción y Texto a Voz con Azure AI."""
from __future__ import annotations

import os
import base64
import io
from typing import Literal, Optional

from dotenv import load_dotenv
from gtts import gTTS  # type: ignore

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    speechsdk = None

try:
    from azure.ai.translation.text import TextTranslationClient
    from azure.core.credentials import AzureKeyCredential
except ImportError:
    TextTranslationClient = None

load_dotenv()

SUPPORTED_LANGS = {"es": "Español", "en": "English", "fr": "Français", "nah": "Nahuatl"}

def translate_text(texto: str, idioma_destino: str) -> str:
    """Traduce texto usando Azure Translator (o fallback local)."""
    if idioma_destino not in SUPPORTED_LANGS or idioma_destino == "es":
        return texto

    # 1. Azure Translator
    key = os.getenv("AZURE_TRANSLATOR_KEY")
    region = os.getenv("AZURE_TRANSLATOR_REGION")
    endpoint = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")

    if key and region and TextTranslationClient:
        try:
            credential = AzureKeyCredential(key)
            client = TextTranslationClient(endpoint=endpoint, credential=credential, region=region)
            response = client.translate(body=[{"text": texto}], to_language=[idioma_destino])
            if response and response[0].translations:
                return response[0].translations[0].text
        except Exception as e:
            print(f"Error Azure Translator: {e}")

    # 2. Fallback local (MVP)
    if idioma_destino == "en":
        return "(Traducción simulada) " + texto.replace("¿", "?").replace("á", "a")
    
    return texto


def synthesize_audio(texto: str, idioma: str = "es") -> Optional[str]:
    """Genera audio usando Azure Speech (o gTTS como fallback)."""
    
    # 1. Azure Speech
    speech_key = os.getenv("AZURE_SPEECH_KEY")
    speech_region = os.getenv("AZURE_SPEECH_REGION")

    if speech_key and speech_region and speechsdk:
        try:
            speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
            speech_config.speech_synthesis_voice_name = "es-MX-JorgeNeural" if idioma == "es" else "en-US-GuyNeural"
            
            # Sintetizar a memoria (no a parlante)
            synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
            result = synthesizer.speak_text_async(texto).get()

            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                audio_data = result.audio_data
                audio_b64 = base64.b64encode(audio_data).decode("utf-8")
                return f"data:audio/mp3;base64,{audio_b64}"
        except Exception as e:
            print(f"Error Azure Speech: {e}")

    # 2. Fallback gTTS
    try:
        # gTTS requiere códigos ISO estándar (es, en, fr)
        lang_code = idioma if idioma in ["es", "en", "fr"] else "es"
        voz = gTTS(text=texto, lang=lang_code)
        buffer = io.BytesIO()
        voz.write_to_fp(buffer)
        buffer.seek(0)
        audio_b64 = base64.b64encode(buffer.read()).decode("utf-8")
        return f"data:audio/mp3;base64,{audio_b64}"
    except Exception:
        return None
