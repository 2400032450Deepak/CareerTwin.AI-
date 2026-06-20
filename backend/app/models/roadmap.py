from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class RoadmapType(str, enum.Enum):
    THIRTY_DAY = "30_day"
    SIXTY_DAY = "60_day"
    NINETY_DAY = "90_day"

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(100))
    plan_type = Column(String(20))  # 30_day, 60_day, 90_day
    tasks = Column(JSON, default=list)
    total_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    progress_percent = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roadmaps")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255))
    interview_date = Column(DateTime(timezone=True))
    outcome = Column(String(50))  # cleared, rejected, pending, no_show
    rounds = Column(JSON, default=list)  # [{type, questions, feedback}]
    overall_feedback = Column(Text)
    technical_rating = Column(Float)
    communication_rating = Column(Float)
    behavioral_rating = Column(Float)
    ai_analysis = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interviews")
