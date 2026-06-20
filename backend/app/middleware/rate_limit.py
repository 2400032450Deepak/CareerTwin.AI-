"""
Simple in-memory rate limiter for AI endpoints.
Limits each user to N AI calls per window to control Gemini API costs.
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from app.utils.jwt_handler import verify_token


class RateLimiter:
    def __init__(self, calls: int = 10, window_seconds: int = 60):
        self.calls   = calls
        self.window  = window_seconds
        self._store: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window
        # Keep only timestamps within current window
        self._store[key] = [t for t in self._store[key] if t > window_start]
        if len(self._store[key]) >= self.calls:
            return False
        self._store[key].append(now)
        return True

    def remaining(self, key: str) -> int:
        now = time.time()
        window_start = now - self.window
        recent = [t for t in self._store[key] if t > window_start]
        return max(0, self.calls - len(recent))


# Separate limiters for different endpoint groups
ai_limiter      = RateLimiter(calls=20, window_seconds=60)   # 20 AI calls/min per user
upload_limiter  = RateLimiter(calls=5,  window_seconds=60)   # 5 uploads/min per user
twin_limiter    = RateLimiter(calls=3,  window_seconds=300)  # 3 twin generations per 5 min


def get_user_id_from_request(request: Request) -> str:
    """Extract user ID from JWT — fallback to IP if no auth."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        uid = verify_token(auth[7:])
        if uid:
            return f"user:{uid}"
    return f"ip:{request.client.host}"


def ai_rate_limit(request: Request):
    """Dependency — use on AI-heavy endpoints."""
    key = get_user_id_from_request(request)
    if not ai_limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many AI requests. Limit: {ai_limiter.calls}/min. Please wait and try again.",
            headers={"Retry-After": str(ai_limiter.window)},
        )


def upload_rate_limit(request: Request):
    """Dependency — use on resume upload endpoint."""
    key = get_user_id_from_request(request)
    if not upload_limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many uploads. Limit: {upload_limiter.calls}/min.",
            headers={"Retry-After": str(upload_limiter.window)},
        )


def twin_rate_limit(request: Request):
    """Dependency — use on Digital Twin generation endpoint."""
    key = get_user_id_from_request(request)
    if not twin_limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Twin regeneration limited to {twin_limiter.calls} times per 5 minutes.",
            headers={"Retry-After": str(twin_limiter.window)},
        )
