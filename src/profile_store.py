"""Persistencia ligera para perfiles ciudadanos.
Para producción sustituir JSON por Azure Cosmos DB o Azure SQL con autenticación administrada.
"""
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "profiles.json"


def _ensure_file() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        DATA_PATH.write_text("[]", encoding="utf-8")


def _load_profiles() -> List[Dict[str, Any]]:
    _ensure_file()
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def _save_profiles(records: List[Dict[str, Any]]) -> None:
    DATA_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


@dataclass
class Profile:
    user_id: str
    email: str
    password: str  # MVP: en texto plano; reemplazar por Azure AD B2C u otro IdP
    consent_notifications: bool
    estado: str = ""
    municipio: str = ""
    idioma: str = "es"
    intereses: List[str] = None  # type: ignore[assignment]
    accesibilidad: Dict[str, Any] = None  # type: ignore[assignment]
    frecuencia_notificaciones: str = "diaria"
    etiquetas_propias: List[str] = None  # type: ignore[assignment]

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload.setdefault("intereses", [])
        payload.setdefault("accesibilidad", {})
        payload.setdefault("etiquetas_propias", [])
        return payload


def create_profile(email: str, password: str, consent_notifications: bool) -> Profile:
    registros = _load_profiles()
    if any(r["email"].lower() == email.lower() for r in registros):
        raise ValueError("El correo ya está registrado")
    profile = Profile(
        user_id=str(uuid.uuid4()),
        email=email,
        password=password,
        consent_notifications=consent_notifications,
        intereses=["movilidad"],
        accesibilidad={"tamano_fuente": 16, "lectura_en_voz_alta": False, "traduccion_automatica": False},
    )
    registros.append(profile.to_dict())
    _save_profiles(registros)
    return profile


def get_profile_by_email(email: str) -> Optional[Profile]:
    for registro in _load_profiles():
        if registro["email"].lower() == email.lower():
            return Profile(**registro)
    return None


def update_profile(user_id: str, data: Dict[str, Any]) -> Profile:
    registros = _load_profiles()
    for idx, registro in enumerate(registros):
        if registro["user_id"] == user_id:
            registro.update(data)
            registros[idx] = registro
            _save_profiles(registros)
            return Profile(**registro)
    raise ValueError("Perfil no encontrado")


def list_profiles() -> List[Profile]:
    return [Profile(**registro) for registro in _load_profiles()]


# Próximos pasos Azure:
# - Reemplazar este módulo por un repositorio en Azure Cosmos DB o Azure SQL.
# - Utilizar Azure AD B2C u otro IdP para gestionar contraseñas de forma segura.
# - Emplear Identidad Administrada/DefaultAzureCredential para acceder a la base.
