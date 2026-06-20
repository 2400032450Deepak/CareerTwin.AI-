from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    # Profile
    target_role = Column(String(100))
    github_url = Column(String(500))
    linkedin_url = Column(String(500))
    leetcode_username = Column(String(100))
    college = Column(String(255))
    graduation_year = Column(Integer)
    experience_years = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    digital_twin = relationship("DigitalTwin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("SimulationHistory", back_populates="user", cascade="all, delete-orphan")
