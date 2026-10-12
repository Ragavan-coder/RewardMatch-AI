from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class WeeklyReport(models.Model):
    """Weekly financial savings intelligence report."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weekly_reports")
    report_week = models.CharField(max_length=20)  # e.g., '2026-W41'
    start_date = models.DateField()
    end_date = models.DateField()

    total_spend = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    confirmed_discounts = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    confirmed_cashback = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    confirmed_redeemed_rewards = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    pending_rewards = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    estimated_rewards = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    potential_savings = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    status = models.CharField(max_length=30, default="generated")
    report_sections_json = models.TextField(blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Report {self.report_week} for {self.user.username}"
