from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MerchantPartner


class MerchantPartnersListView(APIView):
    """GET list of merchant partners."""
    def get(self, request):
        if MerchantPartner.objects.count() == 0:
            defaults = [
                {"name": "Amazon", "slug": "amazon", "website_url": "https://amazon.in", "category": "E-Commerce"},
                {"name": "Flipkart", "slug": "flipkart", "website_url": "https://flipkart.com", "category": "E-Commerce"},
                {"name": "Myntra", "slug": "myntra", "website_url": "https://myntra.com", "category": "Fashion"},
                {"name": "Swiggy", "slug": "swiggy", "website_url": "https://swiggy.com", "category": "Food & Dining"},
                {"name": "Zomato", "slug": "zomato", "website_url": "https://zomato.com", "category": "Food & Dining"},
                {"name": "MakeMyTrip", "slug": "makemytrip", "website_url": "https://makemytrip.com", "category": "Travel"},
            ]
            for d in defaults:
                MerchantPartner.objects.get_or_create(slug=d["slug"], defaults=d)

        partners = MerchantPartner.objects.filter(is_active=True)
        return Response([
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "website_url": p.website_url,
                "category": p.category,
                "supported_channels": p.supported_channels,
            }
            for p in partners
        ])
