from decimal import Decimal
from typing import Dict, Any, Tuple

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.authentication import get_authorized_user_or_raise
from apps.activity.models import ActivityEvent
from .models import TransactionRecord


def aggregate_user_savings(txs) -> Dict[str, Any]:
    """
    Computes financial savings summary across the 6 strictly separated buckets.
    Formula: Total Realized Savings = Confirmed Discounts + Confirmed Cashback + Confirmed Redeemed Rewards.
    Potential savings are strictly recommendations and are NEVER mixed into realized savings.
    """
    total_spend = Decimal("0.00")
    confirmed_discounts = Decimal("0.00")
    confirmed_cashback = Decimal("0.00")
    confirmed_redeemed = Decimal("0.00")
    pending_rewards = Decimal("0.00")
    estimated_rewards = Decimal("0.00")
    potential_savings = Decimal("0.00")

    category_spend: Dict[str, Decimal] = {}
    merchant_spend: Dict[str, Decimal] = {}

    for tx in txs:
        amt = tx.amount
        total_spend += amt
        confirmed_discounts += tx.confirmed_instant_discount
        confirmed_cashback += tx.confirmed_cashback or tx.cashback_earned
        confirmed_redeemed += tx.confirmed_redeemed_reward
        pending_rewards += tx.pending_reward
        estimated_rewards += tx.estimated_reward
        potential_savings += tx.potential_savings

        cat = tx.category or "General"
        category_spend[cat] = category_spend.get(cat, Decimal("0.00")) + amt

        merch = tx.merchant or "Unknown Merchant"
        merchant_spend[merch] = merchant_spend.get(merch, Decimal("0.00")) + amt

    total_realized = confirmed_discounts + confirmed_cashback + confirmed_redeemed

    return {
        "total_spend": float(total_spend),
        "total_realized_savings": float(total_realized),
        "buckets": {
            "confirmed_instant_discount": float(confirmed_discounts),
            "confirmed_cashback": float(confirmed_cashback),
            "confirmed_redeemed_reward": float(confirmed_redeemed),
            "pending_reward": float(pending_rewards),
            "estimated_reward": float(estimated_rewards),
            "potential_savings": float(potential_savings),
        },
        "category_spend": {k: float(v) for k, v in category_spend.items()},
        "merchant_spend": {k: float(v) for k, v in merchant_spend.items()},
        "transaction_count": txs.count(),
        "formula_note": "Total Realized Savings = Confirmed Instant Discounts + Confirmed Cashback + Confirmed Redeemed Rewards. Potential savings are recommendations and not included.",
    }


class TransactionsListView(APIView):
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        txs = TransactionRecord.objects.filter(user=user).order_by("-created_at")

        result = [
            {
                "id": str(tx.id),
                "merchant": tx.merchant,
                "amount": float(tx.amount),
                "category": tx.category,
                "cardUsed": tx.card_used,
                "cashbackEarned": float(tx.confirmed_cashback or tx.cashback_earned),
                "date": tx.created_at.strftime("%d %b %Y"),
                "status": tx.status,
            }
            for tx in txs
        ]
        return Response(result)


class SavingsSummaryView(APIView):
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        txs = TransactionRecord.objects.filter(user=user)
        return Response(aggregate_user_savings(txs))


class RecordTransactionView(APIView):
    def post(self, request):
        user = get_authorized_user_or_raise(request)

        amount = Decimal(str(request.data.get("amount", 1000)))
        discount = Decimal(str(request.data.get("confirmed_discount", 0)))
        cashback = Decimal(str(request.data.get("confirmed_cashback", 0)))
        pending = Decimal(str(request.data.get("pending_reward", 0)))
        estimated = Decimal(str(request.data.get("estimated_reward", 0)))

        tx = TransactionRecord.objects.create(
            user=user,
            merchant=request.data.get("merchant", "Amazon India"),
            category=request.data.get("category", "Electronics"),
            amount=amount,
            card_used=request.data.get("card_used", "Tata Neu Infinity HDFC Bank"),
            payment_method=request.data.get("payment_method", "Credit Card"),
            confirmed_instant_discount=discount,
            confirmed_cashback=cashback,
            cashback_earned=cashback,
            pending_reward=pending,
            estimated_reward=estimated,
            source="manual_entry",
        )

        ActivityEvent.objects.create(
            user=user,
            category="transaction",
            event_type="purchase_recorded",
            description=f"Recorded ₹{float(amount):,.2f} at {tx.merchant} via {tx.card_used}",
            related_entity_id=str(tx.id),
            related_entity_type="transaction",
            status="confirmed",
            source="manual_entry",
        )

        return Response({
            "id": tx.id,
            "merchant": tx.merchant,
            "amount": float(tx.amount),
            "confirmed_cashback": float(tx.confirmed_cashback),
            "status": tx.status,
            "created_at": tx.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }, status=status.HTTP_201_CREATED)
