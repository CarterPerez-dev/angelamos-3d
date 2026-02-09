"""
©AngelaMos | 2026
service.py
"""

from collections.abc import AsyncGenerator
from typing import Any

import httpx

from app.chat.schemas import ChatResponse, Message
from app.config import ANGELA_SYSTEM_PROMPT, settings
from app.core.exceptions import OllamaConnectionError


SYSTEM_MESSAGE = Message(role = "system", content = ANGELA_SYSTEM_PROMPT)


def build_payload(messages: list[Message], stream: bool) -> dict[str, Any]:
    """
    Build Ollama request payload with system prompt and options.
    """
    all_messages = [SYSTEM_MESSAGE, *messages]
    return {
        "model": settings.OLLAMA_MODEL,
        "messages": [m.model_dump() for m in all_messages],
        "stream": stream,
        "options": {
            "temperature": settings.OLLAMA_TEMPERATURE,
            "num_predict": settings.OLLAMA_MAX_TOKENS,
        },
    }


async def stream_chat(messages: list[Message]) -> AsyncGenerator[bytes, None]:
    """
    Stream chat responses from Ollama.
    """
    payload = build_payload(messages, stream = True)

    try:
        async with httpx.AsyncClient() as client:  # noqa: SIM117
            async with client.stream(
                    "POST",
                    f"{settings.OLLAMA_HOST}/api/chat",
                    json = payload,
                    timeout = settings.OLLAMA_TIMEOUT,
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        yield line.encode() + b"\n"
    except httpx.ConnectError as e:
        raise OllamaConnectionError() from e


async def chat(messages: list[Message]) -> ChatResponse:
    """
    Send chat request to Ollama and return complete response.
    """
    payload = build_payload(messages, stream = False)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.OLLAMA_HOST}/api/chat",
                json = payload,
                timeout = settings.OLLAMA_TIMEOUT,
            )
            data = response.json()

        return ChatResponse(
            message = Message(**data["message"]),
            model = data["model"],
            done = data["done"],
        )
    except httpx.ConnectError as e:
        raise OllamaConnectionError() from e
