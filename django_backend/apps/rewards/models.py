from django.db import models
from decimal import Decimal


class RewardRule(models.Model):
    """Deterministic verified reward rules per card or spend category."""
    card_name = models.CharField(max_length=150, db_index=True)
    issuer = models.CharField(max_length=100, db_index=True)
    transaction_category = models.CharField(max_length=100, db_index=True)
    reward_type = models.CharField(max_length=50)  # cashback_percent, points_per_spend, instant_discount
    reward_rate = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    minimum_spend = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    maximum_reward = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reward_cap_period = models.CharField(max_length=50, default="monthly")
    redemption_value = models.DecimalField(max_digits=8, decimal_places=4, default=Decimal("0.25"))
    exclusions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card_name} - {self.transaction_category} ({self.reward_rate}%)"


class RewardCalculation(models.Model):
    """Audit log of deterministic reward computations."""
    card_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    spend_amount = models.DecimalField(max_digits=12, decimal_places=2)
    calculated_reward = models.DecimalField(max_digits=12, decimal_places=2)
    reward_type = models.CharField(max_length=50)
    explanation = models.TextField()
    calculated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card_name} - ₹{self.spend_amount} -> ₹{self.calculated_reward}"
