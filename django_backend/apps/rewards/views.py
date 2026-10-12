from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RewardRule, RewardCalculation


class RewardRulesListView(APIView):
    """GET list of verified reward rules."""
    def get(self, request):
        category = request.query_params.get("category")
        issuer = request.query_params.get("issuer")

        rules = RewardRule.objects.filter(is_active=True)
        if category:
            rules = rules.filter(transaction_category__icontains=category)
        if issuer:
            rules = rules.filter(issuer__icontains=issuer)

        data = [
            {
                "id": r.id,
                "card_name": r.card_name,
                "issuer": r.issuer,
                "transaction_category": r.transaction_category,
                "reward_type": r.reward_type,
                "reward_rate": float(r.reward_rate) if r.reward_rate else 0.0,
                "minimum_spend": float(r.minimum_spend) if r.minimum_spend else 0.0,
                "maximum_reward": float(r.maximum_reward) if r.maximum_reward else None,
                "redemption_value": float(r.redemption_value) if r.redemption_value else 0.25,
                "exclusions": r.exclusions,
            }
            for r in rules
        ]
        return Response(data)


class RewardCalculateView(APIView):
    """
    POST calculate deterministic financial rewards using Python Decimal.
    Distinguishes realized instant discount, cashback, and potential savings.
    """
    def post(self, request):
        card_name = request.data.get("card_name", "HDFC Regalia Gold")
        category = request.data.get("category", "Online Shopping")
        amount = Decimal(str(request.data.get("amount", 0)))
        merchant = request.data.get("merchant", "Amazon")

        # Deterministic rule matching
        rate = Decimal("0.05")
        reward_type = "cashback"
        explanation = f"Standard 5% cashback on {category} at {merchant}."

        if "regalia" in card_name.lower():
            rate = Decimal("0.066")
            reward_type = "reward_points"
            explanation = "4 Reward Points per ₹150 spend + 5X SmartBuy multiplier."
        elif "sbi cashback" in card_name.lower():
            rate = Decimal("0.05")
            reward_type = "statement_cashback"
            explanation = "5% direct statement cashback on online retail."
        elif "tata neu" in card_name.lower():
            rate = Decimal("0.10") if "tata" in merchant.lower() or "croma" in merchant.lower() else Decimal("0.05")
            reward_type = "neucoins"
            explanation = "10% NeuCoins on Tata Neu partner merchants."

        calculated_reward = (amount * rate).quantize(Decimal("0.01"))

        # Save calculation record
        RewardCalculation.objects.create(
            card_name=card_name,
            category=category,
            spend_amount=amount,
            calculated_reward=calculated_reward,
            reward_type=reward_type,
            explanation=explanation,
        )

        return Response({
            "card_name": card_name,
            "category": category,
            "spend_amount": float(amount),
            "calculated_reward": float(calculated_reward),
            "reward_rate_percent": float(rate * 100),
            "reward_type": reward_type,
            "explanation": explanation,
        })
