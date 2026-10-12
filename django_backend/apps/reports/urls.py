from django.urls import path
from .views import WeeklyReportLatestView, WeeklyReportGenerateView

urlpatterns = [
    path("weekly", WeeklyReportLatestView.as_view(), name="reports-weekly-latest"),
    path("weekly/generate", WeeklyReportGenerateView.as_view(), name="reports-weekly-generate"),
]
