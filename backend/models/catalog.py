from datetime import datetime, date
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from database import Base


class SourceDocument(Base):
    """Stores official source documents, URLs, publication dates, and content hashes."""
    __tablename__ = "source_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    publisher = Column(String(150), nullable=False, index=True)  # Bank, UPI App, Network, NPCI
    source_url = Column(String(500), nullable=False)
    document_type = Column(String(100), nullable=False)  # product_page, terms_and_conditions, mitc_schedule_of_charges, help_article
    publication_date = Column(Date, nullable=True)
    effective_from = Column(Date, nullable=True)
    effective_until = Column(Date, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    raw_content = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified", index=True)  # verified, needs_review, failed_refresh

    # Relationships
    reward_rules = relationship("RewardRule", back_populates="source_document")
    reward_offers = relationship("RewardOffer", back_populates="source_document")
    program_changes = relationship("RewardProgramChange", back_populates="source_document")


class CreditCard(Base):
    """Verified master catalog of credit cards available in India."""
    __tablename__ = "credit_cards_catalog"

    id = Column(Integer, primary_key=True, index=True)
    issuer = Column(String(100), nullable=False, index=True)
    card_name = Column(String(150), nullable=False, index=True)
    network = Column(String(50), nullable=False, index=True)  # Visa, Mastercard, RuPay, American Express
    card_category = Column(String(50), default="Rewards", index=True)  # Rewards, Cashback, Travel, Lifestyle, Shopping
    annual_fee = Column(Numeric(10, 2), nullable=True)
    joining_fee = Column(Numeric(10, 2), nullable=True)
    fee_waiver_conditions = Column(Text, nullable=True)
    forex_markup = Column(String(50), nullable=True)
    eligibility_summary = Column(Text, nullable=True)
    official_url = Column(String(500), nullable=False)
    application_url = Column(String(500), nullable=True)
    fuel_surcharge_benefit = Column(Text, nullable=True)
    lounge_access_summary = Column(Text, nullable=True)
    upi_enabled = Column(Boolean, default=False, index=True)
    rupay_on_upi_supported = Column(Boolean, default=False, index=True)
    status = Column(String(50), default="active", index=True)  # active, discontinued, requires_verification
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reward_rules = relationship("RewardRule", back_populates="card", cascade="all, delete-orphan")
    offers = relationship("RewardOffer", back_populates="associated_card")


class RewardRule(Base):
    """Granular verified reward-point and cashback rules per card category."""
    __tablename__ = "reward_rules"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("credit_cards_catalog.id"), nullable=False, index=True)
    transaction_category = Column(String(100), nullable=False, index=True)  # Groceries, Dining, Travel, Online Shopping, UPI Merchant (P2M), Utilities, All Spends
    merchant_restrictions = Column(Text, nullable=True)
    reward_type = Column(String(50), nullable=False)  # cashback_percent, points_per_spend, miles, voucher
    reward_rate = Column(Numeric(8, 3), nullable=True)  # e.g., 5.0 for 5.0%
    points_per_amount = Column(String(100), nullable=True)  # e.g., "4 points per Rs 150"
    eligible_transaction_types = Column(String(100), default="both")  # online, offline, both, upi_p2m
    minimum_spend = Column(Numeric(10, 2), nullable=True)
    maximum_reward = Column(Numeric(10, 2), nullable=True)  # reward cap in rupees or points
    reward_cap_period = Column(String(50), default="monthly")  # monthly, quarterly, annual, per_statement, unlimited
    redemption_value = Column(Numeric(8, 4), nullable=True)  # value in INR per point, e.g. 0.50
    redemption_options = Column(Text, nullable=True)
    redemption_fee = Column(Numeric(8, 2), nullable=True)
    exclusions = Column(Text, nullable=True)  # e.g. "Wallet loads, rent, fuel, jewellery, govt payments"
    effective_from = Column(Date, nullable=True)
    effective_until = Column(Date, nullable=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    verification_status = Column(String(50), default="verified", index=True)  # verified, under_review, stale

    # Relationships
    card = relationship("CreditCard", back_populates="reward_rules")
    source_document = relationship("SourceDocument", back_populates="reward_rules")


class UpiApplication(Base):
    """Supported Indian UPI payment applications and payment rails."""
    __tablename__ = "upi_applications"

    id = Column(Integer, primary_key=True, index=True)
    app_name = Column(String(100), nullable=False, unique=True, index=True)
    official_url = Column(String(500), nullable=False)
    official_help_url = Column(String(500), nullable=True)
    supported_payment_methods = Column(Text, nullable=False)  # JSON string or comma-separated list
    bank_account_upi_supported = Column(Boolean, default=True)
    rupay_cc_on_upi_supported = Column(Boolean, default=True, index=True)
    merchant_payment_supported = Column(Boolean, default=True)
    p2p_supported = Column(Boolean, default=True)
    published_programs_summary = Column(Text, nullable=True)
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    offers = relationship("RewardOffer", back_populates="associated_upi_app")


class RewardOffer(Base):
    """Specific verifiable promotional offers with validity dates and caps."""
    __tablename__ = "reward_offers"

    id = Column(Integer, primary_key=True, index=True)
    offer_name = Column(String(200), nullable=False, index=True)
    issuer = Column(String(100), nullable=False, index=True)
    merchant = Column(String(150), nullable=False, index=True)
    associated_card_id = Column(Integer, ForeignKey("credit_cards_catalog.id"), nullable=True, index=True)
    associated_upi_app_id = Column(Integer, ForeignKey("upi_applications.id"), nullable=True, index=True)
    offer_type = Column(String(50), nullable=False)  # instant_discount, cashback, reward_points, voucher, scratch_card
    reward_rate = Column(Numeric(8, 3), nullable=True)
    fixed_reward_amount = Column(Numeric(10, 2), nullable=True)
    minimum_transaction_amount = Column(Numeric(10, 2), nullable=True)
    maximum_reward_amount = Column(Numeric(10, 2), nullable=True)
    eligible_categories = Column(String(200), nullable=True)
    eligible_user_conditions = Column(Text, nullable=True)
    excluded_transactions = Column(Text, nullable=True)  # P2P transfers, wallet top-up, EMI
    stacking_rules = Column(Text, nullable=True)
    effective_from = Column(Date, nullable=False, index=True)
    effective_until = Column(Date, nullable=False, index=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    verification_status = Column(String(50), default="verified", index=True)  # verified, under_review, expired, stale

    # Relationships
    associated_card = relationship("CreditCard", back_populates="offers")
    associated_upi_app = relationship("UpiApplication", back_populates="offers")
    source_document = relationship("SourceDocument", back_populates="reward_offers")


class RewardProgramChange(Base):
    """Audit logging table tracking policy modifications and detected diffs."""
    __tablename__ = "reward_program_changes"

    id = Column(Integer, primary_key=True, index=True)
    related_entity_type = Column(String(50), nullable=False, index=True)  # CreditCard, RewardRule, RewardOffer, UpiApplication
    related_entity_id = Column(Integer, nullable=False, index=True)
    field_changed = Column(String(100), nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(100), nullable=True)

    # Relationships
    source_document = relationship("SourceDocument", back_populates="program_changes")
