"""
©AngelaMos | 2026
main.py
"""

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_PREFIX, OPENAPI_TAGS, settings
from app.core.schemas import AppInfoResponse
from app.chat import router as chat_router
from app.stt import router as stt_router
from app.tts import router as tts_router
from app.wake import router as wake_router


def create_app() -> FastAPI:
    """
    Application factory
    """
    app = FastAPI(
        title = settings.APP_NAME,
        summary = settings.APP_SUMMARY,
        description = settings.APP_DESCRIPTION,
        version = settings.APP_VERSION,
        contact = {
            "name": settings.APP_CONTACT_NAME,
            "email": settings.APP_CONTACT_EMAIL,
        },
        license_info = {
            "name": settings.APP_LICENSE_NAME,
            "url": settings.APP_LICENSE_URL,
        },
        openapi_tags = OPENAPI_TAGS,
        openapi_version = "3.1.0",
        openapi_url = "/openapi.json",
        docs_url = "/docs",
        redoc_url = "/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins = ["*"],
        allow_credentials = True,
        allow_methods = ["*"],
        allow_headers = ["*"],
    )

    @app.get("/", response_model = AppInfoResponse, tags = ["root"])
    async def root() -> AppInfoResponse:
        return AppInfoResponse(
            name = settings.APP_NAME,
            version = settings.APP_VERSION,
            docs_url = "/docs",
        )

    @app.get("/health", tags = ["health"])
    async def health() -> Response:
        return Response(content = "1", media_type = "text/plain")

    app.include_router(tts_router, prefix = API_PREFIX, tags = ["tts"])
    app.include_router(stt_router, prefix = API_PREFIX, tags = ["stt"])
    app.include_router(chat_router, prefix = API_PREFIX, tags = ["chat"])
    app.include_router(wake_router, prefix = API_PREFIX, tags = ["wakeword"])

    return app


app = create_app()
