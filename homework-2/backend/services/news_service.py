import httpx
from config import config

BASE_URL = "https://newsapi.org/v2"


async def get_education_news(page: int = 1, page_size: int = 6):
    params = {
        "q": "education OR university OR students",
        "language": "en",
        "sortBy": "publishedAt",
        "page": page,
        "pageSize": page_size,
        "apiKey": config.NEWS_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/everything", params=params, timeout=10)

            if response.status_code == 401:
                raise Exception("NewsAPI key invalid sau expirat")
            if response.status_code == 429:
                raise Exception("NewsAPI limita de cereri depasita")

            response.raise_for_status()
            data = response.json()

            if data.get("status") == "error":
                raise Exception(f"NewsAPI error: {data.get('message', 'Eroare necunoscuta')}")

            articles = []
            for article in data.get("articles", []):
                if article.get("title") and article.get("title") != "[Removed]":
                    articles.append({
                        "title": article["title"],
                        "description": article.get("description", ""),
                        "url": article["url"],
                        "source": article["source"]["name"],
                        "published_at": article["publishedAt"],
                        "image_url": article.get("urlToImage", None)
                    })

            return {
                "total_results": data.get("totalResults", 0),
                "page": page,
                "page_size": page_size,
                "articles": articles
            }

        except httpx.TimeoutException:
            raise Exception("NewsAPI timeout - serverul nu raspunde")
        except httpx.RequestError as e:
            raise Exception(f"NewsAPI nu este accesibil: {str(e)}")


async def get_news_by_topic(topic: str, page_size: int = 6):
    params = {
        "q": topic,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
        "apiKey": config.NEWS_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/everything", params=params, timeout=10)

            if response.status_code == 401:
                raise Exception("NewsAPI key invalid sau expirat")
            if response.status_code == 429:
                raise Exception("NewsAPI limita de cereri depasita")

            response.raise_for_status()
            data = response.json()

            if data.get("status") == "error":
                raise Exception(f"NewsAPI error: {data.get('message', 'Eroare necunoscuta')}")

            articles = []
            for article in data.get("articles", []):
                if article.get("title") and article.get("title") != "[Removed]":
                    articles.append({
                        "title": article["title"],
                        "description": article.get("description", ""),
                        "url": article["url"],
                        "source": article["source"]["name"],
                        "published_at": article["publishedAt"],
                        "image_url": article.get("urlToImage", None)
                    })

            return {
                "topic": topic,
                "total_results": data.get("totalResults", 0),
                "articles": articles
            }

        except httpx.TimeoutException:
            raise Exception("NewsAPI timeout - serverul nu raspunde")
        except httpx.RequestError as e:
            raise Exception(f"NewsAPI nu este accesibil: {str(e)}")
