from django.db import models


class MerchantPartner(models.Model):
    """Verified retail partners, e-commerce stores, and payment aggregators."""
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website_url = models.URLField(max_length=500)
    category = models.CharField(max_length=100, default="Retail")
    supported_channels = models.CharField(max_length=200, default="Online, App, In-Store")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
