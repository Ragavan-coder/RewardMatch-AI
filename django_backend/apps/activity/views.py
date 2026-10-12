from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import ActivityEvent


class ActivityTimelineView(APIView):
    def get(self, request):
        user_id = request.query_params.get("user_id", 1)
        category = request.query_params.get("category", "all")

        events = ActivityEvent.objects.filter(user_id=user_id)
        if category and category != "all":
            events = events.filter(category=category)

        if not events.exists() and category == "all":
            user = User.objects.filter(id=user_id).first() or User.objects.first()
            if user:
                initial_events = [
                    ("account", "account_created", "Account created and secured with bank-grade encryption in MySQL", "confirmed", "manual"),
                    ("card", "card_added", "Linked Tata Neu Infinity HDFC Bank (RuPay on UPI enabled)", "confirmed", "manual"),
                    ("bank", "bank_profile_updated", "Configured HDFC Bank Salary account & UPI VPA", "confirmed", "manual"),
                    ("offer", "offer_discovered", "Discovered 5% NeuCoins reward boost on Croma & BigBasket", "confirmed", "engine"),
                    ("transaction", "purchase_recorded", "Transaction of ₹3,499 on Swiggy Instamart evaluated for cashback", "confirmed", "simulated_swipe"),
                    ("reward", "cashback_confirmed", "Confirmed ₹175 cashback for dining & supermarket spend", "confirmed", "engine"),
                ]
                for cat, ev_type, desc, stat, src in initial_events:
                    ActivityEvent.objects.create(
                        user=user,
                        category=cat,
                        event_type=ev_type,
                        description=desc,
                        status=stat,
                        source=src,
                    )
                events = ActivityEvent.objects.filter(user_id=user_id)

        result = [
            {
                "id": ev.id,
                "category": ev.category,
                "event_type": ev.event_type,
                "description": ev.description,
                "timestamp": ev.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "display_timezone": ev.display_timezone,
                "related_entity_id": ev.related_entity_id,
                "related_entity_type": ev.related_entity_type,
                "status": ev.status,
                "source": ev.source,
                "meta_data": ev.meta_data,
            }
            for ev in events[:50]
        ]
        return Response(result)
