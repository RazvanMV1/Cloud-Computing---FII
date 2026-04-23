from fastapi import APIRouter, Query
from services import activity_service

router = APIRouter(prefix="/activity", tags=["Activity Log"])


@router.get("/log")
async def get_activity_log(
    date: str = Query(None, description="Format: YYYY-MM-DD"),
    top: int = Query(20, ge=1, le=100)
):
    logs = activity_service.get_activity_log(date=date, top=top)
    return {"success": True, "data": logs, "total": len(logs)}
