from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.digital_twin import DigitalTwin, SimulationHistory
from app.models.roadmap import Roadmap, Interview
from app.schemas import (
    SkillGapRequest, SkillGapResponse, SkillGap,
    SimulationRequest, SimulationResponse,
    RoadmapResponse, RoadmapTask,
    CompanyMatchRequest, CompanyMatchResponse,
    InterviewCreate, InterviewResponse,
)
from app.utils.jwt_handler import get_current_user
from app.services import ai_service
from typing import List
from datetime import datetime

# ── Skills Router ─────────────────────────────────────────────────────────────
skills_router = APIRouter()

@skills_router.post("/gaps", response_model=SkillGapResponse)
async def get_skill_gaps(
    payload: SkillGapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    current_skills = resume.extracted_skills if resume else []

    result = await ai_service.analyze_skill_gap(current_skills, payload.target_role)
    missing = [
        SkillGap(
            name=s["name"],
            importance=s.get("importance", "medium"),
            employability_boost=s.get("employability_boost", 0),
            resources=s.get("resources", []),
            estimated_weeks=s.get("estimated_weeks", 4),
        ) for s in result.get("missing_skills", [])
    ]
    return SkillGapResponse(
        target_role=payload.target_role,
        confidence_score=result.get("confidence_score", 80),
        overall_gap_percentage=result.get("overall_gap_percentage", 50),
        missing_skills=missing,
        recommended_order=result.get("recommended_order", []),
    )

# ── Roadmap Router ────────────────────────────────────────────────────────────
roadmap_router = APIRouter()

@roadmap_router.post("/generate/{plan_type}", response_model=RoadmapResponse, status_code=201)
async def generate_roadmap(
    plan_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if plan_type not in ["30_day", "60_day", "90_day"]:
        raise HTTPException(status_code=400, detail="plan_type must be 30_day, 60_day, or 90_day")

    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    skills = resume.extracted_skills if resume else []

    twin = db.query(DigitalTwin).filter(DigitalTwin.user_id == current_user.id).first()
    missing = twin.missing_skills if twin else []

    target_role = current_user.target_role or "Software Engineer"
    result = await ai_service.generate_roadmap(skills, missing, target_role, plan_type)

    tasks_raw = result.get("tasks", [])
    roadmap = Roadmap(
        user_id=current_user.id,
        target_role=target_role,
        plan_type=plan_type,
        tasks=tasks_raw,
        total_tasks=len(tasks_raw),
        completed_tasks=0,
        progress_percent=0.0,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    parsed_tasks = [RoadmapTask(**t) for t in tasks_raw if all(k in t for k in ["week","day_range","type","title","description","priority","impact","estimated_hours"])]
    return RoadmapResponse(
        id=roadmap.id,
        target_role=roadmap.target_role,
        plan_type=roadmap.plan_type,
        tasks=parsed_tasks,
        total_tasks=roadmap.total_tasks,
        created_at=roadmap.created_at,
    )

@roadmap_router.get("/history")
def get_roadmap_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.created_at.desc()).all()

# ── Simulation Router ─────────────────────────────────────────────────────────
simulation_router = APIRouter()

@simulation_router.post("/run", response_model=SimulationResponse)
async def run_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    skills = resume.extracted_skills if resume else []
    twin = db.query(DigitalTwin).filter(DigitalTwin.user_id == current_user.id).first()
    current_score = twin.employability_score if twin else 50.0
    target_role = current_user.target_role or "Software Engineer"

    result = await ai_service.simulate_career(skills, current_score, target_role, payload.scenario)

    history = SimulationHistory(
        user_id=current_user.id,
        scenario=payload.scenario,
        current_score=current_score,
        projected_score=result.get("projected_score", current_score),
        improvement=result.get("improvement", 0),
        timeline_weeks=result.get("timeline_weeks", 4),
        reasoning=result.get("reasoning", ""),
        scenario_details=result,
    )
    db.add(history)
    db.commit()

    return SimulationResponse(
        scenario=payload.scenario,
        current_score=current_score,
        projected_score=result.get("projected_score", current_score),
        improvement=result.get("improvement", 0),
        timeline_weeks=result.get("timeline_weeks", 4),
        reasoning=result.get("reasoning", ""),
        key_actions=result.get("key_actions", []),
        milestones=result.get("milestones", []),
    )

@simulation_router.get("/history")
def simulation_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SimulationHistory).filter(SimulationHistory.user_id == current_user.id).order_by(SimulationHistory.created_at.desc()).limit(20).all()

# ── Company Router ─────────────────────────────────────────────────────────────
company_router = APIRouter()

@company_router.post("/match", response_model=CompanyMatchResponse)
async def match_company(
    payload: CompanyMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_active == True).first()
    skills = resume.extracted_skills if resume else []
    projects = resume.extracted_projects if resume else []

    result = await ai_service.match_company(
        skills, projects,
        current_user.experience_years or 0,
        current_user.target_role or "Software Engineer",
        payload.company_name
    )
    return CompanyMatchResponse(
        company=payload.company_name,
        compatibility_score=result.get("compatibility_score", 0),
        matching_skills=result.get("matching_skills", []),
        missing_skills=result.get("missing_skills", []),
        weak_areas=result.get("weak_areas", []),
        suggestions=result.get("suggestions", []),
        reasoning=result.get("reasoning", ""),
        interview_tips=result.get("interview_tips", []),
    )

# ── Interview Router ──────────────────────────────────────────────────────────
interview_router = APIRouter()

@interview_router.post("/log", status_code=201, response_model=InterviewResponse)
def log_interview(payload: InterviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview = Interview(
        user_id=current_user.id,
        company=payload.company,
        role=payload.role,
        outcome=payload.outcome,
        rounds=[r.model_dump() for r in payload.rounds],
        overall_feedback=payload.overall_feedback,
        technical_rating=payload.technical_rating,
        communication_rating=payload.communication_rating,
        behavioral_rating=payload.behavioral_rating,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview

@interview_router.get("/history", response_model=List[InterviewResponse])
def get_interview_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
