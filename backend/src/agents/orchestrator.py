from typing import Dict, Any

# Asegúrate de que estos archivos existan en tu carpeta src/agents/
# Si no los tienes, comenta estas líneas para probar solo la estructura.
from src.agents.rag_agent import RAGAgent
from src.agents.educator_agent import EducatorAgent
from src.agents.moderation_agent import ModerationAgent
from src.agents.notifications_agent import NotificationAgent

class Orchestrator:
    """
    El Orquestador es el coordinador principal:
    - Recibe la consulta
    - Modera contenido
    - Detecta intención
    - Despacha al agente adecuado
    - Devuelve la respuesta final al UI
    """

    def __init__(self):
        # Aquí instanciamos los agentes del ecosistema
        self.moderator = ModerationAgent()
        self.rag = RAGAgent()
        self.educator = EducatorAgent()
        self.notifications = NotificationAgent()

    # --------------------------------------------------------------------------------
    #  MAIN ENTRY POINT
    # --------------------------------------------------------------------------------
    def process_request(self, user_query: str, user_profile: Dict[str, Any]) -> str:
        """
        Punto central llamado desde Streamlit.
        """

        # 1. Moderación -----------------------------------------------------------
        mod_result = self.moderator.evaluate(user_query)
        if not mod_result["allowed"]:
            return mod_result["message"]

        # 2. Detectar intención --------------------------------------------------
        intent = self._detect_intent(user_query)

        # 3. Enrutamiento según intención
        if intent == "consulta_informativa":
            return self.rag.answer(user_query, user_profile)

        elif intent == "explicar_concepto":
            return self.educator.explain(user_query, user_profile)

        elif intent == "consultar_notificaciones":
            return self.notifications.get_relevant_notifications(user_profile)

        # 4. Fallback ------------------------------------------------------------
        return self._default_fallback(user_query)

    # --------------------------------------------------------------------------------
    # INTENT DETECTION (SIMPLE VERSION)
    # --------------------------------------------------------------------------------
    def _detect_intent(self, query: str) -> str:
        """
        Detección de intención simplificada.
        Más adelante se puede sustituir por Semantic Kernel / Azure OpenAI.
        """

        q = query.lower()

        # Peticiones que requieren explicaciones cívicas o políticas
        if any(word in q for word in ["qué es", "explica", "dime qué significa"]):
            return "explicar_concepto"

        # Consultas informativas generales
        if any(word in q for word in ["evento", "servicios", "trámite", "boleta", "votación"]):
            return "consulta_informativa"

        # Revisar alertas
        if any(word in q for word in ["alertas", "notificación", "qué ha pasado", "novedades"]):
            return "consultar_notificaciones"

        # Unknown -> fallback
        return "unknown"

    # --------------------------------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------------------------------
    def _default_fallback(self, query: str) -> str:
        return (
            "Entiendo tu pregunta, pero aún no tengo datos suficientes "
            "para responder con certeza. Puedes intentar reformular tu consulta."
        )
