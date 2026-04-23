from azure.storage.blob import BlobServiceClient
from config import config
from datetime import datetime

CONTAINER_NAME = "student-documents"

blob_service_client = BlobServiceClient.from_connection_string(config.AZURE_STORAGE_CONNECTION)

# Creare container la pornire
try:
    blob_service_client.create_container(CONTAINER_NAME)
except Exception:
    pass  # Exista deja


async def upload_document(student_id: int, file) -> dict:
    blob_name = f"student-{student_id}/{file.filename}"
    blob_client = blob_service_client.get_blob_client(
        container=CONTAINER_NAME,
        blob=blob_name
    )

    content = await file.read()
    blob_client.upload_blob(content, overwrite=True)

    return {
        "student_id": student_id,
        "filename": file.filename,
        "size": len(content),
        "url": blob_client.url,
        "uploaded_at": datetime.utcnow().isoformat()
    }


async def get_documents(student_id: int) -> list:
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)
    prefix = f"student-{student_id}/"

    docs = []
    for blob in container_client.list_blobs(name_starts_with=prefix):
        docs.append({
            "filename": blob.name.replace(prefix, ""),
            "size": blob.size,
            "last_modified": blob.last_modified.isoformat(),
            "url": f"{blob_service_client.url}{CONTAINER_NAME}/{blob.name}"
        })
    return docs


async def delete_document(student_id: int, filename: str) -> bool:
    blob_name = f"student-{student_id}/{filename}"
    blob_client = blob_service_client.get_blob_client(
        container=CONTAINER_NAME,
        blob=blob_name
    )
    try:
        blob_client.delete_blob()
        return True
    except Exception:
        return False
