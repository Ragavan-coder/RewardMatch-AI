from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class ActivityEvent(Base):
    """
    Immutable chronological audit and activity history timeline.
    Records events for user account operations, card additions, transactions,
    verified rewards, shopping alerts, and reports.
    """
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # account, card, bank, transaction, offer, reward, shopping, alert, report
    event_type = Column(String(50), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    display_timezone = Column(String(50), default="Asia/Kolkata")
    related_entity_id = Column(String(50), nullable=True)
    related_entity_type = Column(String(50), nullable=True)
    status = Column(String(30), default="confirmed")  # confirmed, estimated, pending, action_required
    source = Column(String(50), default="system")  # manual, import, bank_sync, engine, system
    meta_data = Column(Text, nullable=True)  # JSON-encoded metadata

    # Relationships
    user = relationship("User", backref="activity_events")
