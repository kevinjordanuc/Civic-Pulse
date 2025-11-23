"""CivicAI Hub MVP en Streamlit con perfiles persistentes y foros ciudadanos."""
from __future__ import annotations

import copy
from pathlib import Path
from typing import Dict, Any, List

import pandas as pd
import pydeck as pdk
import streamlit as st

from src import data_loader, profile_store, tag_service, forum_store
from src.accessibility import SUPPORTED_LANGS, translate_text, synthesize_audio
from src.chat_engine import CivicChatEngine
from src.notifications import filter_notifications
from src.moderation import is_safe_text, azure_content_safety_placeholder

BASE_DIR = Path(__file__).resolve().parent

st.set_page_config(page_title="CivicAI Hub", layout="wide", page_icon="🗳️")

DEFAULT_PROFILE: Dict[str, Any] = {
    "correo": "",
    "municipio": "Ciudad de México",
    "estado": "CDMX",
    "idioma": "es",
    "intereses": ["movilidad"],
    "tamano_fuente": 16,
    "lectura_en_voz_alta": False,
    "traduccion_automatica": False,
    "frecuencia_notificaciones": "diaria",
    "consent_notifications": True,
    "etiquetas_propias": [],
}


def _init_state() -> None:
    st.session_state.setdefault("user", None)
    st.session_state.setdefault("perfil", copy.deepcopy(DEFAULT_PROFILE))
    st.session_state.setdefault("chat_history", [])
    st.session_state.setdefault(
        "comentarios_eventos",
        {
            "ev-001": [
                {"autor": "Laura", "texto": "Gracias por compartir las minutas del cabildo."}
            ]
        },
    )


_init_state()

CATALOGOS = {
    "events": data_loader.load_events(),
    "services": data_loader.load_services(),
    "ballots": data_loader.load_ballot_questions(),
    "notifications": data_loader.load_notifications(),
}

CHAT_ENGINE = CivicChatEngine(CATALOGOS)


def _set_active_profile(profile: profile_store.Profile) -> None:
    accesibilidad = profile.accesibilidad or {}
    st.session_state["user"] = {"user_id": profile.user_id, "email": profile.email}
    st.session_state["perfil"] = {
        "correo": profile.email,
        "municipio": profile.municipio or DEFAULT_PROFILE["municipio"],
        "estado": profile.estado or DEFAULT_PROFILE["estado"],
        "idioma": profile.idioma or "es",
        "intereses": profile.intereses or ["movilidad"],
        "tamano_fuente": accesibilidad.get("tamano_fuente", 16),
        "lectura_en_voz_alta": accesibilidad.get("lectura_en_voz_alta", False),
        "traduccion_automatica": accesibilidad.get("traduccion_automatica", False),
        "frecuencia_notificaciones": profile.frecuencia_notificaciones or "diaria",
        "consent_notifications": profile.consent_notifications,
        "etiquetas_propias": profile.etiquetas_propias or [],
    }
    _apply_font_size(st.session_state["perfil"]["tamano_fuente"])


