"""Orquestador de respuestas para el Chat Cívico."""
from __future__ import annotations

import asyncio
from datetime import datetime
from typing import List, Dict, Any

from .azure_integration import AzureSemanticKernelClient


class CivicChatEngine:
    """Genera respuestas neutrales a partir de datos oficiales y Azure AI."""

    def __init__(self, catalogos: Dict[str, List[Dict[str, Any]]]) -> None:
        self.catalogos = catalogos
        self.azure_client = AzureSemanticKernelClient()

    def _event_context(self, municipio: str) -> List[Dict[str, Any]]:
        eventos = self.catalogos.get("events", [])
        ahora = datetime.utcnow().isoformat()
        return [
            ev for ev in eventos if ev["municipio"].lower() == municipio.lower() and ev["inicio"] >= ahora
        ]

    def _ballot_context(self, temas: List[str]) -> List[Dict[str, Any]]:
        preguntas = self.catalogos.get("ballots", [])
        temas_lower = {t.lower() for t in temas}
        return [
            pregunta
            for pregunta in preguntas
            if temas_lower & {t.lower() for t in pregunta.get("temas", [])}
        ]

    def _local_response(self, pregunta: str, perfil: Dict[str, Any]) -> str:
        eventos = self._event_context(perfil.get("municipio", ""))[:2]
        boletas = self._ballot_context(perfil.get("intereses", []))[:2]
        partes = [
            "Aquí tienes información verificada de tu municipio:",
        ]
        if eventos:
            partes.append("Eventos relevantes:")
            for ev in eventos:
                partes.append(f"• {ev['titulo']} ({ev['inicio'][0:10]}) - {ev['descripcion']}")
        if boletas:
            partes.append("Preguntas de boleta relacionadas:")
            for b in boletas:
                partes.append(f"• {b['titulo']}: {b['resumen']}")
        if not eventos and not boletas:
            partes.append("Por ahora no encontramos eventos o boletas que respondan directamente a tu duda.")
        partes.append(
            "Este es un resumen local. Conecta Azure AI para obtener contexto ampliado y "
            "respuestas en lenguaje natural.")
        return "\n".join(partes)

    def build_context(self, perfil: Dict[str, Any]) -> List[Dict[str, Any]]:
        contexto = []
        contexto.extend(self._event_context(perfil.get("municipio", "")))
        contexto.extend(self._ballot_context(perfil.get("intereses", [])))
        return contexto

    def _execute_async(self, coro):
        try:
            return asyncio.run(coro)
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(coro)

    def ask(self, pregunta: str, perfil: Dict[str, Any]) -> str:
        """Expone una interfaz sincrónica para Streamlit."""
        contexto = self.build_context(perfil)
        if self.azure_client.kernel:
            return self._execute_async(
                self.azure_client.run_chat(
                    pregunta=pregunta,
                    perfil=perfil,
                    contexto=contexto,
                )
            )
        return self._local_response(pregunta, perfil)
