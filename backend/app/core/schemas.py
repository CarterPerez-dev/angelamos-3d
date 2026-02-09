"""
©AngelaMos | 2026
schemas.py
"""

from pydantic import BaseModel


class AppInfoResponse(BaseModel):
    """
    Root endpoint response with API information.
    """

    name: str
    version: str
    docs_url: str
