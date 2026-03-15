import json
import os

DATA_DIR = "data"
FAVORITES_FILE = os.path.join(DATA_DIR, "favorites.json")


def _read_favorites() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FAVORITES_FILE):
        return {"courses": [], "articles": []}
    try:
        with open(FAVORITES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if "courses" not in data:
                data["courses"] = []
            if "articles" not in data:
                data["articles"] = []
            return data
    except (json.JSONDecodeError, IOError):
        return {"courses": [], "articles": []}


def _write_favorites(data: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(FAVORITES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_favorite_courses() -> list:
    return _read_favorites()["courses"]


def add_favorite_course(course: dict) -> dict:
    data = _read_favorites()
    existing_ids = [c["id"] for c in data["courses"]]
    if course["id"] in existing_ids:
        raise ValueError(f"Cursul cu id {course['id']} este deja la favorite")
    data["courses"].append(course)
    _write_favorites(data)
    return course


def remove_favorite_course(course_id: int) -> bool:
    data = _read_favorites()
    original_len = len(data["courses"])
    data["courses"] = [c for c in data["courses"] if c["id"] != course_id]
    if len(data["courses"]) == original_len:
        return False
    _write_favorites(data)
    return True


def get_favorite_articles() -> list:
    return _read_favorites()["articles"]


def add_favorite_article(article: dict) -> dict:
    data = _read_favorites()
    existing_urls = [a["url"] for a in data["articles"]]
    if article["url"] in existing_urls:
        raise ValueError("Articolul este deja la favorite")
    data["articles"].append(article)
    _write_favorites(data)
    return article


def remove_favorite_article(article_url: str) -> bool:
    data = _read_favorites()
    original_len = len(data["articles"])
    data["articles"] = [a for a in data["articles"] if a["url"] != article_url]
    if len(data["articles"]) == original_len:
        return False
    _write_favorites(data)
    return True
