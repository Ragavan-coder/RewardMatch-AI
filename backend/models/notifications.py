from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Notification(Base):
    """
    Stores in-app notifications and email alert records.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False, index=True)
    related_entity_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    is_emailed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="notifications")


class NotificationPreference(Base):
    """
    User-configurable delivery settings, price-drop thresholds, and quiet hours.
    """
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    email_alerts_enabled = Column(Boolean, default=True)
    in_app_alerts_enabled = Column(Boolean, default=True)
    min_price_drop_percent = Column(Integer, default=5)
    preferred_alert_categories = Column(String(255), default="Electronics, Fashion, Flights, Dining")
    weekly_report_day = Column(String(20), default="Sunday")
    quiet_hours_start = Column(String(10), default="22:00")
    quiet_hours_end = Column(String(10), default="08:00")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="notification_preference")
