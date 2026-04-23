from azure.data.tables import TableServiceClient
from config import config
from datetime import datetime
import uuid

TABLE_NAME = "activitylog"

table_service = TableServiceClient.from_connection_string(config.AZURE_STORAGE_CONNECTION)

# Creare table la pornire
try:
    table_service.create_table(TABLE_NAME)
except Exception:
    pass  # Exista deja

table_client = table_service.get_table_client(TABLE_NAME)


def log_activity(action: str, details: dict) -> dict:
    entity = {
        "PartitionKey": datetime.utcnow().strftime("%Y-%m-%d"),
        "RowKey": str(uuid.uuid4()),
        "action": action,
        "details": str(details),
        "timestamp_utc": datetime.utcnow().isoformat()
    }
    table_client.create_entity(entity=entity)
    return entity


def get_activity_log(date: str = None, top: int = 20) -> list:
    if date:
        query_filter = f"PartitionKey eq '{date}'"
    else:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        query_filter = f"PartitionKey eq '{today}'"

    entities = table_client.query_entities(
        query_filter=query_filter,
        select=["PartitionKey", "RowKey", "action", "details", "timestamp_utc"]
    )

    results = []
    for entity in entities:
        results.append({
            "date": entity["PartitionKey"],
            "id": entity["RowKey"],
            "action": entity["action"],
            "details": entity["details"],
            "timestamp": entity.get("timestamp_utc", "")
        })
        if len(results) >= top:
            break

    results.sort(key=lambda x: x["timestamp"], reverse=True)
    return results
