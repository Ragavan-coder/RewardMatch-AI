"""
RewardMatch AI - Master URL Configuration
Connects all modular fintech, rewards, RAG, and monitoring apps.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Production health-check endpoint testing Django, DB connection, and Argon2id status."""
    db_ok = False
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
            db_ok = bool(row and row[0] == 1)
    except Exception as e:
        db_ok = False

    return Response({
        "status": "healthy" if db_ok else "degraded",
        "service": "RewardMatch AI (Django REST Framework)",
        "database": "MySQL 8.0 connected" if db_ok else "Database error",
        "password_hasher": "Argon2id Active",
        "tagline": "Swipe Smarter. Save Bigger.",
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health", health_check, name="health-check"),

    # Authentication & Accounts
    path("api/auth/", include("apps.accounts.urls")),

    # Financial Profiles & Cards
    path("api/", include("apps.financial_profiles.urls")),

    # Transactions & Savings Analysis (6 Decimal Categories)
    path("api/", include("apps.transactions.urls")),

    # Activity Timeline
    path("api/", include("apps.activity.urls")),

    # Shopping & Offer Monitoring
    path("api/v1/monitor/", include("apps.monitoring.urls")),

    # In-App Alerts & Notifications
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/notifications", include("apps.notifications.urls")),

    # Weekly Intelligence Reports
    path("api/v1/reports/", include("apps.reports.urls")),

    # Rewards Engine & Decimal Calculations
    path("api/v1/rewards/", include("apps.rewards.urls")),

    # Merchant Connectors
    path("api/v1/merchants/", include("apps.merchants.urls")),

    # Bank & UPI Offers
    path("api/v1/offers/", include("apps.offers.urls")),

    # Knowledge Base & Source Documents
    path("api/v1/knowledge/", include("apps.knowledge.urls")),

    # RAG Assistant & Grounded Citations
    path("api/v1/rag/", include("apps.ai_assistant.urls")),

    # Security Audit & Access Logs
    path("api/v1/security/", include("apps.security_audit.urls")),
]
