from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from models.notifications import Notification, NotificationPreference
from services.activity_service import ActivityService


class NotificationService:
    """Manages multi-channel user alerts, preferences, and delivery logs."""

    @staticmethod
    def get_user_notifications(db: Session, user_id: int) -> List[Notification]:
        """Returns in-app notifications for the user."""
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
        if not notifications:
            # Seed starter notifications
            starter_alerts = [
                (
                    "🎉 Welcome to RewardMatch AI!",
                    "Your financial profile and cards are securely linked. Explore verified card multipliers & RuPay on UPI benefits.",
                    "offer_discovered",
                ),
                (
                    "⚡ Price Drop on Sony WH-1000XM5",
                    "Price dropped to ₹26,990 on Amazon India. Save an extra ₹2,500 using your HDFC Regalia Gold card.",
                    "price_drop",
                ),
                (
                    "📅 Weekly Savings Report Ready",
                    "Your weekly rewards digest has been generated with ₹5,525 in confirmed realized savings.",
                    "report_ready",
                ),
            ]
            for title, msg, alert_type in starter_alerts:
                n = Notification(
                    user_id=user_id,
                    title=title,
                    message=msg,
                    alert_type=alert_type,
                    is_read=False,
                    is_emailed=True,
                    created_at=datetime.utcnow(),
                )
                db.add(n)
            db.commit()
            notifications = (
                db.query(Notification)
                .filter(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
                .all()
            )
        return notifications

    @staticmethod
    def get_preferences(db: Session, user_id: int) -> NotificationPreference:
        """Fetches or creates default notification preferences."""
        pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
        if not pref:
            pref = NotificationPreference(
                user_id=user_id,
                email_alerts_enabled=True,
                in_app_alerts_enabled=True,
                min_price_drop_percent=5,
                preferred_alert_categories="Electronics, Fashion, Flights, Dining",
                weekly_report_day="Sunday",
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    @staticmethod
    def update_preferences(
        db: Session,
        user_id: int,
        email_alerts: Optional[bool] = None,
        in_app_alerts: Optional[bool] = None,
        min_price_drop: Optional[int] = None,
        weekly_report_day: Optional[str] = None,
    ) -> NotificationPreference:
        """Updates user alert preferences and writes an audit event."""
        pref = NotificationService.get_preferences(db, user_id)
        if email_alerts is not None:
            pref.email_alerts_enabled = email_alerts
        if in_app_alerts is not None:
            pref.in_app_alerts_enabled = in_app_alerts
        if min_price_drop is not None:
            pref.min_price_drop_percent = min_price_drop
        if weekly_report_day is not None:
            pref.weekly_report_day = weekly_report_day

        db.commit()
        db.refresh(pref)

        ActivityService.record_event(
            db,
            user_id=user_id,
            category="alert",
            event_type="user_settings_changed",
            description="Updated notification and alert delivery preferences",
            status="confirmed",
            source="manual",
        )
        return pref

    @staticmethod
    def mark_all_read(db: Session, user_id: int):
        """Marks all notifications as read."""
        db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": True})
        db.commit()
