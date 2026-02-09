"""
©AngelaMos | 2026
service.py
"""

import numpy as np
from openwakeword.model import Model
from scipy import signal

from app.config import settings
from app.wake.schemas import WakeWordDetection


_model: Model | None = None


def get_model() -> Model:
    """
    Lazy-load the OpenWakeWord model singleton.
    """
    global _model
    if _model is None:
        model_paths = list(settings.WAKEWORD_MODELS_DIR.glob("*.tflite"))
        model_paths += list(settings.WAKEWORD_MODELS_DIR.glob("*.onnx"))

        vad_threshold = (
            settings.WAKEWORD_VAD_THRESHOLD
            if settings.WAKEWORD_ENABLE_VAD else None
        )

        if model_paths:
            _model = Model(
                wakeword_models = [str(p) for p in model_paths],
                vad_threshold = vad_threshold,
            )
        else:
            _model = Model(vad_threshold = vad_threshold)
    return _model


def create_session_model() -> Model:
    """
    Create a new model instance for a WebSocket session.
    Each session needs its own model to avoid state conflicts.
    """
    model_paths = list(settings.WAKEWORD_MODELS_DIR.glob("*.tflite"))
    model_paths += list(settings.WAKEWORD_MODELS_DIR.glob("*.onnx"))

    vad_threshold = (
        settings.WAKEWORD_VAD_THRESHOLD
        if settings.WAKEWORD_ENABLE_VAD else None
    )

    if model_paths:
        return Model(
            wakeword_models = [str(p) for p in model_paths],
            vad_threshold = vad_threshold,
        )
    return Model(vad_threshold = vad_threshold)


def list_models() -> list[str]:
    """
    Get names of loaded wake word models.
    """
    m = get_model()
    return list(m.models.keys())


def process_audio(model: Model, audio_bytes: bytes) -> list[WakeWordDetection]:
    """
    Process audio chunk and return any detections.
    """
    audio = np.frombuffer(audio_bytes, dtype = np.int16)

    if len(audio) != settings.WAKEWORD_TARGET_SAMPLES:
        ratio = len(audio) // settings.WAKEWORD_TARGET_SAMPLES
        if ratio > 1:
            audio = audio[:: ratio][: settings.WAKEWORD_TARGET_SAMPLES]
        else:
            audio = signal.resample_poly(
                audio,
                settings.WAKEWORD_TARGET_SAMPLES,
                len(audio)
            ).astype(np.int16)

    predictions = model.predict(audio)
    model_names = list(model.models.keys())

    detections = []
    for name in model_names:
        score = predictions.get(name, 0.0)
        if score >= settings.WAKEWORD_THRESHOLD:
            detections.append(
                WakeWordDetection(
                    detected = True,
                    model = name,
                    score = float(score),
                )
            )

    return detections
