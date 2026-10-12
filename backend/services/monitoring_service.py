from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from models.monitoring import Merchant, TrackedProduct, OfferObservation, OfferMatch
from models.card import CreditCardRecord
from services.activity_service import ActivityService


DEFAULT_MERCHANTS = [
    {
        "name": "Amazon India",
        "slug": "amazon_in",
        "website_url": "https://www.amazon.in",
        "category": "E-Commerce",
        "supported_payment_methods": "Amazon Pay ICICI, RuPay on UPI, HDFC, SBI, Axis",
    },
    {
        "name": "Flipkart",
        "slug": "flipkart",
        "website_url": "https://www.flipkart.com",
        "category": "E-Commerce",
        "supported_payment_methods": "Flipkart Axis Bank, SBI Card, RuPay on UPI",
    },
    {
        "name": "Myntra",
        "slug": "myntra",
        "website_url": "https://www.myntra.com",
        "category": "Fashion & Apparel",
        "supported_payment_methods": "Myntra Kotak, HDFC Millennia, UPI",
    },
    {
        "name": "Ajio",
        "slug": "ajio",
        "website_url": "https://www.ajio.com",
        "category": "Fashion",
        "supported_payment_methods": "RuPay Credit, Reliance SBI, Google Pay",
    },
    {
        "name": "Croma",
        "slug": "croma",
        "website_url": "https://www.croma.com",
        "category": "Electronics & Appliances",
        "supported_payment_methods": "Tata Neu Infinity HDFC (5% NeuCoins), ICICI, Axis",
    },
    {
        "name": "Reliance Digital",
        "slug": "reliance_digital",
        "website_url": "https://www.reliancedigital.in",
        "category": "Electronics",
        "supported_payment_methods": "SBI Card, HDFC Bank, PhonePe UPI",
    },
]


class MonitoringService:
    """
    Monitors products, evaluates price changes and bank discounts across
    authorized Indian merchant portals, and generates deterministic card matches.
    """

    @staticmethod
    def ensure_merchants(db: Session):
        """Initializes default supported merchants."""
        for m in DEFAULT_MERCHANTS:
            exists = db.query(Merchant).filter(Merchant.slug == m["slug"]).first()
            if not exists:
                merch = Merchant(
                    name=m["name"],
                    slug=m["slug"],
                    website_url=m["website_url"],
                    category=m["category"],
                    supported_payment_methods=m["supported_payment_methods"],
                )
                db.add(merch)
        db.commit()

    @staticmethod
    def get_tracked_products(db: Session, user_id: int) -> List[TrackedProduct]:
        """Returns products monitored by the user."""
        products = db.query(TrackedProduct).filter(TrackedProduct.user_id == user_id).all()
        if not products:
            # Seed realistic starter products for the user
            sample_items = [
                {
                    "title": "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
                    "brand": "Sony",
                    "category": "Electronics",
                    "merchant_name": "Amazon India",
                    "current_price": Decimal("26990.00"),
                    "original_price": Decimal("34990.00"),
                    "target_price": Decimal("25000.00"),
                    "best_card_name": "HDFC Regalia Gold",
                    "best_discount_rate": "10% Instant Bank Discount (up to ₹2,500)",
                    "estimated_savings": Decimal("2500.00"),
                    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
                },
                {
                    "title": "Apple MacBook Air M3 15-inch 16GB / 512GB",
                    "brand": "Apple",
                    "category": "Electronics",
                    "merchant_name": "Croma",
                    "current_price": Decimal("134900.00"),
                    "original_price": Decimal("144900.00"),
                    "target_price": Decimal("129900.00"),
                    "best_card_name": "Tata Neu Infinity HDFC Bank",
                    "best_discount_rate": "5% NeuCoins + ₹5,000 Instant HDFC Discount",
                    "estimated_savings": Decimal("11745.00"),
                    "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
                },
                {
                    "title": "Nike Air Zoom Pegasus 41 Running Shoes",
                    "brand": "Nike",
                    "category": "Footwear",
                    "merchant_name": "Myntra",
                    "current_price": Decimal("8995.00"),
                    "original_price": Decimal("11995.00"),
                    "target_price": Decimal("8500.00"),
                    "best_card_name": "SBI Cashback Credit Card",
                    "best_discount_rate": "5% Online Cashback (₹450 back)",
                    "estimated_savings": Decimal("450.00"),
                    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
                },
            ]
            for item in sample_items:
                tp = TrackedProduct(
                    user_id=user_id,
                    title=item["title"],
                    brand=item["brand"],
                    category=item["category"],
                    merchant_name=item["merchant_name"],
                    current_price=item["current_price"],
                    original_price=item["original_price"],
                    target_price=item["target_price"],
                    lowest_observed_price=item["current_price"],
                    best_card_name=item["best_card_name"],
                    best_discount_rate=item["best_discount_rate"],
                    estimated_savings=item["estimated_savings"],
                    image_url=item["image_url"],
                    last_monitored_at=datetime.utcnow(),
                )
                db.add(tp)
            db.commit()
            products = db.query(TrackedProduct).filter(TrackedProduct.user_id == user_id).all()
        return products

    @staticmethod
    def add_tracked_product(
        db: Session,
        user_id: int,
        title: str,
        merchant_name: str,
        current_price: float,
        target_price: Optional[float] = None,
        category: str = "Electronics",
        product_url: Optional[str] = None,
    ) -> TrackedProduct:
        """Adds a new user product to the active price monitor."""
        dec_curr = Decimal(str(current_price))
        dec_target = Decimal(str(target_price)) if target_price else dec_curr * Decimal("0.90")

        # Deterministic card multiplier calculation
        cards = db.query(CreditCardRecord).filter(CreditCardRecord.user_id == user_id).all()
        best_card = cards[0].name if cards else "RewardMatch Platinum"

        item = TrackedProduct(
            user_id=user_id,
            title=title,
            category=category,
            merchant_name=merchant_name,
            current_price=dec_curr,
            original_price=dec_curr,
            target_price=dec_target,
            lowest_observed_price=dec_curr,
            product_url=product_url,
            best_card_name=best_card,
            best_discount_rate="5% Cashback Multiplier",
            estimated_savings=dec_curr * Decimal("0.05"),
            last_monitored_at=datetime.utcnow(),
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        # Record initial price observation
        obs = OfferObservation(
            tracked_product_id=item.id,
            observed_price=dec_curr,
            discount_text="Initial Price Monitored",
        )
        db.add(obs)

        # Audit timeline event
        ActivityService.record_event(
            db,
            user_id=user_id,
            category="shopping",
            event_type="offer_discovered",
            description=f"Added {title[:32]}... to active price monitoring on {merchant_name}",
            related_entity_id=str(item.id),
            related_entity_type="product",
            status="confirmed",
            source="manual",
        )
        db.commit()
        return item
