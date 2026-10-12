from datetime import date
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RewardOffer


class OfferListView(APIView):
    """GET active bank and merchant offers."""
    def get(self, request):
        merchant = request.query_params.get("merchant")
        issuer = request.query_params.get("issuer")
        today = date.today()

        offers = RewardOffer.objects.filter(is_active=True, effective_until__gte=today)
        if merchant:
            offers = offers.filter(merchant__icontains=merchant)
        if issuer:
            offers = offers.filter(issuer__icontains=issuer)

        if offers.count() == 0:
            # Seed standard Indian card promotional offers
            seed_data = [
                {
                    "offer_name": "HDFC Festive 10% Instant Discount",
                    "issuer": "HDFC Bank",
                    "merchant": "Amazon India",
                    "card_name": "HDFC Regalia Gold",
                    "offer_type": "instant_discount",
                    "reward_rate": Decimal("10.00"),
                    "minimum_transaction_amount": Decimal("5000.00"),
                    "maximum_reward_amount": Decimal("1750.00"),
                    "eligible_categories": "Electronics, Appliances",
                    "excluded_transactions": "Wallet loads, Gold, Gift cards",
                    "effective_from": date(2026, 1, 1),
                    "effective_until": date(2026, 12, 31),
                },
                {
                    "offer_name": "SBI Card 5% Unlimited Online Cashback",
                    "issuer": "SBI Card",
                    "merchant": "Flipkart",
                    "card_name": "SBI Cashback Card",
                    "offer_type": "cashback",
                    "reward_rate": Decimal("5.00"),
                    "minimum_transaction_amount": Decimal("100.00"),
                    "maximum_reward_amount": Decimal("5000.00"),
                    "eligible_categories": "All Online Shopping",
                    "excluded_transactions": "Rent, Fuel, Utilities",
                    "effective_from": date(2026, 1, 1),
                    "effective_until": date(2026, 12, 31),
                },
                {
                    "offer_name": "Tata Neu Infinity 10% NeuCoins on Croma",
                    "issuer": "HDFC Bank",
                    "merchant": "Croma",
                    "card_name": "Tata Neu Infinity HDFC",
                    "offer_type": "reward_points",
                    "reward_rate": Decimal("10.00"),
                    "minimum_transaction_amount": Decimal("1000.00"),
                    "maximum_reward_amount": Decimal("10000.00"),
                    "eligible_categories": "Laptops, Mobiles, TV",
                    "excluded_transactions": "None",
                    "effective_from": date(2026, 1, 1),
                    "effective_until": date(2026, 12, 31),
                },
            ]
            for item in seed_data:
                RewardOffer.objects.get_or_create(offer_name=item["offer_name"], defaults=item)
            offers = RewardOffer.objects.filter(is_active=True)

        data = [
            {
                "id": o.id,
                "offer_name": o.offer_name,
                "issuer": o.issuer,
                "merchant": o.merchant,
                "card_name": o.card_name,
                "offer_type": o.offer_type,
                "reward_rate": float(o.reward_rate) if o.reward_rate else 0.0,
                "minimum_transaction_amount": float(o.minimum_transaction_amount) if o.minimum_transaction_amount else 0.0,
                "maximum_reward_amount": float(o.maximum_reward_amount) if o.maximum_reward_amount else None,
                "eligible_categories": o.eligible_categories,
                "effective_from": o.effective_from.strftime("%Y-%m-%d"),
                "effective_until": o.effective_until.strftime("%Y-%m-%d"),
                "verification_status": o.verification_status,
            }
            for o in offers
        ]
        return Response(data)


class UpiOffersView(APIView):
    """GET UPI and RuPay on UPI specific promotions."""
    def get(self, request):
        upi_offers = [
            {
                "id": 101,
                "app_name": "BHIM UPI",
                "offer_title": "RuPay Credit Card on UPI 3% Fuel & Grocery Cash",
                "eligible_cards": "All RuPay Credit Cards (PNB, HDFC, SBI, Axis)",
                "min_spend": 200.0,
                "reward_rate": "3.0%",
                "max_reward": 500.0,
                "details": "Scan merchant UPI QR and pay via linked RuPay Credit Card.",
            },
            {
                "id": 102,
                "app_name": "Google Pay",
                "offer_title": "Scratch Card on Utility Bills via Axis ACE",
                "eligible_cards": "Axis Bank ACE Card",
                "min_spend": 500.0,
                "reward_rate": "5.0% Direct Cashback",
                "max_reward": 250.0,
                "details": "Pay electricity, water, or DTH via GPay bill pay.",
            },
            {
                "id": 103,
                "app_name": "Tata Neu UPI",
                "offer_title": "Extra 1.5% NeuCoins on Any Merchant Scan & Pay",
                "eligible_cards": "Tata Neu Plus / Infinity RuPay CC",
                "min_spend": 100.0,
                "reward_rate": "1.5% NeuCoins",
                "max_reward": 1000.0,
                "details": "Eligible on all P2M QR transactions across India.",
            },
        ]
        return Response(upi_offers)
