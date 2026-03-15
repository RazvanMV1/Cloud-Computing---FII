from fastapi import APIRouter, HTTPException
from services import favorites_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/favorites", tags=["Favorites"])


class CoursePayload(BaseModel):
    id: int
    title: str
    teacher: str
    description: Optional[str] = None
    max_students: int


class ArticlePayload(BaseModel):
    url: str
    title: str
    description: Optional[str] = None
    source: str
    published_at: str
    image_url: Optional[str] = None


class RemoveArticlePayload(BaseModel):
    url: str


@router.get("/courses")
async def get_favorite_courses():
    try:
        courses = favorites_service.get_favorite_courses()
        return {"success": True, "data": courses, "total": len(courses)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/courses")
async def add_favorite_course(course: CoursePayload):
    try:
        result = favorites_service.add_favorite_course(course.model_dump())
        return {"success": True, "message": "Curs adaugat la favorite", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/courses/{course_id}")
async def remove_favorite_course(course_id: int):
    try:
        removed = favorites_service.remove_favorite_course(course_id)
        if not removed:
            raise HTTPException(status_code=404, detail=f"Cursul cu id {course_id} nu este la favorite")
        return {"success": True, "message": "Curs eliminat din favorite"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/articles")
async def get_favorite_articles():
    try:
        articles = favorites_service.get_favorite_articles()
        return {"success": True, "data": articles, "total": len(articles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/articles")
async def add_favorite_article(article: ArticlePayload):
    try:
        result = favorites_service.add_favorite_article(article.model_dump())
        return {"success": True, "message": "Articol adaugat la favorite", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/articles")
async def remove_favorite_article(payload: RemoveArticlePayload):
    try:
        removed = favorites_service.remove_favorite_article(payload.url)
        if not removed:
            raise HTTPException(status_code=404, detail="Articolul nu este la favorite")
        return {"success": True, "message": "Articol eliminat din favorite"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
