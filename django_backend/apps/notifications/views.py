from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.authentication import get_authorized_user_or_raise
from .models import Notification, NotificationPreference


class NotificationListView(APIView):
    """GET user notifications."""
    def get(self, request):
        user = get_authorized_user_or_raise(request)

        if Notification.objects.filter(user=user).count() == 0:
            Notification.objects.create(
                user=user,
                title="5% Cashback Activated on Amazon",
                message="Your HDFC Regalia Gold qualifies for 5% instant discount during the Great Indian Festival.",
                alert_type="card_offer",
            )
            Notification.objects.create(
                user=user,
                title="Price Drop: Apple MacBook Air M3",
                message="Price dropped by ₹6,000 on Croma. Tata Neu Infinity provides an additional ₹4,500 NeuCoins.",
                alert_type="price_drop",
            )
            Notification.objects.create(
                user=user,
                title="Weekly Savings Report Ready",
                message="Your weekly financial report for this week is ready. You realized ₹4,850 in total savings.",
                alert_type="report",
            )

        alerts = Notification.objects.filter(user=user).order_by("-created_at")
        return Response([
            {
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "alert_type": a.alert_type,
                "is_read": a.is_read,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
            }
            for a in alerts
        ])


class MarkNotificationsReadView(APIView):
    """POST mark all notifications as read."""
    def post(self, request):
        user = get_authorized_user_or_raise(request)
        Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        return Response({"success": True, "message": "All notifications marked as read."})


class NotificationPreferencesView(APIView):
    """GET and PATCH notification preferences."""
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        pref, _ = NotificationPreference.objects.get_or_create(user=user)
        return Response({
            "email_alerts_enabled": pref.email_alerts_enabled,
            "in_app_alerts_enabled": pref.in_app_alerts_enabled,
            "min_price_drop_percent": pref.min_price_drop_percent,
            "preferred_alert_categories": pref.preferred_alert_categories,
            "weekly_report_day": pref.weekly_report_day,
            "quiet_hours_start": pref.quiet_hours_start,
            "quiet_hours_end": pref.quiet_hours_end,
        })

    def patch(self, request):
        user = get_authorized_user_or_raise(request)
        pref, _ = NotificationPreference.objects.get_or_create(user=user)

        if "email_alerts_enabled" in request.data:
            pref.email_alerts_enabled = bool(request.data["email_alerts_enabled"])
        if "in_app_alerts_enabled" in request.data:
            pref.in_app_alerts_enabled = bool(request.data["in_app_alerts_enabled"])
        if "min_price_drop_percent" in request.data:
            pref.min_price_drop_percent = int(request.data["min_price_drop_percent"])
        if "weekly_report_day" in request.data:
            pref.weekly_report_day = str(request.data["weekly_report_day"])
        pref.save()

        return Response({
            "success": True,
            "email_alerts_enabled": pref.email_alerts_enabled,
            "in_app_alerts_enabled": pref.in_app_alerts_enabled,
            "min_price_drop_percent": pref.min_price_drop_percent,
            "weekly_report_day": pref.weekly_report_day,
        })
