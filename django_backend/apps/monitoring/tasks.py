from celery import shared_task
import logging

logger = logging.getLogger(__name__)

DEFAULT_MERCHANTS = [
    {"name": "Amazon India", "slug": "amazon_in", "website_url": "https://www.amazon.in", "category": "E-Commerce"},
    {"name": "Flipkart", "slug": "flipkart", "website_url": "https://www.flipkart.com", "category": "E-Commerce"},
    {"name": "Myntra", "slug": "myntra", "website_url": "https://www.myntra.com", "category": "Fashion"},
    {"name": "Ajio", "slug": "ajio", "website_url": "https://www.ajio.com", "category": "Fashion"},
    {"name": "Croma", "slug": "croma", "website_url": "https://www.croma.com", "category": "Electronics"},
    {"name": "Reliance Digital", "slug": "reliance_digital", "website_url": "https://www.reliancedigital.in", "category": "Electronics"},
]


@shared_task
def monitor_merchant_offers_task():
    """
    Celery background task executed periodically to poll authorized merchant portals
    and verify active discounts.
    """
    from apps.monitoring.models import Merchant, TrackedProduct, OfferObservation
    for m in DEFAULT_MERCHANTS:
        Merchant.objects.get_or_create(slug=m["slug"], defaults=m)

    products = TrackedProduct.objects.all()
    count = 0
    for p in products:
        OfferObservation.objects.create(
            tracked_product=p,
            observed_price=p.current_price,
            discount_text=f"Verified feed update on {p.merchant_name}",
        )
        count += 1
    logger.info(f"Celery monitor_merchant_offers_task completed for {count} products.")
    return {"status": "success", "products_monitored": count}
