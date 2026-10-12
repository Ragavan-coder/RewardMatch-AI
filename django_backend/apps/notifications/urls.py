from django.urls import path
from .views import NotificationListView, MarkNotificationsReadView, NotificationPreferencesView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("read-all", MarkNotificationsReadView.as_view(), name="notifications-read-all"),
    path("preferences", NotificationPreferencesView.as_view(), name="notifications-preferences"),
]
