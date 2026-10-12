from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from database import Base


class WeeklyReport(Base):
    """
    Structured Weekly Savings Report generated for users according to their schedule.
    Contains 7 structured sections:
    A. Weekly Overview
    B. Spending Analysis
    C. Rewards Performance
    D. Shopping Activity
    E. Best Opportunities
    F. Security and Account Activity
    G. Recommendations for Next Week
    """
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_week = Column(String(50), nullable=False, index=True)  # e.g., 2026-W41
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Financial summary using Decimal (Numeric)
    total_spend = Column(Numeric(12, 2), default=0.00)
    confirmed_discounts = Column(Numeric(12, 2), default=0.00)
    confirmed_cashback = Column(Numeric(12, 2), default=0.00)
    confirmed_redeemed_rewards = Column(Numeric(12, 2), default=0.00)
    pending_rewards = Column(Numeric(12, 2), default=0.00)
    estimated_rewards = Column(Numeric(12, 2), default=0.00)
    potential_savings = Column(Numeric(12, 2), default=0.00)  # Strictly separated!

    # Full structured report data
    report_sections_json = Column(Text, nullable=False)
    status = Column(String(50), default="generated")  # generated, emailed, viewed
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="weekly_reports")


class ScheduledJobRun(Base):
    """
    Tracks background scheduler execution history for offer crawlers,
    weekly reports, and alert processing.
    """
    __tablename__ = "scheduled_job_runs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(100), nullable=False, index=True)
    job_name = Column(String(100), nullable=False)
    status = Column(String(50), default="running")  # success, failed, running
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    items_processed = Column(Integer, default=0)
    details = Column(Text, nullable=True)
