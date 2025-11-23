import json
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
INGESTED_PATH = DATA_DIR / "ingested_data.json"
INDEX_PATH = DATA_DIR / "index.json"

def _load_json(path: Path) -> Optional[Dict]:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))

def _rank_candidates(query_tokens: List[str], index: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
    """
    Scoring por frecuencia de tokens en índice: doc_ref -> score
    """
    scores: Dict[str, int] = {}
    for t in query_tokens:
        refs = index.get(t, [])
        for r in refs:
            key = f"{r['collection']}@@{r['pos']}"
            scores[key] = scores.get(key, 0) + 1
    return scores

def _extract_doc_from_key(key: str, ingested: Dict[str, Any]) -> Dict[str, Any]:
    coll, pos = key.split("@@")
    pos_int = int(pos)
    return {"collection": coll, "pos": pos_int, "item": ingested.get(coll, [])[pos_int]}

def _tokenize(q: str) -> List[str]:
    import re
    q = re.sub(r"[^\w\s]", " ", q, flags=re.UNICODE)
    tokens = [t.strip().lower() for t in q.split() if t.strip()]
    # basic stopwords (mirrored from ingestion)
    stop = {"de","la","el","y","a","en","los","las","del","que","con","para","por","se","un","una"}
    tokens = [t for t in tokens if t not in stop and len(t) > 1]
    return tokens

class RAGAgent:
    """
    Agente RAG local: usa ingested_data.json + index.json para recuperar pasajes.
    En producción reemplazar por Azure Cognitive Search / embeddings.
    """

    def __init__(self):
        self.ingested = _load_json(INGESTED_PATH) or {}
        self.index = _load_json(INDEX_PATH) or {}

    def refresh(self):
        """Recargar archivos si se actualizó la ingesta."""
        self.ingested = _load_json(INGESTED_PATH) or {}
        self.index = _load_json(INDEX_PATH) or {}

    def answer(self, query: str, user_profile: Dict[str, Any], top_k: int = 4) -> str:
        """
        Busca pasajes relevantes y construye una respuesta simple con evidencia.
        """
        tokens = _tokenize(query)
        if not tokens:
            return "No pude procesar tu consulta. Intenta usar palabras clave relevantes."

        scores = _rank_candidates(tokens, self.index)
        if not scores:
            return "No encontré documentos relevantes en la base local."

        # ordenar por score descendente y tomar top_k
        ranked_keys = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)[:top_k]
        docs = [_extract_doc_from_key(k, self.ingested) for k in ranked_keys]

        # construir respuesta: resumen automatizado (simple)
        lines = ["He encontrado la siguiente información relevante:"]
        for d in docs:
            coll = d["collection"]
            item = d["item"] or {}
            title = item.get("titulo") or item.get("name") or item.get("titulo_evento") or f"{coll} registro"
            snippet = " ".join(str(v) for v in list(item.values())[:4])
            lines.append(f"- {title} (fuente: {coll}) — {snippet[:300]}")

        # adicional: incluir evidencia como objeto JSON opcional en la respuesta o return dict
        return "\n".join(lines)