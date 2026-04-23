from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # University API (HW1)
    UNIVERSITY_API_URL = os.getenv("UNIVERSITY_API_URL", "http://host.docker.internal:8000")
    
    # OpenWeatherMap
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    OPENWEATHER_CITY = os.getenv("OPENWEATHER_CITY", "Bucharest")
    
    # NewsAPI
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")

    # Azure Cosmos DB
    COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
    COSMOS_KEY = os.getenv("COSMOS_KEY")

    # Azure Storage
    AZURE_STORAGE_CONNECTION = os.getenv("AZURE_STORAGE_CONNECTION")

    # Azure Translator
    AZURE_TRANSLATOR_KEY = os.getenv("AZURE_TRANSLATOR_KEY")
    AZURE_TRANSLATOR_REGION = os.getenv("AZURE_TRANSLATOR_REGION", "swedencentral")

    @classmethod
    def validate(cls):
        missing = []
        
        if not cls.OPENWEATHER_API_KEY:
            missing.append("OPENWEATHER_API_KEY")
        if not cls.NEWS_API_KEY:
            missing.append("NEWS_API_KEY")
        if not cls.COSMOS_ENDPOINT:
            missing.append("COSMOS_ENDPOINT")
        if not cls.COSMOS_KEY:
            missing.append("COSMOS_KEY")
        if not cls.AZURE_STORAGE_CONNECTION:
            missing.append("AZURE_STORAGE_CONNECTION")
        if not cls.AZURE_TRANSLATOR_KEY:
            missing.append("AZURE_TRANSLATOR_KEY")
        
        if missing:
            raise ValueError(f"Variabile de mediu lipsa: {', '.join(missing)}")

config = Config()
