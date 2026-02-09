"""
©AngelaMos | 2026
router.py
"""

from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.stt import service
from app.stt.schemas import TranscriptionResponse


router = APIRouter()


@router.post("/stt", response_model = TranscriptionResponse)
async def transcribe(
    file: Annotated[UploadFile,
                    File(description = "Audio file to transcribe")],
) -> TranscriptionResponse:
    """
    Transcribe audio to text using faster-whisper.
    """
    audio_data = await file.read()
    return await service.transcribe(audio_data, file.filename or "audio.wav")
