"""
©AngelaMos | 2026
router.py
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.chat import service
from app.chat.schemas import ChatRequest, ChatResponse


router = APIRouter()


@router.post("/chat", response_model = None)
async def chat(request: ChatRequest) -> StreamingResponse | ChatResponse:
    """
    Chat with Angela.
    Backend handles model, temperature, and system prompt.
    """
    if request.stream:
        return StreamingResponse(
            service.stream_chat(request.messages),
            media_type = "application/x-ndjson",
        )

    return await service.chat(request.messages)
