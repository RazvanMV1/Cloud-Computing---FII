from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config, Config
from routers import university_router, weather_router, news_router, favorites_router, documents_router, events_router, translator_router, activity_router

try:
    Config.validate()
except ValueError as e:
    print(f"Eroare configurare: {e}")
    exit(1)

app = FastAPI(
    title="University Dashboard API",
    description="Backend pentru University Dashboard - agregare date din multiple servicii cu Azure Cloud",
    version="2.0.0"
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
app.include_router(documents_router.router)
app.include_router(events_router.router)
app.include_router(translator_router.router)
app.include_router(activity_router.router)


@app.get("/")
async def root():
    return {
        "message": "University Dashboard API - Azure Cloud Edition",
        "version": "2.0.0",
        "services": {
            "university_api": config.UNIVERSITY_API_URL,
            "weather_city": config.OPENWEATHER_CITY,
            "azure_cosmos_db": config.COSMOS_ENDPOINT,
            "azure_blob_storage": "univdashboardstorage",
            "azure_queue_storage": "dashboard-events",
            "azure_table_storage": "activitylog",
            "azure_translator": "univdashboard-translator"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "university_api": config.UNIVERSITY_API_URL,
        "openweather_configured": bool(config.OPENWEATHER_API_KEY),
        "newsapi_configured": bool(config.NEWS_API_KEY),
        "cosmos_db_configured": bool(config.COSMOS_ENDPOINT),
        "azure_storage_configured": bool(config.AZURE_STORAGE_CONNECTION),
        "azure_translator_configured": bool(config.AZURE_TRANSLATOR_KEY)
    }
