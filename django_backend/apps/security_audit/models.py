from django.db import models
from django.contrib.auth.models import User


class SecurityAuditEvent(models.Model):
    """Structured security audit records for compliance and threat analysis."""
    SEVERITY_LEVELS = [
        ("INFO", "Informational"),
        ("WARN", "Warning"),
        ("CRITICAL", "Critical Security Alert"),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="security_audits")
    event_type = models.CharField(max_length=100, db_index=True)  # LOGIN_SUCCESS, FAILED_LOGIN, SESSION_REVOKED, PROFILE_UPDATED
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default="INFO")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.severity}] {self.event_type} - {self.timestamp}"


class FailedLoginAttempt(models.Model):
    """Rate-limiting and brute-force mitigation tracker."""
    username = models.CharField(max_length=150, db_index=True)
    ip_address = models.GenericIPAddressField(db_index=True)
    attempt_count = models.IntegerField(default=1)
    is_locked = models.BooleanField(default=False)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_attempt_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} from {self.ip_address} ({self.attempt_count} attempts)"
