from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500))
    raw_text = Column(Text)
    is_active = Column(Boolean, default=True)

    # Extracted data
    extracted_skills = Column(JSON, default=list)
    extracted_projects = Column(JSON, default=list)
    extracted_education = Column(JSON, default=list)
    extracted_experience = Column(JSON, default=list)
    extracted_certifications = Column(JSON, default=list)
    extracted_achievements = Column(JSON, default=list)

    # Scores
    resume_score = Column(Float, default=0.0)
    ats_score = Column(Float, default=0.0)

    # AI Analysis
    missing_keywords = Column(JSON, default=list)
    weak_bullets = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    project_strength_analysis = Column(JSON, default=dict)
    ai_summary = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="resumes")
