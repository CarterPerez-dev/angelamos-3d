"""
©AngelaMos | 2026
schemas.py
"""

from pydantic import BaseModel


class Message(BaseModel):
    """
    A single chat message.
    """

    role: str
    content: str


class ChatRequest(BaseModel):
    """
    Request body for chat endpoint.
    """

    messages: list[Message]
    stream: bool = True


class ChatResponse(BaseModel):
    """
    Non-streaming chat response.
    """

    message: Message
    model: str
    done: bool
