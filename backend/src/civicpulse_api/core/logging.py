"""Logging helpers for the Civic Pulse API."""

from __future__ import annotations

import logging
from logging.config import dictConfig


def configure_logging(level: int = logging.INFO) -> None:
    """Configure structured logging with sane defaults."""

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "structured": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "structured",
                    "level": level,
                }
            },
            "root": {"level": level, "handlers": ["console"]},
        }
    )
