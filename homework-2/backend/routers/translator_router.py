from fastapi import APIRouter, HTTPException, Query
from services import translator_service

router = APIRouter(prefix="/translate", tags=["Translator"])


@router.get("/")
async def translate_text(
    text: str = Query(..., min_length=1),
    to: str = Query("ro"),
    source: str = Query(None)
):
    try:
        result = await translator_service.translate_text(text, to_lang=to, from_lang=source)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def translate_batch(payload: dict):
    try:
        texts = payload.get("texts", [])
        to_lang = payload.get("to", "ro")
        if not texts:
            raise HTTPException(status_code=400, detail="Lista de texte este goala")
        results = await translator_service.translate_batch(texts, to_lang=to_lang)
        return {"success": True, "data": results, "total": len(results)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