def _apply_font_size(size: int) -> None:
    st.markdown(
        f"""
        <style>
        :root {{
            font-size: {size}px !important;
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def _auth_sidebar() -> None:
    st.sidebar.header("Acceso")
    user = st.session_state.get("user")
    if user:
        st.sidebar.success(f"Sesión iniciada como {user['email']}")
        if st.sidebar.button("Cerrar sesión", use_container_width=True):
            st.session_state["user"] = None
            st.session_state["perfil"] = copy.deepcopy(DEFAULT_PROFILE)
            st.experimental_rerun()
        st.sidebar.info("Ve a la pestaña 'Mi Perfil' para personalizar tu experiencia.")
        return

    modo = st.sidebar.radio("¿Cómo deseas continuar?", ["Iniciar sesión", "Crear cuenta"])
    with st.sidebar.form("auth-form"):
        email = st.text_input("Correo electrónico")
        password = st.text_input("Contraseña", type="password")
        consent = st.checkbox("Acepto recibir notificaciones cívicas", value=True) if modo == "Crear cuenta" else True
        submitted = st.form_submit_button("Continuar", use_container_width=True)
        if submitted:
            if not email or not password:
                st.sidebar.error("Completa los campos obligatorios.")
                return
            try:
                if modo == "Crear cuenta":
                    if not consent:
                        st.sidebar.error("Necesitamos tu consentimiento para enviarte recordatorios.")
                        return
                    profile = profile_store.create_profile(email=email, password=password, consent_notifications=bool(consent))
                    _set_active_profile(profile)
                    st.sidebar.success("Cuenta creada. Completa tu perfil en la pestaña dedicada.")
                    st.experimental_rerun()
                else:
                    profile = profile_store.get_profile_by_email(email)
                    if not profile or profile.password != password:
                        st.sidebar.error("Credenciales inválidas.")
                        return
                    _set_active_profile(profile)
                    st.sidebar.success("Sesión iniciada correctamente.")
                    st.experimental_rerun()
            except ValueError as ex:
                st.sidebar.error(str(ex))


def _sidebar_overview(perfil: Dict[str, Any]) -> None:
    st.sidebar.markdown("### Resumen rápido")
    st.sidebar.write(f"Municipio: {perfil['municipio']}")
    st.sidebar.write(f"Estado: {perfil['estado']}")
    st.sidebar.write(f"Idioma: {SUPPORTED_LANGS.get(perfil['idioma'], 'Español')}")
    st.sidebar.write("Intereses principales: " + ", ".join(perfil.get("intereses", [])))
    st.sidebar.caption("Los cambios se realizan en la pestaña ‘Mi Perfil’.")


def _render_map(perfil: Dict[str, Any]) -> None:
    st.subheader("Mapa cívico personalizado")
    df_eventos = pd.DataFrame(CATALOGOS["events"])
    df_servicios = pd.DataFrame(CATALOGOS["services"])
    eventos_layer = pdk.Layer(
        "ScatterplotLayer",
        data=df_eventos,
        get_position="[lon, lat]",
        get_color="[180, 0, 200, 160]",
        get_radius=500,
        pickable=True,
    )
    servicios_layer = pdk.Layer(
        "ScatterplotLayer",
        data=df_servicios,
        get_position="[lon, lat]",
        get_color="[0, 121, 191, 160]",
        get_radius=400,
        pickable=True,
    )
    df_local = df_eventos[df_eventos["municipio"] == perfil["municipio"]]
    lat = float(df_local["lat"].mean()) if not df_local.empty else float(df_eventos["lat"].mean())
    lon = float(df_local["lon"].mean()) if not df_local.empty else float(df_eventos["lon"].mean())
    view_state = pdk.ViewState(longitude=lon, latitude=lat, zoom=9, pitch=35)
    tooltip = {
        "html": "<b>{titulo}</b><br/>{descripcion}<br/><small>{direccion}</small>",
        "style": {"backgroundColor": "#0f1116", "color": "white"},
    }
    r = pdk.Deck(layers=[eventos_layer, servicios_layer], initial_view_state=view_state, tooltip=tooltip)
    st.pydeck_chart(r)

    st.caption("Da clic en un punto para abrir detalles y enlazar al módulo de foros moderados.")


def _chat_section(perfil: Dict[str, Any]) -> None:
    st.subheader("Chat Cívico")

    st.write("Haz preguntas sobre eventos, trámites o boletas. Las respuestas siempre serán neutrales.")
    pregunta = st.text_input(
        "¿Qué te gustaría saber?",
        placeholder="¿Qué eventos comunitarios hay esta semana?"
    )

    if st.button("Preguntar", use_container_width=True) and pregunta:
        # Aquí enviamos la solicitud al Agente Orquestador
        # Nota: ORQUESTADOR debe estar definido en el ámbito global o importado
        respuesta = ORQUESTADOR.process_request(
            user_query=pregunta,
            user_profile=perfil
        )

        # Si el usuario eligió otro idioma, se traduce con el agente de accesibilidad
        if perfil["traduccion_automatica"] and perfil["idioma"] != "es":
            respuesta = translate_text(respuesta, perfil["idioma"])

        st.session_state["chat_history"].append({"role": "user", "content": pregunta})
        st.session_state["chat_history"].append({"role": "assistant", "content": respuesta})

    # Renderizar últimos mensajes
    for mensaje in st.session_state["chat_history"][-6:]:
        bubble_color = "#e8f0fe" if mensaje["role"] == "assistant" else "#f6f6f6"
        st.markdown(
            f"<div style='background:{bubble_color};padding:0.7rem;border-radius:8px;margin-bottom:0.4rem'>{mensaje['content']}</div>",
            unsafe_allow_html=True,
        )

    # Lectura en voz alta
    if perfil["lectura_en_voz_alta"] and st.session_state["chat_history"]:
        ultimo = next(
            (m for m in reversed(st.session_state["chat_history"]) if m["role"] == "assistant"),
            None
        )
        if ultimo:
            audio = synthesize_audio(ultimo["content"], idioma=perfil["idioma"])
            if audio:
                st.audio(audio, format="audio/mp3")
            else:
                st.info("Activa Azure Speech para tener voces de mayor calidad y disponibilidad garantizada.")


def _notification_section(perfil: Dict[str, Any]) -> None:
    st.subheader("Notificaciones personalizadas")
    coincidencias = filter_notifications(
        CATALOGOS["notifications"],
        municipio=perfil["municipio"],
        intereses=perfil["intereses"],
        frecuencia_deseada=perfil["frecuencia_notificaciones"],
    )
    if not coincidencias:
        st.info("Aún no hay alertas que coincidan. Conecta Azure Event Grid o Communication Services para enviarlas automáticamente.")
        return
    for alerta in coincidencias:
        st.success(f"{alerta['titulo']} — {alerta['descripcion']}")


def _render_forum_creator(perfil: Dict[str, Any]) -> None:
    st.markdown("#### Crear un nuevo foro ciudadano")
    user = st.session_state.get("user")
    if not user:
        st.warning("Inicia sesión para proponer foros.")
        return
    categorias = [tag["value"] for tag in tag_service.list_tags(include_pending=True)]
    with st.form("nuevo-foro"):
        titulo = st.text_input("Título del foro")
        descripcion = st.text_area("¿Cuál es el objetivo del diálogo?")
        categoria = st.selectbox("Categoría", options=categorias)
        crear = st.form_submit_button("Proponer foro")
        if crear:
            if not titulo or not descripcion:
                st.error("Completa título y descripción.")
                return
            moderacion_local = is_safe_text(f"{titulo} {descripcion}")
            if moderacion_local["action"] == "block":
                st.error("Tu propuesta contiene palabras restringidas. Ajusta el texto.")
                return
            azure_resumen = azure_content_safety_placeholder(descripcion)
            st.info(f"Azure Content Safety: {azure_resumen['detail']}")
            forum_store.create_forum(titulo, descripcion, categoria, autor=user["user_id"])
            st.success("Foro enviado a moderación. Se publicará automáticamente al aprobarse.")
            st.experimental_rerun()


def _render_event_forums(perfil: Dict[str, Any]) -> None:
    evento = st.selectbox(
        "Selecciona un evento para participar",
        options=[ev["id"] for ev in CATALOGOS["events"]],
        format_func=lambda eid: next(ev["titulo"] for ev in CATALOGOS["events"] if ev["id"] == eid),
    )
    comentarios = st.session_state["comentarios_eventos"].setdefault(evento, [])
    st.markdown("#### Conversación oficial")
    for comentario in comentarios:
        st.write(f"**{comentario['autor']}**: {comentario['texto']}")
    nuevo = st.text_area("Participa con respeto y sin recomendaciones políticas", key=f"event-comment-{evento}")
    if st.button("Publicar comentario", key=f"event-btn-{evento}") and nuevo:
        moderacion = is_safe_text(nuevo)
        if moderacion["action"] == "block":
            st.error("Tu mensaje contiene palabras restringidas. Ajusta el texto e inténtalo nuevamente.")
        else:
            comentarios.append({"autor": perfil.get("correo") or "Invitado", "texto": nuevo})
            st.success("Comentario publicado. Azure Content Safety puede reforzar esta validación en la nube.")


def _render_user_forums(perfil: Dict[str, Any]) -> None:
    st.markdown("#### Foros ciudadanos activos")
    foros = forum_store.list_active_forums()
    if not foros:
        st.info("Aún no hay foros ciudadanos. ¡Crea el primero!")
        return
    user = st.session_state.get("user")
    for foro in foros:
        estado = foro.get("estado", "pendiente")
        st.markdown(f"**{foro['titulo']}** · {foro['categoria']} · Estado: {estado}")
        st.caption(f"Creado por {foro['autor']} el {foro['creado_en'][:10]}")
        for comentario in foro.get("comentarios", []):
            st.write(f"- {comentario['autor']}: {comentario['texto']}")
        if estado == "bloqueado":
            st.warning("Este foro fue bloqueado por moderación.")
            continue
        if not user:
            st.info("Inicia sesión para comentar.")
            continue
        nuevo = st.text_area("Agrega tu comentario", key=f"foro-text-{foro['id']}")
        if st.button("Comentar", key=f"foro-btn-{foro['id']}") and nuevo:
            moderacion = is_safe_text(nuevo)
            if moderacion["action"] == "block":
                st.error("El comentario no pasó la moderación local.")
            else:
                forum_store.add_comment(foro["id"], autor=perfil.get("correo") or user["email"], texto=nuevo)
                st.success("Comentario enviado.")
                st.experimental_rerun()


def _forum_section(perfil: Dict[str, Any]) -> None:
    st.subheader("Foros moderados")
    _render_forum_creator(perfil)
    st.divider()
    _render_event_forums(perfil)
    st.divider()
    _render_user_forums(perfil)


def _profile_tab() -> None:
    st.subheader("Mi Perfil persistente")
    user = st.session_state.get("user")
    if not user:
        st.info("Inicia sesión desde la barra lateral para personalizar tu experiencia.")
        return
    registro = profile_store.get_profile_by_email(user["email"])
    if not registro:
        st.error("No pudimos cargar tu perfil. Reintenta iniciar sesión.")
        return
    perfil = st.session_state["perfil"]
    tags_disponibles = tag_service.list_tags(include_pending=False)
    opciones_tags = [tag["value"] for tag in tags_disponibles]
    etiquetas_default = perfil.get("intereses", [])
    st.caption("Los datos se guardan localmente en JSON. Sustituye por Azure Cosmos DB para producción.")
    with st.form("perfil-form"):
        col1, col2 = st.columns(2)
        municipio = col1.text_input("Municipio", value=perfil.get("municipio", ""))
        estado = col1.text_input("Estado", value=perfil.get("estado", ""))
        idioma = col1.selectbox("Idioma preferido", options=list(SUPPORTED_LANGS.keys()), index=list(SUPPORTED_LANGS.keys()).index(perfil.get("idioma", "es")))
        intereses = col2.multiselect("Intereses prioritarios", options=opciones_tags, default=etiquetas_default, help="Muestra primero los contenidos relevantes.")
        interes_personalizado = col2.text_input("Agregar un interés libre", placeholder="Ciclovías seguras")
        tamano_fuente = st.slider("Tamaño de fuente", min_value=12, max_value=22, value=int(perfil.get("tamano_fuente", 16)))
        lectura = st.checkbox("Activar lectura en voz alta", value=perfil.get("lectura_en_voz_alta", False))
        traduccion = st.checkbox("Traducir respuestas automáticamente", value=perfil.get("traduccion_automatica", False))
        frecuencia = st.selectbox("Frecuencia de notificaciones", options=["inmediata", "diaria", "semanal"], index=["inmediata", "diaria", "semanal"].index(perfil.get("frecuencia_notificaciones", "diaria")))
        consent = st.checkbox("Deseo recibir recordatorios cívicos", value=perfil.get("consent_notifications", True))
        guardar = st.form_submit_button("Guardar cambios")
        if guardar:
            intereses_finales = intereses.copy()
            if interes_personalizado:
                slug = interes_personalizado.strip().lower().replace(" ", "-")
                tag_service.add_user_tag(slug, interes_personalizado.strip().title(), autor=user["user_id"])
                tag_service.ensure_user_interest(slug, user["user_id"])
                intereses_finales.append(slug)
            payload = {
                "municipio": municipio,
                "estado": estado,
                "idioma": idioma,
                "intereses": intereses_finales,
                "accesibilidad": {
                    "tamano_fuente": tamano_fuente,
                    "lectura_en_voz_alta": lectura,
                    "traduccion_automatica": traduccion,
                },
                "frecuencia_notificaciones": frecuencia,
                "consent_notifications": consent,
                "etiquetas_propias": intereses_finales,
            }
            actualizado = profile_store.update_profile(registro.user_id, payload)
            _set_active_profile(actualizado)
            st.success("Perfil actualizado correctamente.")


def _azure_connections_help() -> None:
    st.markdown("""
    ### 🔌 Próximos pasos para conectar servicios de Microsoft Foundry / Azure
    1. **Modelos conversacionales**: Provisiona un recurso de Azure OpenAI o Microsoft Foundry y define `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` y `AZURE_OPENAI_API_VERSION`. El archivo `.env.example` incluye la plantilla.
    2. **Orquestación con Semantic Kernel**: Instala `semantic-kernel` y agrega tus conectores a `AzureSemanticKernelClient`. Lo ideal es usar **Identidad Administrada** (DefaultAzureCredential) cuando despliegues en Azure App Service o Container Apps.
    3. **Fuentes oficiales**: Indexa boletines y calendarios en **Azure AI Search**. En el README encontrarás cómo referenciar índices (`AZURE_AI_SEARCH_INDEX`).
    4. **Mapa dinámico**: Sustituye `pydeck` por Azure Maps Web SDK o Azure Maps Creator para obtener capas reales, autenticadas con `AZURE_MAPS_CLIENT_ID`.
    5. **Notificaciones**: Envía las alertas filtradas a Azure Communication Services (correo/SMS) o a Azure Event Grid para disparar WebHooks.
    6. **Foros y moderación**: Sustituye el stub por Azure AI Content Safety e integra SignalR o Azure Web PubSub para comentarios en tiempo real.
    """)


def main() -> None:
    _auth_sidebar()
    perfil = st.session_state["perfil"]
    _sidebar_overview(perfil)

    st.title("CivicAI Hub — Información cívica confiable e inclusiva")
    st.caption("MVP para el Hackathon Innovation Challenge. El asistente es neutral y sin sesgos políticos.")

    tab_mapa, tab_chat, tab_notif, tab_foros, tab_perfil = st.tabs([
        "Mapa interactivo",
        "Chat Cívico",
        "Notificaciones",
        "Foros moderados",
        "Mi Perfil",
    ])

    with tab_mapa:
        _render_map(perfil)
    with tab_chat:
        _chat_section(perfil)
    with tab_notif:
        _notification_section(perfil)
    with tab_foros:
        _forum_section(perfil)
    with tab_perfil:
        _profile_tab()

    st.divider()
    _azure_connections_help()


if __name__ == "__main__":
    main()
