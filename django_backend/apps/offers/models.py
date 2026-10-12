from django.db import models
from decimal import Decimal


class RewardOffer(models.Model):
    """Specific verifiable promotional offers with effective dates and caps."""
    offer_name = models.CharField(max_length=200, db_index=True)
    issuer = models.CharField(max_length=100, db_index=True)
    merchant = models.CharField(max_length=150, db_index=True)
    card_name = models.CharField(max_length=150, blank=True, null=True, db_index=True)
    offer_type = models.CharField(max_length=50)  # instant_discount, cashback, reward_points
    reward_rate = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    fixed_reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    minimum_transaction_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    maximum_reward_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    eligible_categories = models.CharField(max_length=200, blank=True, null=True)
    excluded_transactions = models.TextField(blank=True, null=True)
    effective_from = models.DateField(db_index=True)
    effective_until = models.DateField(db_index=True)
    verification_status = models.CharField(max_length=50, default="verified")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.offer_name} ({self.merchant})"
