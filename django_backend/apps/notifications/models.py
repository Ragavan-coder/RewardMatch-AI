from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    """User in-app alert or notification."""
    ALERT_TYPES = [
        ("price_drop", "Price Drop Alert"),
        ("card_offer", "Card Offer Alert"),
        ("security", "Security Event"),
        ("report", "Weekly Report Ready"),
        ("system", "System Notice"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES, default="card_offer")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.alert_type}] {self.title}"


class NotificationPreference(models.Model):
    """User alert delivery preferences."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="notification_preferences")
    email_alerts_enabled = models.BooleanField(default=True)
    in_app_alerts_enabled = models.BooleanField(default=True)
    min_price_drop_percent = models.IntegerField(default=5)
    preferred_alert_categories = models.CharField(max_length=255, default="Electronics, Fashion, Travel, Dining")
    weekly_report_day = models.CharField(max_length=20, default="Sunday")
    quiet_hours_start = models.CharField(max_length=10, default="22:00")
    quiet_hours_end = models.CharField(max_length=10, default="08:00")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"
