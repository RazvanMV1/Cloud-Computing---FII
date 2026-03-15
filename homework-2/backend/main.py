from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config, Config
from routers import university_router, weather_router, news_router, favorites_router

try:
    Config.validate()
except ValueError as e:
    print(f"Eroare configurare: {e}")
    exit(1)

app = FastAPI(
    title="University Dashboard API",
    description="Backend pentru University Dashboard - agregare date din multiple servicii",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(university_router.router)
app.include_router(weather_router.router)
app.include_router(news_router.router)
app.include_router(favorites_router.router)


@app.get("/")
async def root():
    return {
        "message": "University Dashboard API",
        "version": "1.0.0",
        "services": {
            "university_api": config.UNIVERSITY_API_URL,
            "weather_city": config.OPENWEATHER_CITY
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "university_api": config.UNIVERSITY_API_URL,
        "openweather_configured": bool(config.OPENWEATHER_API_KEY),
        "newsapi_configured": bool(config.NEWS_API_KEY)
    }
