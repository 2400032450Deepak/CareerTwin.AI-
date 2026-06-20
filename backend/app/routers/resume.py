from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas import ResumeAnalysisResponse
from app.utils.jwt_handler import get_current_user
from app.utils.pdf_parser import extract_text_from_pdf, clean_resume_text
from app.services import ai_service
from app.middleware.rate_limit import upload_rate_limit, ai_rate_limit
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=ResumeAnalysisResponse, status_code=201,
             dependencies=[Depends(upload_rate_limit)])
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5 MB.")

    try:
        raw_text = extract_text_from_pdf(file_bytes)
        cleaned  = clean_resume_text(raw_text)
    except Exception as e:
        logger.error("PDF parse error: %s", e)
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {e}")

    if not cleaned or len(cleaned) < 50:
        raise HTTPException(status_code=422,
            detail="PDF appears empty or image-only. Please use a text-based PDF.")

    target_role = current_user.target_role or "Software Engineer"
    try:
        analysis = await ai_service.analyze_resume(cleaned, target_role)
    except Exception as e:
        logger.error("AI analysis error: %s", e)
        err_str = str(e)
        if any(code in err_str for code in ["503", "UNAVAILABLE", "overloaded", "RESOURCE_EXHAUSTED", "429"]):
            raise HTTPException(
                status_code=503,
                detail="Google's AI service is temporarily busy. Please try uploading again in a moment — your resume was not lost, just click upload again."
            )
        raise HTTPException(status_code=502,
            detail=f"AI analysis failed: {e}. Check your GEMINI_API_KEY.")

    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_active": False})

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=cleaned,
        is_active=True,
        extracted_skills=analysis.get("extracted_skills", []),
        extracted_projects=analysis.get("extracted_projects", []),
        extracted_education=analysis.get("extracted_education", []),
        extracted_experience=analysis.get("extracted_experience", []),
        extracted_certifications=analysis.get("extracted_certifications", []),
        extracted_achievements=analysis.get("extracted_achievements", []),
        resume_score=float(analysis.get("resume_score", 0)),
        ats_score=float(analysis.get("ats_score", 0)),
        missing_keywords=analysis.get("missing_keywords", []),
        weak_bullets=analysis.get("weak_bullets", []),
        improvements=analysis.get("improvements", []),
        project_strength_analysis=analysis.get("project_strength_analysis", {}),
        ai_summary=analysis.get("ai_summary", ""),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/active", response_model=ResumeAnalysisResponse)
def get_active_resume(db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(
        Resume.user_id == current_user.id, Resume.is_active == True
    ).first()
    if not resume:
        raise HTTPException(status_code=404,
            detail="No active resume. Upload your resume first.")
    return resume


@router.get("/history", response_model=List[ResumeAnalysisResponse])
def get_history(db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return (db.query(Resume)
              .filter(Resume.user_id == current_user.id)
              .order_by(Resume.created_at.desc())
              .all())
