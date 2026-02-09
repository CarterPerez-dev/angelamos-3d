"""
©AngelaMos | 2026
schemas.py
"""

from pydantic import BaseModel


class SynthesizeRequest(BaseModel):
    """
    Request body for text-to-speech synthesis.
    """

    text: str


class VoiceInfo(BaseModel):
    """
    Voice information returned by the voices endpoint.
    """

    voice_id: str
    name: str
    gender: str
    locale: str
