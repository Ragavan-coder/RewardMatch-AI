from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.accounts.authentication import get_authorized_user_or_raise
from apps.security_audit.models import SecurityAuditEvent
from security.ssrf_validator import SSRFValidator
from .models import Merchant, TrackedProduct


class MerchantListView(APIView):
    """Returns list of supported online retail merchants."""
    permission_classes = [AllowAny]
    def get(self, request):
        if Merchant.objects.count() == 0:
            defaults = [
                {"name": "Amazon India", "slug": "amazon-in", "website_url": "https://amazon.in", "category": "E-Commerce", "supported_payment_methods": "Credit Card, UPI, Amazon Pay, EMI"},
                {"name": "Flipkart", "slug": "flipkart", "website_url": "https://flipkart.com", "category": "E-Commerce", "supported_payment_methods": "Credit Card, UPI, SuperCoins, EMI"},
                {"name": "Myntra", "slug": "myntra", "website_url": "https://myntra.com", "category": "Fashion", "supported_payment_methods": "Credit Card, UPI, Net Banking"},
                {"name": "Ajio", "slug": "ajio", "website_url": "https://ajio.com", "category": "Fashion", "supported_payment_methods": "Credit Card, UPI, Reliance Points"},
                {"name": "Croma", "slug": "croma", "website_url": "https://croma.com", "category": "Electronics", "supported_payment_methods": "Credit Card, Tata Neu UPI, EMI"},
                {"name": "Reliance Digital", "slug": "reliance-digital", "website_url": "https://reliancedigital.in", "category": "Electronics", "supported_payment_methods": "Credit Card, JioFinance UPI, Net Banking"},
            ]
            for d in defaults:
                Merchant.objects.get_or_create(slug=d["slug"], defaults=d)

        merchants = Merchant.objects.filter(is_active=True)
        return Response([
            {
                "id": m.id,
                "name": m.name,
                "slug": m.slug,
                "website_url": m.website_url,
                "category": m.category,
                "supported_payment_methods": m.supported_payment_methods,
            }
            for m in merchants
        ])


class TrackedProductsView(APIView):
    """GET and POST tracked products with SSRF and object-level authorization."""
    permission_classes = [AllowAny]
    def get(self, request):
        user = get_authorized_user_or_raise(request)
        products = TrackedProduct.objects.filter(user=user).order_by("-created_at")
        return Response([
            {
                "id": p.id,
                "title": p.title,
                "brand": p.brand,
                "category": p.category,
                "merchant_name": p.merchant_name,
                "current_price": float(p.current_price),
                "original_price": float(p.original_price or p.current_price),
                "target_price": float(p.target_price) if p.target_price else None,
                "best_card_name": p.best_card_name,
                "best_discount_rate": p.best_discount_rate,
                "estimated_savings": float(p.estimated_savings or 0.0),
                "image_url": p.image_url,
                "is_in_stock": p.is_in_stock,
                "last_monitored_at": p.last_monitored_at.strftime("%Y-%m-%d %H:%M:%S UTC") if p.last_monitored_at else None,
            }
            for p in products
        ])

    def post(self, request):
        title = request.data.get("title")
        merchant_name = request.data.get("merchant_name", "Amazon India")
        current_price = Decimal(str(request.data.get("current_price", 0)))
        target_price = request.data.get("target_price")
        target_price_dec = Decimal(str(target_price)) if target_price else None
        category = request.data.get("category", "Electronics")
        product_url = request.data.get("product_url", "")

        if product_url:
            is_safe, reason = SSRFValidator.validate_url(product_url)
            if not is_safe:
                client_ip = request.META.get("REMOTE_ADDR", "127.0.0.1")
                SecurityAuditEvent.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    event_type="SSRF_ATTEMPT_BLOCKED",
                    ip_address=client_ip,
                    description=f"Blocked prohibited target URL '{product_url}': {reason}",
                    severity="CRITICAL",
                )
                return Response({
                    "detail": f"Security validation failed: {reason}",
                    "security_code": "SSRF_BLOCKED"
                }, status=status.HTTP_400_BAD_REQUEST)

        user = get_authorized_user_or_raise(request)

        best_card = "HDFC Regalia Gold"
        discount_rate = "5% Instant Discount + 4X Points"
        estimated_savings = (current_price * Decimal("0.05")).quantize(Decimal("0.01"))

        if "flipkart" in merchant_name.lower():
            best_card = "Axis Flipkart Card"
            discount_rate = "5% Unlimited Cashback"
        elif "croma" in merchant_name.lower():
            best_card = "Tata Neu Infinity HDFC"
            discount_rate = "10% NeuCoins on Electronics"
            estimated_savings = (current_price * Decimal("0.10")).quantize(Decimal("0.01"))

        product = TrackedProduct.objects.create(
            user=user,
            title=title,
            merchant_name=merchant_name,
            current_price=current_price,
            original_price=current_price,
            target_price=target_price_dec,
            category=category,
            product_url=product_url,
            best_card_name=best_card,
            best_discount_rate=discount_rate,
            estimated_savings=estimated_savings,
        )

        return Response({
            "id": product.id,
            "title": product.title,
            "merchant_name": product.merchant_name,
            "current_price": float(product.current_price),
            "best_card_name": product.best_card_name,
            "best_discount_rate": product.best_discount_rate,
            "estimated_savings": float(product.estimated_savings),
        }, status=status.HTTP_201_CREATED)
