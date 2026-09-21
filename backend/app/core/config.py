"""
Configuración central de la aplicación.

Toda la configuración se lee de variables de entorno (archivo .env en la
raíz de /backend). Mantener la configuración en un solo lugar facilita
mover el proyecto entre entornos (local, pruebas, producción) sin tocar
el código.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Base de datos
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "SAID_DB"
    db_user: str = "postgres"
    db_password: str = "Sena1234"

    # Seguridad
    secret_key: str = "clave-de-desarrollo-cambiar-en-produccion"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # CORS
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cachea la configuración para no releer el .env en cada request."""
    return Settings()
