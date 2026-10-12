from django.db import models
from django.contrib.auth.models import User


class Merchant(models.Model):
    """Supported online retail merchants."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    website_url = models.URLField(max_length=255)
    category = models.CharField(max_length=50, default="Multi-category")
    is_active = models.BooleanField(default=True)
    supported_payment_methods = models.CharField(max_length=255, default="Credit Card, Debit Card, UPI, Net Banking")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TrackedProduct(models.Model):
    """Monitored products for price drops and verified credit card discounts."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tracked_products")
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=50, default="Electronics")
    merchant_name = models.CharField(max_length=100)
    product_url = models.URLField(max_length=500, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    target_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    original_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    best_card_name = models.CharField(max_length=100, blank=True, null=True)
    best_discount_rate = models.CharField(max_length=100, blank=True, null=True)
    estimated_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    is_in_stock = models.BooleanField(default=True)
    alert_on_price_drop = models.BooleanField(default=True)
    last_monitored_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - ₹{self.current_price}"


class OfferObservation(models.Model):
    """Historical snapshots of observed prices and bank promotions."""
    tracked_product = models.ForeignKey(TrackedProduct, on_delete=models.CASCADE, related_name="observations")
    observed_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_text = models.CharField(max_length=255, blank=True, null=True)
    observed_at = models.DateTimeField(auto_now_add=True)
