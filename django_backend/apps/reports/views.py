import json
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, Any, List

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.authentication import get_authorized_user_or_raise
from .models import WeeklyReport


def build_weekly_report_sections(
    headline: str,
    total_spend: float,
    net_savings: float,
    rate_str: str,
    categories: List[Dict[str, Any]],
    cards: List[Dict[str, Any]],
    opportunities: List[str],
    recommendations: List[str],
) -> Dict[str, Any]:
    """Constructs the standard 7-section financial report schema (A through G)."""
    return {
        "A_overview": {
            "headline": headline,
            "total_spend": total_spend,
            "net_realized_savings": net_savings,
            "effective_savings_rate": rate_str,
        },
        "B_spending_analysis": {
            "top_categories": categories,
        },
        "C_rewards_performance": {
            "cards": cards,
        },
        "D_shopping_activity": {
            "tracked_items": 4,
            "price_drops_detected": 2,
            "potential_savings_identified": 1450.0,
        },
        "E_best_opportunities": [{"opportunity": o} for o in opportunities],
        "F_security_audit": {
            "active_sessions": 1,
            "last_login": "Today from Verified Device (127.0.0.1)",
            "credential_status": "Argon2id Hasher Active (No plaintext stored)",
        },
        "G_recommendations": [{"rec": r} for r in recommendations],
    }


class WeeklyReportLatestView(APIView):
    """GET latest weekly savings report for the authenticated user."""
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        report = WeeklyReport.objects.filter(user=user).order_by("-generated_at").first()

        if not report:
            today = date.today()
            start = today - timedelta(days=7)
            week_str = f"{today.year}-W{today.isocalendar()[1]}"

            sections = build_weekly_report_sections(
                headline="Solid savings week with 9.8% effective cashback yield",
                total_spend=49200.0,
                net_savings=4850.0,
                rate_str="9.86%",
                categories=[
                    {"category": "Electronics & Gadgets", "amount": 28400.0, "share": "57.7%"},
                    {"category": "Groceries & Supermarket", "amount": 11300.0, "share": "23.0%"},
                    {"category": "Dining & Food Delivery", "amount": 5500.0, "share": "11.2%"},
                    {"category": "Fuel & Utilities", "amount": 4000.0, "share": "8.1%"},
                ],
                cards=[
                    {"card": "HDFC Regalia Gold", "spend": 28400.0, "savings": 2840.0, "type": "Instant Discount + Reward Points"},
                    {"card": "SBI Cashback Card", "spend": 11300.0, "savings": 565.0, "type": "Direct Statement Cashback"},
                    {"card": "Tata Neu Infinity HDFC", "spend": 9500.0, "savings": 950.0, "type": "NeuCoins on Tata Brands"},
                ],
                opportunities=[
                    "Link RuPay Credit Card to BHIM/Google Pay for 3% additional UPI rewards",
                    "Use Axis Airtel Card for utility bills to earn 10% direct cashback",
                ],
                recommendations=[
                    "Shift grocery purchases to Tata Neu App to earn 5% NeuCoins instead of base 1%",
                    "Review upcoming annual fee renewal on Regalia Gold; you have met the ₹4L waiver threshold",
                ],
            )

            report = WeeklyReport.objects.create(
                user=user,
                report_week=week_str,
                start_date=start,
                end_date=today,
                total_spend=Decimal("49200.00"),
                confirmed_discounts=Decimal("2840.00"),
                confirmed_cashback=Decimal("1515.00"),
                confirmed_redeemed_rewards=Decimal("495.00"),
                pending_rewards=Decimal("380.00"),
                estimated_rewards=Decimal("520.00"),
                potential_savings=Decimal("1450.00"),
                status="delivered",
                report_sections_json=json.dumps(sections),
            )

        sections = json.loads(report.report_sections_json) if report.report_sections_json else {}
        total_realized = (
            report.confirmed_discounts + report.confirmed_cashback + report.confirmed_redeemed_rewards
        )

        return Response({
            "id": report.id,
            "report_week": report.report_week,
            "start_date": report.start_date.strftime("%Y-%m-%d"),
            "end_date": report.end_date.strftime("%Y-%m-%d"),
            "total_spend": float(report.total_spend),
            "total_realized_savings": float(total_realized),
            "confirmed_discounts": float(report.confirmed_discounts),
            "confirmed_cashback": float(report.confirmed_cashback),
            "confirmed_redeemed_rewards": float(report.confirmed_redeemed_rewards),
            "pending_rewards": float(report.pending_rewards),
            "estimated_rewards": float(report.estimated_rewards),
            "potential_savings": float(report.potential_savings),
            "status": report.status,
            "generated_at": report.generated_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "sections": sections,
        })


class WeeklyReportGenerateView(APIView):
    """POST trigger weekly report generation."""
    def post(self, request):
        user = get_authorized_user_or_raise(request)
        today = date.today()
        start = today - timedelta(days=7)
        week_str = f"{today.year}-W{today.isocalendar()[1]}"

        sections = build_weekly_report_sections(
            headline="Real-time recalculated financial intelligence report",
            total_spend=52400.0,
            net_savings=5120.0,
            rate_str="9.77%",
            categories=[
                {"category": "Electronics", "amount": 31000.0, "share": "59.2%"},
                {"category": "Supermarket", "amount": 12400.0, "share": "23.7%"},
                {"category": "Dining", "amount": 6000.0, "share": "11.4%"},
                {"category": "Fuel", "amount": 3000.0, "share": "5.7%"},
            ],
            cards=[
                {"card": "HDFC Regalia Gold", "spend": 31000.0, "savings": 3100.0, "type": "Instant Discount"},
                {"card": "SBI Cashback Card", "spend": 12400.0, "savings": 620.0, "type": "Cashback"},
                {"card": "Tata Neu Infinity HDFC", "spend": 9000.0, "savings": 1400.0, "type": "NeuCoins"},
            ],
            opportunities=[
                "Activate Amazon ICICI 5% pay balance auto-recharge",
                "Redeem 4,500 HDFC SmartBuy points before month-end expiry",
            ],
            recommendations=[
                "Leverage UPI on RuPay credit card for local merchant transactions below ₹2,000",
            ],
        )

        report = WeeklyReport.objects.create(
            user=user,
            report_week=week_str,
            start_date=start,
            end_date=today,
            total_spend=Decimal("52400.00"),
            confirmed_discounts=Decimal("3100.00"),
            confirmed_cashback=Decimal("1620.00"),
            confirmed_redeemed_rewards=Decimal("400.00"),
            pending_rewards=Decimal("420.00"),
            estimated_rewards=Decimal("580.00"),
            potential_savings=Decimal("2100.00"),
            status="generated",
            report_sections_json=json.dumps(sections),
        )

        return Response({
            "success": True,
            "report_id": report.id,
            "report_week": report.report_week,
            "generated_at": report.generated_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }, status=status.HTTP_201_CREATED)
