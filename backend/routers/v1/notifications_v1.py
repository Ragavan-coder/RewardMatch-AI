from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Alerts & Notifications"])


class UpdatePreferencesRequest(BaseModel):
    email_alerts_enabled: Optional[bool] = None
    in_app_alerts_enabled: Optional[bool] = None
    min_price_drop_percent: Optional[int] = None
    weekly_report_day: Optional[str] = None


@router.get("")
def get_notifications(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Returns in-app alerts and notifications for the user."""
    alerts = NotificationService.get_user_notifications(db, user_id)
    return [
        {
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "alert_type": a.alert_type,
            "is_read": a.is_read,
            "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }
        for a in alerts
    ]


@router.post("/read-all")
def mark_notifications_read(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Marks all user notifications as read."""
    NotificationService.mark_all_read(db, user_id)
    return {"success": True, "message": "All notifications marked as read."}


@router.get("/preferences")
def get_preferences(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Returns the user's notification preferences."""
    pref = NotificationService.get_preferences(db, user_id)
    return {
        "email_alerts_enabled": pref.email_alerts_enabled,
        "in_app_alerts_enabled": pref.in_app_alerts_enabled,
        "min_price_drop_percent": pref.min_price_drop_percent,
        "preferred_alert_categories": pref.preferred_alert_categories,
        "weekly_report_day": pref.weekly_report_day,
        "quiet_hours_start": pref.quiet_hours_start,
        "quiet_hours_end": pref.quiet_hours_end,
    }


@router.patch("/preferences")
def update_preferences(
    payload: UpdatePreferencesRequest,
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Updates the user's alert delivery settings."""
    pref = NotificationService.update_preferences(
        db,
        user_id,
        email_alerts=payload.email_alerts_enabled,
        in_app_alerts=payload.in_app_alerts_enabled,
        min_price_drop=payload.min_price_drop_percent,
        weekly_report_day=payload.weekly_report_day,
    )
    return {
        "success": True,
        "email_alerts_enabled": pref.email_alerts_enabled,
        "in_app_alerts_enabled": pref.in_app_alerts_enabled,
        "min_price_drop_percent": pref.min_price_drop_percent,
        "weekly_report_day": pref.weekly_report_day,
    }
