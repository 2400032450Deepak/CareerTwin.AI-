from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Overall employability
    employability_score = Column(Float, default=0.0)

    # Category Scores
    technical_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    dsa_score = Column(Float, default=0.0)
    industry_relevance_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    resume_quality_score = Column(Float, default=0.0)

    # Readiness Scores
    backend_readiness = Column(Float, default=0.0)
    frontend_readiness = Column(Float, default=0.0)
    cloud_readiness = Column(Float, default=0.0)
    devops_readiness = Column(Float, default=0.0)
    system_design_readiness = Column(Float, default=0.0)
    dsa_readiness = Column(Float, default=0.0)
    interview_readiness = Column(Float, default=0.0)

    # Skill Gap Data
    detected_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)

    # Company Matches
    company_matches = Column(JSON, default=list)

    # AI Analysis
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    score_reasoning = Column(Text)

    # GitHub & LeetCode
    github_score = Column(Float, default=0.0)
    github_stats = Column(JSON, default=dict)
    leetcode_score = Column(Float, default=0.0)
    leetcode_stats = Column(JSON, default=dict)

    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="digital_twin")
    snapshots = relationship("TwinSnapshot", back_populates="twin", cascade="all, delete-orphan")


class TwinSnapshot(Base):
    __tablename__ = "twin_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    twin_id = Column(Integer, ForeignKey("digital_twins.id", ondelete="CASCADE"), nullable=False)
    employability_score = Column(Float)
    category_scores = Column(JSON)
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now())

    twin = relationship("DigitalTwin", back_populates="snapshots")


class SimulationHistory(Base):
    __tablename__ = "simulation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scenario = Column(String(500), nullable=False)
    current_score = Column(Float)
    projected_score = Column(Float)
    improvement = Column(Float)
    timeline_weeks = Column(Integer)
    reasoning = Column(Text)
    scenario_details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="simulations")
