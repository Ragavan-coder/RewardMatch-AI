from decimal import Decimal
from typing import Dict, Any

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.authentication import get_authorized_user_or_raise
from .models import CreditCardRecord, BankAccountRecord


def serialize_card(card: CreditCardRecord) -> Dict[str, Any]:
    """Helper to serialize credit card records into frontend schema."""
    is_neu = "Neu" in card.name
    return {
        "id": str(card.id),
        "name": card.name,
        "tier": card.tier,
        "cardNumberMasked": card.card_number_masked,
        "cardHolder": card.user.first_name or "Ragavan",
        "network": card.network,
        "creditLimit": card.credit_limit,
        "availableLimit": card.available_limit,
        "annualFee": card.annual_fee,
        "rewardPoints": card.reward_points,
        "cashbackEarned": float(card.cashback_earned),
        "accentColor": "#FF3038" if is_neu else "#E5B567",
        "gradient": "linear-gradient(135deg, #2a080c 0%, #150406 100%)",
        "highlightBenefit": "1.5% NeuCoins on UPI • 5% on Tata brands",
        "categories": [
            {"name": "UPI Merchant Payments", "rate": "1.5% NeuCoins"},
            {"name": "Tata Brands (Croma/1mg)", "rate": "5% NeuCoins"},
            {"name": "Dining & Delivery", "rate": "3X Points"},
        ],
        "rupay_on_upi_linked": card.rupay_on_upi_linked,
    }


class CardsListView(APIView):
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        cards = CreditCardRecord.objects.filter(user=user)

        if not cards.exists():
            CreditCardRecord.objects.create(
                user=user,
                name="Tata Neu Infinity HDFC Bank",
                bank_name="HDFC Bank",
                card_number_masked="•••• •••• •••• 4821",
                network="RuPay",
                tier="Infinity",
                credit_limit=150000,
                available_limit=135000,
                annual_fee=1499,
                reward_points=8500,
                cashback_earned=Decimal("1250.00"),
                rupay_on_upi_linked=True,
            )
            CreditCardRecord.objects.create(
                user=user,
                name="HDFC Regalia Gold",
                bank_name="HDFC Bank",
                card_number_masked="•••• •••• •••• 9021",
                network="VISA",
                tier="Gold",
                credit_limit=250000,
                available_limit=220000,
                annual_fee=2500,
                reward_points=12000,
                cashback_earned=Decimal("2100.00"),
                rupay_on_upi_linked=False,
            )
            cards = CreditCardRecord.objects.filter(user=user)

        return Response([serialize_card(c) for c in cards])

    def post(self, request):
        user = get_authorized_user_or_raise(request)
        card = CreditCardRecord.objects.create(
            user=user,
            name=request.data.get("name", "New Credit Card"),
            bank_name=request.data.get("bank_name", "HDFC Bank"),
            card_number_masked=f"•••• •••• •••• {request.data.get('last_4', '1234')}",
            network=request.data.get("network", "VISA"),
            credit_limit=request.data.get("credit_limit", 100000),
            rupay_on_upi_linked=request.data.get("rupay_on_upi", False),
        )
        return Response({"id": card.id, "name": card.name, "message": "Card linked successfully."})


class SimulateSwipeView(APIView):
    def post(self, request):
        card_id = request.data.get("card_id", 1)
        amount = Decimal(str(request.data.get("amount", 2500)))
        category = request.data.get("category", "Dining")

        card = CreditCardRecord.objects.filter(id=card_id).first() or CreditCardRecord.objects.first()
        card_name = card.name if card else "Tata Neu Infinity HDFC Bank"

        rate_num = Decimal("0.05") if ("Neu" in card_name or category == "Dining") else Decimal("0.02")
        rate_str = "5.0%" if rate_num == Decimal("0.05") else "2.0%"
        cashback = amount * rate_num
        pts = int(amount * Decimal("0.2"))

        if card:
            card.cashback_earned += cashback
            card.reward_points += pts
            card.save()

        return Response({
            "status": "APPROVED",
            "card_name": card_name,
            "rate": rate_str,
            "cashback_earned": float(cashback),
            "new_reward_points": card.reward_points if card else pts,
        })


class BanksListView(APIView):
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        banks = BankAccountRecord.objects.filter(user=user)

        if not banks.exists():
            BankAccountRecord.objects.create(
                user=user,
                bank_name="HDFC Bank",
                account_type="Salary",
                account_number_masked="•••• •••• 3491",
                upi_id="ragavan@okhdfcbank",
                primary_upi_app="Google Pay",
                is_primary=True,
                rupay_credit_linked=True,
            )
            banks = BankAccountRecord.objects.filter(user=user)

        return Response([
            {
                "id": b.id,
                "user_id": b.user_id,
                "bank_name": b.bank_name,
                "account_type": b.account_type,
                "account_number_masked": b.account_number_masked,
                "upi_id": b.upi_id,
                "primary_upi_app": b.primary_upi_app,
                "is_primary": b.is_primary,
                "rupay_credit_linked": b.rupay_credit_linked,
            }
            for b in banks
        ])

    def post(self, request):
        user = get_authorized_user_or_raise(request)
        last_4 = request.data.get("last_4", "4321")
        masked = request.data.get("account_number_masked") or f"•••• •••• {last_4}"

        bank = BankAccountRecord.objects.create(
            user=user,
            bank_name=request.data.get("bank_name", "HDFC Bank"),
            account_type=request.data.get("account_type", "Savings"),
            account_number_masked=masked,
            upi_id=request.data.get("upi_id", "user@okhdfcbank"),
            primary_upi_app=request.data.get("primary_upi_app", "Google Pay"),
            is_primary=request.data.get("is_primary", False),
            rupay_credit_linked=request.data.get("rupay_credit_linked", True),
        )
        return Response({
            "id": bank.id,
            "bank_name": bank.bank_name,
            "account_number_masked": bank.account_number_masked,
            "upi_id": bank.upi_id,
            "primary_upi_app": bank.primary_upi_app,
            "is_primary": bank.is_primary,
            "rupay_credit_linked": bank.rupay_credit_linked,
        }, status=status.HTTP_201_CREATED)
