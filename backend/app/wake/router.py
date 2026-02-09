"""
©AngelaMos | 2026
router.py
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.wake import service
from app.wake.schemas import WakeWordModelsResponse


router = APIRouter()


@router.get("/wakeword/models", response_model = WakeWordModelsResponse)
async def list_models() -> WakeWordModelsResponse:
    """
    List available wake word models.
    """
    return WakeWordModelsResponse(models = service.list_models())


@router.websocket("/ws/wake")
async def websocket_detect(websocket: WebSocket) -> None:
    """
    WebSocket endpoint for real-time wake word detection.
    Send audio chunks as binary, receive JSON detection events.
    """
    await websocket.accept()

    model = service.create_session_model()

    try:
        while True:
            msg = await websocket.receive()

            if msg.get("type") == "websocket.disconnect":
                break

            if "text" in msg:
                if msg["text"] == "reset":
                    model.reset()
                continue

            if "bytes" not in msg:
                continue

            detections = service.process_audio(model, msg["bytes"])

            for detection in detections:
                await websocket.send_json(detection.model_dump())

    except WebSocketDisconnect:
        pass
