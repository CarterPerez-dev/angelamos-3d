"""
©AngelaMos | 2026
router.py
"""

from fastapi import APIRouter
from fastapi.responses import Response

from app.tts import service
from app.tts.schemas import SynthesizeRequest, VoiceInfo


router = APIRouter()


@router.post("/tts/synthesize")
async def synthesize(request: SynthesizeRequest) -> Response:
    """
    Convert text to speech using Edge TTS.
    """
    audio = await service.synthesize(request.text)
    return Response(content = audio, media_type = "audio/mpeg")


@router.get("/tts/voices")
async def list_voices() -> list[VoiceInfo]:
    """
    List available Edge TTS voices.
    """
    return await service.list_voices()
