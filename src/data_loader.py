"""Utilidades para leer catálogos locales que alimentan el MVP.
Todas las funciones devuelven listas de diccionarios para facilitar el filtrado en Streamlit.
"""
from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any
import json

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"


def _load_json_file(filename: str) -> List[Dict[str, Any]]:
    """Carga un archivo JSON de la carpeta de datos."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def load_events() -> List[Dict[str, Any]]:
    """Devuelve los eventos comunitarios georreferenciados."""
    return _load_json_file("events.json")


def load_services() -> List[Dict[str, Any]]:
    """Devuelve los servicios públicos cercanos."""
    return _load_json_file("services.json")


def load_ballot_questions() -> List[Dict[str, Any]]:
    """Devuelve preguntas relevantes de boletas locales."""
    return _load_json_file("ballot_questions.json")


def load_notifications() -> List[Dict[str, Any]]:
    """Devuelve plantillas de notificaciones personalizadas."""
    return _load_json_file("notifications.json")
