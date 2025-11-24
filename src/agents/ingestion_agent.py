import json
import re
from pathlib import Path
from typing import Dict, Any, List

# Configuración de rutas
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
INGESTED_PATH = DATA_DIR / "ingested_data.json"
INDEX_PATH = DATA_DIR / "index.json"

# Tokens mínimos a ignorar (Stopwords)
_STOPWORDS = {
    "de", "la", "el", "y", "a", "en", "los", "las", 
    "del", "que", "con", "para", "por", "se", "un", "una"
}

def _load_json_file(filename: str) -> List[Dict[str, Any]]:
    """Carga un archivo JSON de la carpeta de datos."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as fh:
        return json.load(fh)

def load_events() -> List[Dict[str, Any]]:
    return _load_json_file("events.json")

def load_services() -> List[Dict[str, Any]]:
    return _load_json_file("services.json")

def load_ballot_questions() -> List[Dict[str, Any]]:
    return _load_json_file("ballot_questions.json")

def load_notifications() -> List[Dict[str, Any]]:
    return _load_json_file("notifications.json")

def _tokenize(text: str) -> List[str]:
    """
    Tokenizador simple: elimina puntuación, separa por espacios, 
    convierte a minúsculas y filtra stopwords.
    """
    if not text:
        return []
    # Eliminar puntuación manteniendo caracteres unicode
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    # Limpiar espacios y minúsculas
    tokens = [t.strip().lower() for t in text.split() if t.strip()]
    # Filtrar stopwords y tokens muy cortos
    tokens = [t for t in tokens if t not in _STOPWORDS and len(t) > 1]
    return tokens

def _normalize_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ajustes básicos a cada registro (garantizar claves previsibles).
    Convierte todo a string para facilitar la búsqueda.
    """
    out = {}
    for k, v in item.items():
        if v is None:
            out[k] = ""
        elif isinstance(v, (list, dict)):
            out[k] = json.dumps(v, ensure_ascii=False)
        else:
            out[k] = str(v)
    return out

def run_ingestion() -> Dict[str, Any]:
    """
    Ejecuta ingesta local:
    - carga catálogos directamente
    - normaliza registros
    - guarda ingested_data.json
    - construye índice invertido simple y lo guarda en index.json
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # 1) Cargar datos
    events = load_events()
    services = load_services()
    ballots = load_ballot_questions()
    notifications = load_notifications()

    payload = {
        "events": [_normalize_item(i) for i in events],
        "services": [_normalize_item(i) for i in services],
        "ballots": [_normalize_item(i) for i in ballots],
        "notifications": [_normalize_item(i) for i in notifications],
    }

    # 2) Persistir ingested_data.json
    INGESTED_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), 
        encoding="utf-8"
    )

    # 3) Construir índice invertido: token -> list of (collection, pos)
    index: Dict[str, List[Dict[str, Any]]] = {}
    
    for collection, items in payload.items():
        for pos, item in enumerate(items):
            # Combinar campos importantes para tokenización
            text_blob = " ".join(str(v) for v in item.values())
            tokens = _tokenize(text_blob)
            
            doc_ref = {"collection": collection, "pos": pos}
            
            # Deduplicar tokens por documento para no repetir referencias
            seen = set()
            for t in tokens:
                if t in seen:
                    continue
                seen.add(t)
                index.setdefault(t, []).append(doc_ref)

    # 4) Persistir index.json (Nota: para producción usar base de datos vectorial)
    INDEX_PATH.write_text(
        json.dumps(index, ensure_ascii=False, indent=2), 
        encoding="utf-8"
    )

    return {
        "status": "ok", 
        "ingested_path": str(INGESTED_PATH), 
        "index_path": str(INDEX_PATH)
    }