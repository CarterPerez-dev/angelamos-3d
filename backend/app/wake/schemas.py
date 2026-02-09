"""
©AngelaMos | 2026
schemas.py
"""

from pydantic import BaseModel


class WakeWordModelsResponse(BaseModel):
    """
    Response listing available wake word models.
    """

    models: list[str]


class WakeWordDetection(BaseModel):
    """
    Wake word detection event.
    """

    detected: bool
    model: str
    score: float
