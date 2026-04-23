from azure.cosmos import CosmosClient, exceptions
from config import config
import hashlib

# Cosmos DB setup
client = CosmosClient(config.COSMOS_ENDPOINT, config.COSMOS_KEY)
database = client.get_database_client("university-db")
container = database.get_container_client("favorites")


def get_favorite_courses() -> list:
    query = "SELECT * FROM c WHERE c.type = 'course'"
    items = list(container.query_items(query=query, enable_cross_partition_query=True))
    # Curatam metadata Cosmos din raspuns
    for item in items:
        for key in ["_rid", "_self", "_etag", "_attachments", "_ts"]:
            item.pop(key, None)
    return items


def add_favorite_course(course: dict) -> dict:
    existing = list(container.query_items(
        query="SELECT * FROM c WHERE c.type = 'course' AND c.courseId = @id",
        parameters=[{"name": "@id", "value": course["id"]}],
        enable_cross_partition_query=True
    ))
    if existing:
        raise ValueError(f"Cursul cu id {course['id']} este deja la favorite")

    doc = {
        "id": f"course-{course['id']}",
        "type": "course",
        "courseId": course["id"],
        "title": course["title"],
        "teacher": course["teacher"],
        "description": course.get("description", ""),
        "max_students": course["max_students"]
    }
    container.create_item(body=doc)
    return course


def remove_favorite_course(course_id: int) -> bool:
    try:
        doc_id = f"course-{course_id}"
        container.delete_item(item=doc_id, partition_key="course")
        return True
    except exceptions.CosmosResourceNotFoundError:
        return False


def get_favorite_articles() -> list:
    query = "SELECT * FROM c WHERE c.type = 'article'"
    items = list(container.query_items(query=query, enable_cross_partition_query=True))
    for item in items:
        for key in ["_rid", "_self", "_etag", "_attachments", "_ts"]:
            item.pop(key, None)
    return items


def add_favorite_article(article: dict) -> dict:
    existing = list(container.query_items(
        query="SELECT * FROM c WHERE c.type = 'article' AND c.url = @url",
        parameters=[{"name": "@url", "value": article["url"]}],
        enable_cross_partition_query=True
    ))
    if existing:
        raise ValueError("Articolul este deja la favorite")

    url_hash = hashlib.md5(article["url"].encode()).hexdigest()[:12]
    doc = {
        "id": f"article-{url_hash}",
        "type": "article",
        "url": article["url"],
        "title": article["title"],
        "description": article.get("description", ""),
        "source": article["source"],
        "published_at": article["published_at"],
        "image_url": article.get("image_url")
    }
    container.create_item(body=doc)
    return article


def remove_favorite_article(article_url: str) -> bool:
    existing = list(container.query_items(
        query="SELECT * FROM c WHERE c.type = 'article' AND c.url = @url",
        parameters=[{"name": "@url", "value": article_url}],
        enable_cross_partition_query=True
    ))
    if not existing:
        return False
    container.delete_item(item=existing[0]["id"], partition_key="article")
    return True
