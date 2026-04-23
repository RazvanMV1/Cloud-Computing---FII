from azure.storage.queue import QueueClient
from config import config
import json
import base64
from datetime import datetime

QUEUE_NAME = "dashboard-events"

queue_client = QueueClient.from_connection_string(config.AZURE_STORAGE_CONNECTION, QUEUE_NAME)

# Creare queue la pornire
try:
    queue_client.create_queue()
except Exception:
    pass  # Exista deja


def send_event(event_type: str, data: dict):
    message = {
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    encoded = base64.b64encode(json.dumps(message).encode()).decode()
    queue_client.send_message(encoded)


def get_recent_events(max_messages: int = 10) -> list:
    messages = queue_client.peek_messages(max_messages=max_messages)
    events = []
    for msg in messages:
        try:
            decoded = json.loads(base64.b64decode(msg.content).decode())
            events.append(decoded)
        except Exception:
            events.append({"raw": msg.content})
    return events
