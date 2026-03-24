import json
import os
import threading
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


class LocalUsersCollection:
    """
    Fallback storage for users when MongoDB is unavailable.
    This keeps the app functional during development.
    """

    def __init__(self, json_path: str):
        self._path = Path(json_path)
        self._lock = threading.Lock()
        self._path.parent.mkdir(parents=True, exist_ok=True)

        if not self._path.exists():
            self._path.write_text("[]", encoding="utf-8")

    def _load_all(self) -> list[dict]:
        try:
            raw = self._path.read_text(encoding="utf-8")
            data = json.loads(raw) if raw.strip() else []
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def _save_all(self, users: list[dict]) -> None:
        tmp = json.dumps(users, ensure_ascii=False, indent=2)
        self._path.write_text(tmp, encoding="utf-8")

    def find_one(self, query: dict):
        # Support: {"email": "..."}
        email = query.get("email")
        if not email:
            return None

        with self._lock:
            users = self._load_all()
            for u in users:
                if u.get("email") == email:
                    return u
        return None

    def insert_one(self, doc: dict) -> None:
        with self._lock:
            users = self._load_all()
            users.append(doc)
            self._save_all(users)


def _get_users_collection():
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        # No Mongo URL configured; use local fallback.
        return LocalUsersCollection(
            json_path=os.path.join(os.path.dirname(__file__), "local_users.json")
        )

    try:
        # Fail fast if SSL/network is broken.
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")

        db = client["datapilot"]
        return db["users"]
    except Exception:
        # Any connection/SSL error -> fallback to local store.
        return LocalUsersCollection(
            json_path=os.path.join(os.path.dirname(__file__), "local_users.json")
        )


users_collection = _get_users_collection()