from fastapi import APIRouter, HTTPException
from services import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current")
async def get_current_weather():
    try:
        result = await weather_service.get_weather()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
async def get_forecast():
    try:
        result = await weather_service.get_forecast()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
