import httpx
from config import config

BASE_URL = "https://api.openweathermap.org/data/2.5"


async def get_weather():
    params = {
        "q": config.OPENWEATHER_CITY,
        "appid": config.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "ro"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/weather", params=params, timeout=10)

            if response.status_code == 401:
                raise Exception("OpenWeatherMap API key invalid sau expirat")
            if response.status_code == 404:
                raise Exception(f"Orasul '{config.OPENWEATHER_CITY}' nu a fost gasit")

            response.raise_for_status()
            data = response.json()

            return {
                "city": data["name"],
                "country": data["sys"]["country"],
                "temperature": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "icon_url": f"https://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png",
                "wind_speed": data["wind"]["speed"],
                "pressure": data["main"]["pressure"]
            }

        except httpx.TimeoutException:
            raise Exception("OpenWeatherMap API timeout - serverul nu raspunde")
        except httpx.RequestError as e:
            raise Exception(f"OpenWeatherMap API nu este accesibil: {str(e)}")


async def get_forecast():
    params = {
        "q": config.OPENWEATHER_CITY,
        "appid": config.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "ro",
        "cnt": 5
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/forecast", params=params, timeout=10)

            if response.status_code == 401:
                raise Exception("OpenWeatherMap API key invalid sau expirat")
            if response.status_code == 404:
                raise Exception(f"Orasul '{config.OPENWEATHER_CITY}' nu a fost gasit")

            response.raise_for_status()
            data = response.json()

            forecast_list = []
            for item in data["list"]:
                forecast_list.append({
                    "datetime": item["dt_txt"],
                    "temperature": item["main"]["temp"],
                    "feels_like": item["main"]["feels_like"],
                    "humidity": item["main"]["humidity"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                    "icon_url": f"https://openweathermap.org/img/wn/{item['weather'][0]['icon']}@2x.png",
                    "wind_speed": item["wind"]["speed"]
                })

            return {
                "city": data["city"]["name"],
                "country": data["city"]["country"],
                "forecast": forecast_list
            }

        except httpx.TimeoutException:
            raise Exception("OpenWeatherMap API timeout - serverul nu raspunde")
        except httpx.RequestError as e:
            raise Exception(f"OpenWeatherMap API nu este accesibil: {str(e)}")
