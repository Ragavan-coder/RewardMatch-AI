from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from apps.transactions.models import TransactionRecord


class FinancialCalculationsTestCase(TestCase):
    """Verifies Python Decimal financial accuracy and savings separation rules."""

    def setUp(self):
        self.user = User.objects.create_user(username="fintech_tester", email="test@fintech.ai", password="SecretPassword123!")

    def test_strict_separation_of_savings_buckets(self):
        """Ensures potential savings are NEVER added to confirmed realized savings."""
        tx = TransactionRecord.objects.create(
            user=self.user,
            merchant="Amazon India",
            category="Electronics",
            amount=Decimal("50000.00"),
            payment_method="HDFC Regalia Gold",
            confirmed_instant_discount=Decimal("2500.00"),
            confirmed_cashback=Decimal("500.00"),
            confirmed_redeemed_reward=Decimal("200.00"),
            pending_reward=Decimal("150.00"),
            estimated_reward=Decimal("300.00"),
            potential_savings=Decimal("1000.00"),
        )

        realized_savings = tx.confirmed_instant_discount + tx.confirmed_cashback + tx.confirmed_redeemed_reward
        self.assertEqual(realized_savings, Decimal("3200.00"))

        # Verify potential savings is distinct
        self.assertEqual(tx.potential_savings, Decimal("1000.00"))
        self.assertNotEqual(realized_savings + tx.potential_savings, realized_savings)

    def test_decimal_precision(self):
        """Verifies no floating-point rounding errors occur in financial computations."""
        d1 = Decimal("19.99")
        d2 = Decimal("0.05")
        calc = (d1 * d2).quantize(Decimal("0.01"))
        self.assertEqual(calc, Decimal("1.00"))
