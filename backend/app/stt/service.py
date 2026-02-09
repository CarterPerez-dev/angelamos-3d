"""
©AngelaMos | 2026
service.py
"""

import tempfile
from pathlib import Path

from faster_whisper import WhisperModel

from app.config import settings
from app.core.exceptions import TranscriptionError
from app.stt.schemas import TranscriptionResponse


_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    """
    Lazy-load the Whisper model singleton.
    """
    global _model
    if _model is None:
        device = settings.WHISPER_DEVICE
        compute_type = "int8"

        if device == "auto":
            try:
                import ctranslate2
                if ctranslate2.get_cuda_device_count() > 0:
                    device = "cuda"
                    compute_type = "float16"
                else:
                    device = "cpu"
            except Exception:
                device = "cpu"
        elif device == "cuda":
            compute_type = "float16"

        try:
            _model = WhisperModel(
                settings.WHISPER_MODEL,
                device = device,
                compute_type = compute_type,
            )
        except Exception:
            device = "cpu"
            compute_type = "int8"
            _model = WhisperModel(
                settings.WHISPER_MODEL,
                device = device,
                compute_type = compute_type,
            )
    return _model


async def transcribe(
    audio_data: bytes,
    filename: str
) -> TranscriptionResponse:
    """
    Transcribe audio bytes to text.
    """
    suffix = Path(filename).suffix or ".wav"

    try:
        with tempfile.NamedTemporaryFile(suffix = suffix,
                                         delete = True) as tmp:
            tmp.write(audio_data)
            tmp.flush()

            model = get_model()
            segments, info = model.transcribe(tmp.name, beam_size = 5)
            text_parts = [segment.text for segment in segments]
            full_text = " ".join(text_parts).strip()

        return TranscriptionResponse(
            text = full_text,
            language = info.language,
            duration = info.duration,
        )
    except Exception as e:
        raise TranscriptionError(str(e)) from e
