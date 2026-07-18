from functools import lru_cache
from pathlib import Path

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Blood Donor Smart Network"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/blood_donor"
    )
    jwt_secret_key: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    password_reset_expire_minutes: int = 30
    email_verification_expire_minutes: int = 60 * 24
    frontend_url: AnyHttpUrl | str = "http://localhost:5173"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    auto_create_tables: bool = True
    upload_dir: Path = Path("backend/app/uploads")
    yolo_model_path: str = "yolov8n.pt"
    max_upload_mb: int = 8

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
