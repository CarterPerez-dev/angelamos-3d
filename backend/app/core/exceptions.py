"""
©AngelaMos | 2026
exceptions.py
"""

from fastapi import HTTPException, status


class AngelaException(HTTPException):
    """
    Base exception for Angela backend.
    """
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "An error occurred",
    ) -> None:
        super().__init__(status_code = status_code, detail = detail)


class EmptyTextError(AngelaException):
    """
    Raised when text input is empty or whitespace.
    """
    def __init__(self) -> None:
        super().__init__(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Text cannot be empty",
        )


class ModelNotLoadedError(AngelaException):
    """
    Raised when a required model is not loaded.
    """
    def __init__(self, model_name: str) -> None:
        super().__init__(
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
            detail = f"Model not loaded: {model_name}",
        )


class TranscriptionError(AngelaException):
    """
    Raised when audio transcription fails.
    """
    def __init__(self, reason: str = "Unknown error") -> None:
        super().__init__(
            status_code = status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail = f"Transcription failed: {reason}",
        )


class OllamaConnectionError(AngelaException):
    """
    Raised when connection to Ollama fails.
    """
    def __init__(self) -> None:
        super().__init__(
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
            detail = "Cannot connect to Ollama",
        )
