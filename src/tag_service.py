"""Gestión de etiquetas oficiales y creadas por la ciudadanía."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parents[1]
TAG_PATH = BASE_DIR / "data" / "tags.json"


def _load_tags() -> List[Dict[str, Any]]:
    if not TAG_PATH.exists():
        TAG_PATH.write_text("[]", encoding="utf-8")
    return json.loads(TAG_PATH.read_text(encoding="utf-8"))


def _save_tags(records: List[Dict[str, Any]]) -> None:
    TAG_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


def list_tags(include_pending: bool = True) -> List[Dict[str, Any]]:
    registros = _load_tags()
    if include_pending:
        return registros
    return [r for r in registros if r.get("estado") != "pendiente"]


def get_popular_tags(limit: int = 5) -> List[Dict[str, Any]]:
    registros = sorted(_load_tags(), key=lambda r: r.get("popularidad", 0), reverse=True)
    return registros[:limit]


def add_user_tag(value: str, label: str, autor: str) -> Dict[str, Any]:
    registros = _load_tags()
    existe = next((tag for tag in registros if tag["value"] == value), None)
    if existe:
        existe.setdefault("seguidores", set())
        existe.setdefault("popularidad", 0)
        existe["popularidad"] += 1
        _save_tags(registros)
        return existe
    nuevo = {
        "value": value,
        "label": label,
        "tipo": "ciudadana",
        "estado": "pendiente",
        "popularidad": 1,
        "creado_por": autor,
    }
    registros.append(nuevo)
    _save_tags(registros)
    return nuevo


def ensure_user_interest(tag_value: str, user_id: str) -> Dict[str, Any]:
    registros = _load_tags()
    for tag in registros:
        if tag["value"] == tag_value:
            seguidores = set(tag.get("seguidores", []))
            seguidores.add(user_id)
            tag["seguidores"] = list(seguidores)
            tag["popularidad"] = tag.get("popularidad", 0) + 1
            _save_tags(registros)
            return tag
    return add_user_tag(tag_value, tag_value.replace("-", " ").title(), autor=user_id)


# Para Azure Cosmos DB: guarda tags en contenedores con partición por tipo/estado para escalar.
