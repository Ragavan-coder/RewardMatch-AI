from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Merchant(Base):
    """Stores supported online retail merchants and brands."""
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    website_url = Column(String(255), nullable=False)
    category = Column(String(50), default="Multi-category")
    logo_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    supported_payment_methods = Column(String(255), default="Credit Card, Debit Card, UPI, Net Banking")
    created_at = Column(DateTime, default=datetime.utcnow)


class TrackedProduct(Base):
    """
    Stores products actively monitored by users for price drops,
    bank offers, and maximum card savings.
    """
    __tablename__ = "tracked_products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=True)
    category = Column(String(50), default="Electronics")
    merchant_name = Column(String(100), nullable=False)
    product_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    
    # Pricing with Decimal precision
    current_price = Column(Numeric(12, 2), nullable=False)
    target_price = Column(Numeric(12, 2), nullable=True)
    original_price = Column(Numeric(12, 2), nullable=True)
    lowest_observed_price = Column(Numeric(12, 2), nullable=True)
    
    best_card_name = Column(String(100), nullable=True)
    best_discount_rate = Column(String(50), nullable=True)
    estimated_savings = Column(Numeric(12, 2), default=0.00)
    
    is_in_stock = Column(Boolean, default=True)
    alert_on_price_drop = Column(Boolean, default=True)
    last_monitored_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="tracked_products")
    observations = relationship("OfferObservation", back_populates="tracked_product", cascade="all, delete-orphan")


class OfferObservation(Base):
    """
    Historical observation log of price and offer changes for monitored products.
    """
    __tablename__ = "offer_observations"

    id = Column(Integer, primary_key=True, index=True)
    tracked_product_id = Column(Integer, ForeignKey("tracked_products.id", ondelete="CASCADE"), nullable=False, index=True)
    observed_price = Column(Numeric(12, 2), nullable=False)
    discount_text = Column(String(255), nullable=True)
    coupon_code = Column(String(50), nullable=True)
    bank_offer_details = Column(String(255), nullable=True)
    observed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_stale = Column(Boolean, default=False)

    tracked_product = relationship("TrackedProduct", back_populates="observations")


class OfferMatch(Base):
    """
    Personalized deterministic offer evaluation matching user's registered cards
    to active merchant promotions.
    """
    __tablename__ = "offer_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_name = Column(String(100), nullable=False)
    product_category = Column(String(50), nullable=False)
    card_name = Column(String(100), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0.00)
    cashback_rate = Column(String(50), nullable=False)
    effective_price = Column(Numeric(12, 2), nullable=True)
    terms_summary = Column(Text, nullable=True)
    source_citation = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="offer_matches")
