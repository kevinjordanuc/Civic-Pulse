# src/agents/notification_agent.py
import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from math import radians, sin, cos, asin, sqrt
from datetime import datetime

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
USERS_PATH = DATA_DIR / "users.json"
EVENTS_PATH = DATA_DIR / "events_current.json"
STATE_PATH = DATA_DIR / "notifications_state.json"

# Optional: Azure Communication Services (ACS) placeholders
ACS_CONNECTION_STRING = os.getenv("AZURE_COMMUNICATION_CONNECTION_STRING")
ACS_ENABLED = bool(ACS_CONNECTION_STRING)

def _load_json(p: Path) -> Any:
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))

def _save_json(p: Path, data: Any) -> None:
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def haversine_km(lat1, lon1, lat2, lon2) -> float:
    # radius earth km
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

class NotificationAgent:
    def __init__(self):
        self.users = _load_json(USERS_PATH) or []
        self.events = _load_json(EVENTS_PATH) or []
        self.state = _load_json(STATE_PATH) or {"notified": []}

    def refresh(self):
        self.users = _load_json(USERS_PATH) or []
        self.events = _load_json(EVENTS_PATH) or []
        self.state = _load_json(STATE_PATH) or {"notified": []}

    def _already_notified(self, event_id: str, user_id: str) -> bool:
        for rec in self.state.get("notified", []):
            if rec.get("event_id") == event_id and rec.get("user_id") == user_id:
                return True
        return False

    def _mark_notified(self, event_id: str, user_id: str) -> None:
        self.state.setdefault("notified", []).append({
            "event_id": event_id,
            "user_id": user_id,
            "notified_at": datetime.utcnow().isoformat() + "Z"
        })
        _save_json(STATE_PATH, self.state)

    def filter_relevant_users(self, event: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Devuelve lista de usuarios a notificar según ubicación e intereses."""
        out = []
        for user in self.users:
            # match interest
            interests = set(user.get("intereses", []))
            if event.get("type") and event["type"] not in interests:
                # permite si intereses vacíos o match explícito
                if interests:
                    continue
            # distance check
            lat_u = float(user.get("lat") or 0)
            lon_u = float(user.get("lon") or 0)
            dist = haversine_km(lat_u, lon_u, float(event.get("lat")), float(event.get("lon")))
            radius = float(user.get("radius_km", 20))
            if dist <= radius:
                out.append({**user, "_distance_km": round(dist, 2)})
        return out

    def build_message(self, event: Dict[str, Any], user: Dict[str, Any]) -> str:
        # ejemplo de contenido claro y conciso
        dist = user.get("_distance_km", None)
        title = event.get("title") or event.get("event_id")
        severity = event.get("severity", "desconocido").capitalize()
        return (
            f"Nuevo {event.get('type', 'evento')} detectado cerca de ti ({dist} km).\n\n"
            f"{title}\n"
            f"Riesgo estimado: {severity}.\n"
            f"Hora: {event.get('timestamp')}\n\n"
            "Recomendación: consulta fuentes oficiales locales y mantente atento a indicaciones."
        )

    def send_console(self, message: str, user: Dict[str, Any]) -> bool:
        # En entorno de desarrollo imprimimos a consola
        print("="*40)
        print(f"[NOTIFICACIÓN] -> user: {user.get('user_id')} ({user.get('correo')})")
        print(message)
        print("="*40)
        return True

    def send_acs(self, message: str, user: Dict[str, Any]) -> bool:
        """
        Integración opcional con Azure Communication Services (ACS).
        Requiere AZURE_COMMUNICATION_CONNECTION_STRING en .env y la librería apropiada.
        Dejo un stub: implementa según ACS SDK cuando quieras.
        """
        # TODO: implementar uso de ACS SDK: EmailClient/SMSClient
        print(f"[ACS STUB] enviando a {user.get('correo')}: {message}")
        return True

    def send_notification(self, message: str, user: Dict[str, Any]) -> bool:
        channel = user.get("preferred_channel", "console")
        if channel == "console":
            return self.send_console(message, user)
        if channel == "acs" and ACS_ENABLED:
            return self.send_acs(message, user)
        # fallback
        return self.send_console(message, user)

    def run_detection_and_notify(self) -> Dict[str, Any]:
        """
        Detecta eventos nuevos y notifica a usuarios relevantes.
        - recarga datos
        - por cada evento, encuentra usuarios, filtra ya notificados y envía
        - marca en state para no duplicar
        """
        self.refresh()
        results = {"notified": []}
        for event in self.events:
            event_id = event.get("event_id")
            relevant_users = self.filter_relevant_users(event)
            for user in relevant_users:
                if self._already_notified(event_id, user.get("user_id")):
                    continue
                message = self.build_message(event, user)
                ok = self.send_notification(message, user)
                if ok:
                    self._mark_notified(event_id, user.get("user_id"))
                    results["notified"].append({"event_id": event_id, "user_id": user.get("user_id")})
        return results
