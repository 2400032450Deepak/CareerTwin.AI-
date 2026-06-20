from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router
from app.routers.twin import router as twin_router
from app.routers.debug import router as debug_router
from app.routers import (
    skills_router, roadmap_router,
    simulation_router, company_router, interview_router,
)
import app.models  # noqa — registers all models
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered employability intelligence platform for Indian tech placements.",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # tighten to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing logger
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = round((time.time() - start) * 1000)
    logger.info("%s %s → %s (%dms)", request.method, request.url.path, response.status_code, ms)
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"]        = "DENY"
    response.headers["X-XSS-Protection"]       = "1; mode=block"
    return response

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth_router,       prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(resume_router,     prefix="/api/v1/resume",     tags=["Resume"])
app.include_router(twin_router,       prefix="/api/v1/twin",       tags=["Digital Twin"])
app.include_router(skills_router,     prefix="/api/v1/skills",     tags=["Skills"])
app.include_router(roadmap_router,    prefix="/api/v1/roadmap",    tags=["Roadmap"])
app.include_router(simulation_router, prefix="/api/v1/simulation", tags=["Simulation"])
app.include_router(company_router,    prefix="/api/v1/company",    tags=["Company"])
app.include_router(interview_router,  prefix="/api/v1/interview",  tags=["Interview"])
app.include_router(debug_router,      prefix="/api/v1/debug",      tags=["Debug"])

@app.get("/", tags=["Health"])
def root():
    return {"platform": settings.APP_NAME, "version": settings.APP_VERSION, "status": "online"}

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy"}
