"""Base repository utilities for local JSON catalogues."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ..core.config import Settings


class JSONRepository:
    """Simple helper to read immutable JSON datasets bundled with the repo."""

    def __init__(self, settings: Settings, filename: str) -> None:
        self._settings = settings
        self._filename = filename

    @property
    def data_path(self) -> Path:
        return self._settings.datasets_dir / self._filename

    def load(self) -> list[dict[str, Any]]:
        with self.data_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
