from django.db import models
from django.contrib.auth.models import User


class CreditCardRecord(models.Model):
    """Credit cards held by the user with verified features and limits."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cards")
    name = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100, default="HDFC Bank")
    card_number_masked = models.CharField(max_length=25, default="•••• •••• •••• 4821")
    network = models.CharField(max_length=50, default="RuPay")  # RuPay, VISA, Mastercard, Amex
    tier = models.CharField(max_length=50, default="Platinum")
    credit_limit = models.IntegerField(default=150000)
    available_limit = models.IntegerField(default=135000)
    annual_fee = models.IntegerField(default=1500)
    joining_fee = models.IntegerField(default=1500)
    reward_points = models.IntegerField(default=5000)
    cashback_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    rupay_on_upi_linked = models.BooleanField(default=True)
    card_status = models.CharField(max_length=20, default="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    last_verified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.card_number_masked})"


class BankAccountRecord(models.Model):
    """Bank accounts and linked UPI VPAs."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bank_accounts")
    bank_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=50, default="Salary")  # Salary, Savings, Current
    account_number_masked = models.CharField(max_length=25, default="•••• •••• 3491")
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    primary_upi_app = models.CharField(max_length=50, default="Google Pay")
    is_primary = models.BooleanField(default=True)
    rupay_credit_linked = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bank_name} - {self.upi_id}"


class PaymentAppProfile(models.Model):
    """Documented capabilities and preferences for UPI apps."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment_apps")
    app_name = models.CharField(max_length=50)  # Google Pay, PhonePe, Paytm, BHIM, Amazon Pay
    nickname = models.CharField(max_length=100, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    rupay_credit_supported = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
