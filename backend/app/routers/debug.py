from fastapi import APIRouter, HTTPException
from app.config import settings
from app.services.ai_service import test_gemini_connection, _get_client

router = APIRouter()


@router.get("/env")
def check_env():
    key = settings.GEMINI_API_KEY or ""
    key_ok = key.startswith("AIza") and len(key) > 20
    return {
        "GEMINI_API_KEY": f"SET ✅ (starts with {key[:8]}...)" if key_ok else f"WRONG FORMAT ❌ — key is '{key[:10]}...' but should start with 'AIza'. Get a new key at https://aistudio.google.com/app/apikey",
        "SECRET_KEY": "SET ✅" if settings.SECRET_KEY not in ("", "your-super-secret-key-change-this-in-production") else "MISSING ❌",
        "DATABASE_URL": settings.DATABASE_URL.split("@")[-1] if settings.DATABASE_URL else "MISSING ❌",
    }


@router.get("/models")
def list_models():
    """Lists all Gemini models available for your API key."""
    try:
        client = _get_client()
        models = list(client.models.list())
        names = sorted([m.name for m in models if "generateContent" in (m.supported_actions or [])])
        return {"available_models": names, "recommended": "gemini-2.5-flash"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test-ai")
def test_ai():
    """Sends a tiny prompt to Gemini. If this returns OK, resume upload will work."""
    try:
        result = test_gemini_connection()
        return {"gemini": "OK ✅", "model": "gemini-2.5-flash", "response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
