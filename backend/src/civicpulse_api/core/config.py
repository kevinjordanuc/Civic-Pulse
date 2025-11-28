"""Application configuration and strongly typed settings."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application settings loaded from the environment."""

    app_name: str = "Civic Pulse API"
    environment: str = Field(default="local", alias="ENVIRONMENT")
    api_prefix: str = "/api"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Storage / data bootstrap
    data_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[3] / "data")

    # Azure + AI configuration (stubs that align with future integrations)
    azure_openai_endpoint: str | None = Field(default=None, alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_deployment: str | None = Field(default=None, alias="AZURE_OPENAI_DEPLOYMENT")
    azure_openai_api_key: str | None = Field(default=None, alias="AZURE_OPENAI_API_KEY")
    azure_openai_api_version: str = Field(default="2024-05-01-preview", alias="AZURE_OPENAI_API_VERSION")
    azure_search_endpoint: str | None = Field(default=None, alias="AZURE_AI_SEARCH_ENDPOINT")
    azure_search_index: str | None = Field(default=None, alias="AZURE_AI_SEARCH_INDEX")
    azure_search_api_key: str | None = Field(default=None, alias="AZURE_AI_SEARCH_API_KEY")
    azure_maps_client_id: str | None = Field(default=None, alias="AZURE_MAPS_CLIENT_ID")
    azure_content_safety_endpoint: str | None = Field(default=None, alias="AZURE_CONTENT_SAFETY_ENDPOINT")

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parents[3] / "config" / ".env",
            Path(__file__).resolve().parents[3] / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def datasets_dir(self) -> Path:
        """Absolute path to the demo datasets bundled with the repo."""

        return self.data_root


def get_settings() -> Settings:
    """Helper used by dependency overrides during testing."""

    return Settings()
