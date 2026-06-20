from pydantic import BaseModel, field_validator
from typing import Optional, List, Any, Dict, Union
from datetime import datetime

# ── Resume Sub-schemas ───────────────────────────────────────────────────────

class ImprovementItem(BaseModel):
    section: str = ""
    issue: str = ""
    suggestion: str = ""

# ── Resume Schemas ──────────────────────────────────────────────────────────

class ResumeAnalysisResponse(BaseModel):
    id: int
    filename: str
    resume_score: float
    ats_score: float
    extracted_skills: List[str] = []
    extracted_projects: List[Any] = []
    extracted_education: List[Any] = []
    extracted_experience: List[Any] = []
    missing_keywords: List[str] = []
    weak_bullets: List[str] = []
    improvements: List[ImprovementItem] = []   # ← was List[str], now List[ImprovementItem]
    ai_summary: Optional[str] = None
    created_at: datetime

    @field_validator("improvements", mode="before")
    @classmethod
    def coerce_improvements(cls, v):
        """
        Accept both formats Gemini might return:
          - List[dict]:  [{"section": "...", "issue": "...", "suggestion": "..."}]
          - List[str]:   ["suggestion 1", "suggestion 2"]   (fallback)
        """
        if not v:
            return []
        result = []
        for item in v:
            if isinstance(item, dict):
                result.append(ImprovementItem(
                    section=item.get("section", ""),
                    issue=item.get("issue", ""),
                    suggestion=item.get("suggestion", str(item)),
                ))
            else:
                result.append(ImprovementItem(suggestion=str(item)))
        return result

    @field_validator("extracted_skills", "missing_keywords", "weak_bullets", mode="before")
    @classmethod
    def coerce_str_lists(cls, v):
        """Ensure string list fields never contain dicts."""
        if not v:
            return []
        return [str(i) if not isinstance(i, str) else i for i in v]

    class Config:
        from_attributes = True

# ── Digital Twin Schemas ────────────────────────────────────────────────────

class CategoryScores(BaseModel):
    technical: float
    projects: float
    experience: float
    dsa: float
    industry_relevance: float
    communication: float
    resume_quality: float

class ReadinessScores(BaseModel):
    backend: float
    frontend: float
    cloud: float
    devops: float
    system_design: float
    dsa: float
    interview: float

class SkillGap(BaseModel):
    name: str
    importance: str       # critical, high, medium, low
    employability_boost: float
    resources: List[str]
    estimated_weeks: int

class TwinResponse(BaseModel):
    id: int
    employability_score: float
    category_scores: CategoryScores
    readiness_scores: ReadinessScores
    detected_skills: List[str]
    missing_skills: List[SkillGap]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    score_reasoning: Optional[str]
    github_score: float
    leetcode_score: float
    last_updated: datetime

    class Config:
        from_attributes = True

# ── Skill Gap Schemas ───────────────────────────────────────────────────────

class SkillGapRequest(BaseModel):
    target_role: str
    additional_context: Optional[str] = None

class SkillGapResponse(BaseModel):
    target_role: str
    confidence_score: float
    overall_gap_percentage: float
    missing_skills: List[SkillGap]
    recommended_order: List[str]

# ── Simulation Schemas ──────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    scenario: str   # e.g. "What if I learn Docker and complete AWS certification?"

class SimulationResponse(BaseModel):
    scenario: str
    current_score: float
    projected_score: float
    improvement: float
    timeline_weeks: int
    reasoning: str
    key_actions: List[str]
    milestones: List[Dict]

# ── Roadmap Schemas ─────────────────────────────────────────────────────────

class RoadmapTask(BaseModel):
    week: int
    day_range: str
    type: str        # skill, project, dsa, certification, course
    title: str
    description: str
    resource: Optional[str]
    priority: str    # high, medium, low
    impact: str
    estimated_hours: int

class RoadmapResponse(BaseModel):
    id: int
    target_role: str
    plan_type: str
    tasks: List[RoadmapTask]
    total_tasks: int
    created_at: datetime

    class Config:
        from_attributes = True

# ── Company Match Schemas ────────────────────────────────────────────────────

class CompanyMatchRequest(BaseModel):
    company_name: str

class CompanyMatchResponse(BaseModel):
    company: str
    compatibility_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    weak_areas: List[str]
    suggestions: List[str]
    reasoning: str
    interview_tips: List[str]

# ── Interview Schemas ────────────────────────────────────────────────────────

class InterviewRound(BaseModel):
    round_type: str = ""
    questions: List[str] = []
    feedback: Optional[str] = None

class InterviewCreate(BaseModel):
    company: str
    role: Optional[str] = None
    interview_date: Optional[str] = None
    outcome: str
    rounds: List[InterviewRound] = []
    overall_feedback: Optional[str] = None
    technical_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    behavioral_rating: Optional[float] = None

class InterviewResponse(BaseModel):
    id: int
    company: str
    role: Optional[str] = None
    outcome: str
    rounds: List[Any] = []
    overall_feedback: Optional[str] = None
    technical_rating: Optional[float] = None
    communication_rating: Optional[float] = None
    behavioral_rating: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
