from django.urls import path
from .views import ActivityTimelineView

urlpatterns = [
    path("v1/activity", ActivityTimelineView.as_view(), name="activity-timeline"),
]
