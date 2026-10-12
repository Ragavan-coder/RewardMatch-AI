import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.report_service import WeeklyReportService

router = APIRouter(prefix="/reports", tags=["Weekly Reports"])


@router.get("/weekly")
def get_latest_weekly_report(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """
    Returns the user's latest Weekly Savings Report containing all 7 structured sections:
    A. Overview
    B. Spending Analysis
    C. Rewards Performance
    D. Shopping Activity
    E. Best Opportunities
    F. Security & Account Activity
    G. Recommendations for Next Week
    """
    report = WeeklyReportService.get_latest_report(db, user_id)
    sections = json.loads(report.report_sections_json) if report.report_sections_json else {}
    return {
        "id": report.id,
        "report_week": report.report_week,
        "start_date": report.start_date.strftime("%Y-%m-%d"),
        "end_date": report.end_date.strftime("%Y-%m-%d"),
        "total_spend": float(report.total_spend),
        "total_realized_savings": float(
            report.confirmed_discounts + report.confirmed_cashback + report.confirmed_redeemed_rewards
        ),
        "confirmed_discounts": float(report.confirmed_discounts),
        "confirmed_cashback": float(report.confirmed_cashback),
        "confirmed_redeemed_rewards": float(report.confirmed_redeemed_rewards),
        "pending_rewards": float(report.pending_rewards),
        "estimated_rewards": float(report.estimated_rewards),
        "potential_savings": float(report.potential_savings),
        "status": report.status,
        "generated_at": report.generated_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sections": sections,
    }


@router.post("/weekly/generate")
def generate_weekly_report(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Triggers on-demand weekly report generation for the user."""
    report = WeeklyReportService.generate_report_for_user(db, user_id)
    return {
        "success": True,
        "report_id": report.id,
        "report_week": report.report_week,
        "generated_at": report.generated_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
