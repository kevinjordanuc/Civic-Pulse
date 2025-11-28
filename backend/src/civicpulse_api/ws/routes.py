"""WebSocket endpoints skeleton."""

from __future__ import annotations

from fastapi import FastAPI, WebSocket


def register_ws_routes(app: FastAPI) -> None:
    @app.websocket("/ws/chat")
    async def chat_ws(socket: WebSocket) -> None:  # pragma: no cover - interactive
        await socket.accept()
        await socket.send_text("Streaming vendrá pronto")
        await socket.close()
