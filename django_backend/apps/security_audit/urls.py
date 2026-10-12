from django.urls import path
from .views import SecurityAuditLogView, SecurityOverviewView, AdminSecurityDashboardView

urlpatterns = [
    path("audit-log", SecurityAuditLogView.as_view(), name="security-audit-log"),
    path("overview", SecurityOverviewView.as_view(), name="security-overview"),
    path("dashboard", AdminSecurityDashboardView.as_view(), name="security-dashboard"),
]
