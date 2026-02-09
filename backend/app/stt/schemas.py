"""
©AngelaMos | 2026
schemas.py
"""

from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    """
    Speech-to-text transcription result.
    """

    text: str
    language: str
    duration: float
