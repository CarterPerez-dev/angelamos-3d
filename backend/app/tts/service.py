"""
©AngelaMos | 2026
service.py
"""

import io

import edge_tts

from app.config import settings
from app.core.exceptions import EmptyTextError
from app.tts.schemas import VoiceInfo


async def synthesize(text: str) -> bytes:
    """
    Synthesize text to speech audio.
    """
    if not text.strip():
        raise EmptyTextError()

    communicate = edge_tts.Communicate(text, settings.TTS_VOICE)

    buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])

    buffer.seek(0)
    return buffer.read()


async def list_voices() -> list[VoiceInfo]:
    """
    Get all available Edge TTS voices.
    """
    voices = await edge_tts.list_voices()
    return [
        VoiceInfo(
            voice_id = v["ShortName"],
            name = v["FriendlyName"],
            gender = v["Gender"],
            locale = v["Locale"],
        ) for v in voices
    ]
