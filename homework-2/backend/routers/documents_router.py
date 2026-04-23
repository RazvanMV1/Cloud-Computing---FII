from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from services import documents_service
from services import queue_service
from services import activity_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(
    student_id: int = Form(...),
    file: UploadFile = File(...)
):
    try:
        result = await documents_service.upload_document(student_id, file)
        queue_service.send_event("DOCUMENT_UPLOADED", {
            "student_id": student_id,
            "filename": file.filename
        })
        activity_service.log_activity("DOCUMENT_UPLOADED", {
            "student_id": student_id,
            "filename": file.filename
        })
        return {"success": True, "message": "Document uploadat", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{student_id}")
async def get_student_documents(student_id: int):
    try:
        docs = await documents_service.get_documents(student_id)
        return {"success": True, "data": docs, "total": len(docs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{student_id}/{filename}")
async def delete_document(student_id: int, filename: str):
    try:
        deleted = await documents_service.delete_document(student_id, filename)
        if not deleted:
            raise HTTPException(status_code=404, detail="Document negasit")
        queue_service.send_event("DOCUMENT_DELETED", {
            "student_id": student_id,
            "filename": filename
        })
        activity_service.log_activity("DOCUMENT_DELETED", {
            "student_id": student_id,
            "filename": filename
        })
        return {"success": True, "message": "Document sters"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
