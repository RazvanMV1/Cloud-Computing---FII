from fastapi import APIRouter, HTTPException, Query
from services import news_service

router = APIRouter(prefix="/news", tags=["News"])


@router.get("/education")
async def get_education_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(6, ge=1, le=20)
):
    try:
        result = await news_service.get_education_news(page, page_size)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topic")
async def get_news_by_topic(
    topic: str = Query(..., min_length=2),
    page_size: int = Query(6, ge=1, le=20)
):
    try:
        result = await news_service.get_news_by_topic(topic, page_size)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
