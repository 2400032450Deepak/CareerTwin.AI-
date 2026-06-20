from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.digital_twin import DigitalTwin, TwinSnapshot
from app.schemas import TwinResponse, CategoryScores, ReadinessScores, SkillGap
from app.utils.jwt_handler import get_current_user
from app.services import ai_service
from app.utils.cache import cache
import json

router = APIRouter()

def _build_profile(user: User, resume: Resume) -> dict:
    return {
        "name": user.full_name,
        "target_role": user.target_role or "Software Engineer",
        "experience_years": user.experience_years or 0,
        "github_url": user.github_url,
        "leetcode_username": user.leetcode_username,
        "skills": resume.extracted_skills if resume else [],
        "projects": resume.extracted_projects if resume else [],
        "certifications": resume.extracted_certifications if resume else [],
        "achievements": resume.extracted_achievements if resume else [],
        "education": resume.extracted_education if resume else [],
        "experience": resume.extracted_experience if resume else [],
        "resume_score": resume.resume_score if resume else 0,
        "ats_score": resume.ats_score if resume else 0,
    }

@router.post("/generate", response_model=TwinResponse)
async def generate_twin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    if not resume:
        raise HTTPException(status_code=400, detail="Please upload your resume first to generate your Digital Twin.")

    profile = _build_profile(current_user, resume)
    target_role = current_user.target_role or "Software Engineer"

    # AI analysis
    scores = await ai_service.calculate_employability(profile, target_role)
    gaps = await ai_service.analyze_skill_gap(resume.extracted_skills, target_role)

    # Upsert twin
    twin = db.query(DigitalTwin).filter(DigitalTwin.user_id == current_user.id).first()
    if not twin:
        twin = DigitalTwin(user_id=current_user.id)
        db.add(twin)

    cat = scores.get("category_scores", {})
    read = scores.get("readiness_scores", {})

    twin.employability_score = scores.get("employability_score", 0)
    twin.technical_score = cat.get("technical", 0)
    twin.projects_score = cat.get("projects", 0)
    twin.experience_score = cat.get("experience", 0)
    twin.dsa_score = cat.get("dsa", 0)
    twin.industry_relevance_score = cat.get("industry_relevance", 0)
    twin.communication_score = cat.get("communication", 0)
    twin.resume_quality_score = cat.get("resume_quality", 0)
    twin.backend_readiness = read.get("backend", 0)
    twin.frontend_readiness = read.get("frontend", 0)
    twin.cloud_readiness = read.get("cloud", 0)
    twin.devops_readiness = read.get("devops", 0)
    twin.system_design_readiness = read.get("system_design", 0)
    twin.dsa_readiness = read.get("dsa", 0)
    twin.interview_readiness = read.get("interview", 0)
    twin.detected_skills = resume.extracted_skills
    twin.missing_skills = gaps.get("missing_skills", [])
    twin.strengths = scores.get("strengths", [])
    twin.weaknesses = scores.get("weaknesses", [])
    twin.recommendations = scores.get("recommendations", [])
    twin.score_reasoning = scores.get("score_reasoning", "")
    twin.github_score = scores.get("github_score", 0)
    twin.leetcode_score = scores.get("leetcode_score", 0)

    db.commit()
    db.refresh(twin)

    # Save snapshot
    snapshot = TwinSnapshot(
        twin_id=twin.id,
        employability_score=twin.employability_score,
        category_scores=cat
    )
    db.add(snapshot)
    db.commit()

    cache.delete(f"twin:{current_user.id}")
    return _twin_to_response(twin)

@router.get("/me", response_model=TwinResponse)
def get_my_twin(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cached = cache.get(f"twin:{current_user.id}")
    if cached:
        return cached

    twin = db.query(DigitalTwin).filter(DigitalTwin.user_id == current_user.id).first()
    if not twin:
        raise HTTPException(status_code=404, detail="Digital Twin not generated yet. Please generate it first.")
    return _twin_to_response(twin)

@router.get("/snapshots")
def get_snapshots(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    twin = db.query(DigitalTwin).filter(DigitalTwin.user_id == current_user.id).first()
    if not twin:
        return []
    snapshots = db.query(TwinSnapshot).filter(TwinSnapshot.twin_id == twin.id).order_by(TwinSnapshot.snapshot_date.asc()).all()
    return [{"date": s.snapshot_date, "score": s.employability_score, "categories": s.category_scores} for s in snapshots]

def _twin_to_response(twin: DigitalTwin) -> dict:
    missing = twin.missing_skills or []
    parsed_missing = []
    for s in missing:
        if isinstance(s, dict):
            parsed_missing.append(SkillGap(
                name=s.get("name", ""),
                importance=s.get("importance", "medium"),
                employability_boost=s.get("employability_boost", 0),
                resources=s.get("resources", []),
                estimated_weeks=s.get("estimated_weeks", 4),
            ))
    return TwinResponse(
        id=twin.id,
        employability_score=twin.employability_score,
        category_scores=CategoryScores(
            technical=twin.technical_score,
            projects=twin.projects_score,
            experience=twin.experience_score,
            dsa=twin.dsa_score,
            industry_relevance=twin.industry_relevance_score,
            communication=twin.communication_score,
            resume_quality=twin.resume_quality_score,
        ),
        readiness_scores=ReadinessScores(
            backend=twin.backend_readiness,
            frontend=twin.frontend_readiness,
            cloud=twin.cloud_readiness,
            devops=twin.devops_readiness,
            system_design=twin.system_design_readiness,
            dsa=twin.dsa_readiness,
            interview=twin.interview_readiness,
        ),
        detected_skills=twin.detected_skills or [],
        missing_skills=parsed_missing,
        strengths=twin.strengths or [],
        weaknesses=twin.weaknesses or [],
        recommendations=twin.recommendations or [],
        score_reasoning=twin.score_reasoning,
        github_score=twin.github_score,
        leetcode_score=twin.leetcode_score,
        last_updated=twin.last_updated,
    )
