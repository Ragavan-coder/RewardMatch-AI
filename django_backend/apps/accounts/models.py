import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    """Extended financial user profile linked to Django User."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=50, default="India")
    currency = models.CharField(max_length=10, default="INR")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    monthly_spend = models.IntegerField(default=50000)
    monthly_savings_goal = models.IntegerField(default=5000)
    primary_category = models.CharField(max_length=50, default="Shopping")
    preferred_stores = models.CharField(max_length=255, default="Amazon India, Flipkart, Myntra")
    primary_bank = models.CharField(max_length=100, blank=True, null=True)
    primary_upi_id = models.CharField(max_length=100, blank=True, null=True)
    primary_upi_app = models.CharField(max_length=50, default="Google Pay")
    is_demo = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)
    consent_terms = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.country})"


class UserSession(models.Model):
    """Tracks active sessions, device info, and enables session revocation."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    session_token = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    device_name = models.CharField(max_length=100, default="Web Browser")
    ip_address = models.GenericIPAddressField(default="127.0.0.1")
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at


class EmailVerificationToken(models.Model):
    """One-time token for verifying user email addresses."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_tokens")
    token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()


class PasswordResetToken(models.Model):
    """Cryptographic tokens for password resets."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
