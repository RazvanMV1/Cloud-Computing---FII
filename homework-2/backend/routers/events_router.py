from fastapi import APIRouter
from services import queue_service

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/recent")
async def get_recent_events():
    events = queue_service.get_recent_events()
    return {"success": True, "data": events, "total": len(events)}
