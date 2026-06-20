import json
import redis
from typing import Any, Optional
from app.config import settings

class CacheService:
    def __init__(self):
        try:
            self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception:
            self._client = None

    def get(self, key: str) -> Optional[Any]:
        if not self._client:
            return None
        try:
            val = self._client.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        if not self._client:
            return False
        try:
            self._client.setex(key, ttl, json.dumps(value))
            return True
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        if not self._client:
            return False
        try:
            self._client.delete(key)
            return True
        except Exception:
            return False

    def invalidate_user_cache(self, user_id: int):
        patterns = [f"twin:{user_id}", f"roadmap:{user_id}:*", f"gaps:{user_id}:*"]
        if not self._client:
            return
        for pattern in patterns:
            keys = self._client.keys(pattern)
            if keys:
                self._client.delete(*keys)

cache = CacheService()
