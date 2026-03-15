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

    @classmethod
    def validate(cls):
        missing = []
        
        if not cls.OPENWEATHER_API_KEY:
            missing.append("OPENWEATHER_API_KEY")
        if not cls.NEWS_API_KEY:
            missing.append("NEWS_API_KEY")
        
        if missing:
            raise ValueError(f"Variabile de mediu lipsa: {', '.join(missing)}")

config = Config()
