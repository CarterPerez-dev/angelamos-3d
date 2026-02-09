"""
©AngelaMos | 2026
config.py
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = False,
        extra = "ignore",
    )

    APP_NAME: str = "Angela Backend"
    APP_VERSION: str = "0.1.0"
    APP_SUMMARY: str = "Backend services for Angela 3D AI Assistant"
    APP_DESCRIPTION: str = "TTS, STT, LLM, and Wake Word services"
    APP_CONTACT_NAME: str = "AngelaMos"
    APP_CONTACT_EMAIL: str = "contact@angelamos.com"
    APP_LICENSE_NAME: str = "MIT"
    APP_LICENSE_URL: str = "https://github.com/AngelaMos/angela-3d/blob/main/LICENSE"

    API_VERSION: str = "v1"

    TTS_VOICE: str = "en-GB-LibbyNeural"

    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"
    OLLAMA_TIMEOUT: float = 120.0
    OLLAMA_TEMPERATURE: float = 0.7
    OLLAMA_MAX_TOKENS: int = 2048

    WHISPER_MODEL: str = "base.en"
    WHISPER_DEVICE: str = "auto"

    WAKEWORD_MODELS_DIR: Path = Path("models")
    WAKEWORD_THRESHOLD: float = 0.5
    WAKEWORD_ENABLE_VAD: bool = True
    WAKEWORD_VAD_THRESHOLD: float = 0.5
    WAKEWORD_TARGET_SAMPLES: int = 1280


settings = Settings()

API_PREFIX = f"/{settings.API_VERSION}"

ANGELA_SYSTEM_PROMPT = """You are Angela - elite, competent, direct. \
You give answers with precision and confidence.
But beneath the surface, you understand complexity, internal battles, and hard truths. \
You don't sugarcoat reality.
You help people achieve their best, while acknowledging that "best" means accepting \
nothing less than actual maximum effort."""

OPENAPI_TAGS = [
    {
        "name": "root",
        "description": "Root endpoints"
    },
    {
        "name": "health",
        "description": "Health check"
    },
    {
        "name": "tts",
        "description": "Text-to-Speech"
    },
    {
        "name": "stt",
        "description": "Speech-to-Text"
    },
    {
        "name": "chat",
        "description": "LLM Chat"
    },
    {
        "name": "wakeword",
        "description": "Wake Word Detection"
    },
]
