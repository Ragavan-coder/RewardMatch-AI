from django.db import models
from django.contrib.auth.models import User


class ActivityEvent(models.Model):
    """Immutable chronological audit and activity history timeline."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activity_events")
    category = models.CharField(max_length=50, db_index=True)  # account, card, bank, transaction, offer, reward, shopping, alert, report
    event_type = models.CharField(max_length=50, db_index=True)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    display_timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    related_entity_id = models.CharField(max_length=50, blank=True, null=True)
    related_entity_type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=30, default="confirmed")
    source = models.CharField(max_length=50, default="system")
    meta_data = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.category}] {self.description}"
