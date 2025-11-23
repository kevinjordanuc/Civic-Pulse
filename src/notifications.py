"""Lógica mínima para generar notificaciones personalizadas."""
from __future__ import annotations

from typing import List, Dict, Any


def filter_notifications(
    registros: List[Dict[str, Any]],
    municipio: str,
    intereses: List[str],
    frecuencia_deseada: str,
) -> List[Dict[str, Any]]:
    """Filtra plantillas por municipio/intereses y frecuencia preferida."""
    municipio = municipio.lower()
    intereses = [i.lower() for i in intereses]
    resultados = []
    for registro in registros:
        coincide_localidad = municipio in {m.lower() for m in registro.get("municipios", [])}
        coincide_interes = bool(set(intereses) & {t.lower() for t in registro.get("temas", [])})
        coincide_frecuencia = (
            frecuencia_deseada == "todas" or registro.get("frecuencia") == frecuencia_deseada
        )
        if coincide_localidad and coincide_interes and coincide_frecuencia:
            resultados.append(registro)
    return resultados
