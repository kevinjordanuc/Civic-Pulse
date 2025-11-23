"""Almacén simple para foros creados por usuarios.
Reemplazar por Azure Cosmos DB + Azure AI Content Safety en entornos productivos.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

BASE_DIR = Path(__file__).resolve().parents[1]
FORUM_PATH = BASE_DIR / "data" / "user_forums.json"


def _ensure_file() -> None:
    if not FORUM_PATH.exists():
        FORUM_PATH.write_text("[]", encoding="utf-8")


def load_forums() -> List[Dict[str, Any]]:
    _ensure_file()
    return json.loads(FORUM_PATH.read_text(encoding="utf-8"))


def save_forums(registros: List[Dict[str, Any]]) -> None:
    FORUM_PATH.write_text(json.dumps(registros, ensure_ascii=False, indent=2), encoding="utf-8")


def create_forum(titulo: str, descripcion: str, categoria: str, autor: str) -> Dict[str, Any]:
    registros = load_forums()
    foro = {
        "id": f"user-{uuid.uuid4().hex[:8]}",
        "titulo": titulo,
        "descripcion": descripcion,
        "categoria": categoria,
        "autor": autor,
        "creado_en": datetime.utcnow().isoformat(),
        "comentarios": [],
        "estado": "pendiente",  # después de pasar Azure Content Safety cambia a aprobado
    }
    registros.append(foro)
    save_forums(registros)
    return foro


def add_comment(forum_id: str, autor: str, texto: str) -> Dict[str, Any]:
    registros = load_forums()
    for foro in registros:
        if foro["id"] == forum_id:
            foro.setdefault("comentarios", []).append({
                "autor": autor,
                "texto": texto,
                "fecha": datetime.utcnow().isoformat(),
            })
            save_forums(registros)
            return foro
    raise ValueError("Foro no encontrado")


def list_active_forums() -> List[Dict[str, Any]]:
    return [foro for foro in load_forums() if foro.get("estado") != "bloqueado"]


# Azure Content Safety: invoca la API antes de crear/aprobar foros para sancionar contenidos.
