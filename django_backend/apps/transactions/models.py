from django.db import models
from django.contrib.auth.models import User


class TransactionRecord(models.Model):
    """
    Financial transaction record tracking merchant, category, payment method,
    and the 6 distinct financial savings categories using Decimal precision.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    merchant = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    payment_method = models.CharField(max_length=50, default="Credit Card")
    card_used = models.CharField(max_length=100, default="Tata Neu Infinity HDFC Bank")
    payment_app_used = models.CharField(max_length=50, blank=True, null=True)

    # The 6 strictly distinct savings categories (Financial-grade Python Decimal)
    confirmed_instant_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    confirmed_cashback = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    confirmed_redeemed_reward = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pending_reward = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    estimated_reward = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    potential_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Legacy helper field
    cashback_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    reward_status = models.CharField(max_length=30, default="Confirmed")
    source = models.CharField(max_length=50, default="manual_entry")
    verification_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default="Completed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.merchant} - ₹{self.amount} ({self.status})"
