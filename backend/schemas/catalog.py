from datetime import date, datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# SOURCE DOCUMENT SCHEMAS
# ==========================================

class SourceDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    publisher: str
    source_url: str
    document_type: str
    publication_date: Optional[date] = None
    effective_from: Optional[date] = None
    effective_until: Optional[date] = None
    retrieved_at: datetime
    content_hash: str
    raw_content: Optional[str] = None
    verification_status: str


# ==========================================
# REWARD RULE SCHEMAS
# ==========================================

class RewardRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_id: int
    transaction_category: str
    merchant_restrictions: Optional[str] = None
    reward_type: str
    reward_rate: Optional[float] = None
    points_per_amount: Optional[str] = None
    eligible_transaction_types: str
    minimum_spend: Optional[float] = None
    maximum_reward: Optional[float] = None
    reward_cap_period: Optional[str] = "monthly"
    redemption_value: Optional[float] = None
    redemption_options: Optional[str] = None
    redemption_fee: Optional[float] = None
    exclusions: Optional[str] = None
    effective_from: Optional[date] = None
    effective_until: Optional[date] = None
    source_document_id: Optional[int] = None
    verification_status: str
    source_document: Optional[SourceDocumentResponse] = None


# ==========================================
# CREDIT CARD CATALOG SCHEMAS
# ==========================================

class CreditCardListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    issuer: str
    card_name: str
    network: str
    card_category: str
    annual_fee: Optional[float] = None
    joining_fee: Optional[float] = None
    fee_waiver_conditions: Optional[str] = None
    forex_markup: Optional[str] = None
    eligibility_summary: Optional[str] = None
    official_url: str
    application_url: Optional[str] = None
    fuel_surcharge_benefit: Optional[str] = None
    lounge_access_summary: Optional[str] = None
    upi_enabled: bool
    rupay_on_upi_supported: bool
    status: str
    last_verified_at: datetime


class CreditCardDetailResponse(CreditCardListResponse):
    reward_rules: List[RewardRuleResponse] = []


# ==========================================
# UPI APPLICATION SCHEMAS
# ==========================================

class UpiApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    app_name: str
    official_url: str
    official_help_url: Optional[str] = None
    supported_payment_methods: str
    bank_account_upi_supported: bool
    rupay_cc_on_upi_supported: bool
    merchant_payment_supported: bool
    p2p_supported: bool
    published_programs_summary: Optional[str] = None
    last_verified_at: datetime


# ==========================================
# REWARD OFFER SCHEMAS
# ==========================================

class RewardOfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    offer_name: str
    issuer: str
    merchant: str
    associated_card_id: Optional[int] = None
    associated_upi_app_id: Optional[int] = None
    offer_type: str
    reward_rate: Optional[float] = None
    fixed_reward_amount: Optional[float] = None
    minimum_transaction_amount: Optional[float] = None
    maximum_reward_amount: Optional[float] = None
    eligible_categories: Optional[str] = None
    eligible_user_conditions: Optional[str] = None
    excluded_transactions: Optional[str] = None
    stacking_rules: Optional[str] = None
    effective_from: date
    effective_until: date
    source_document_id: Optional[int] = None
    verification_status: str
    source_document: Optional[SourceDocumentResponse] = None
    associated_card: Optional[CreditCardListResponse] = None
    associated_upi_app: Optional[UpiApplicationResponse] = None


# ==========================================
# AUDIT & ADMIN SCHEMAS
# ==========================================

class RewardProgramChangeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    related_entity_type: str
    related_entity_id: int
    field_changed: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    source_document_id: Optional[int] = None
    detected_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None


class IngestionStatusResponse(BaseModel):
    status: str
    last_run_at: Optional[datetime] = None
    documents_scanned: int
    records_updated: int
    changes_detected: int
    errors_logged: int
    summary_message: str


class ValidationReportResponse(BaseModel):
    total_cards_verified: int
    total_rules_verified: int
    total_upi_apps_verified: int
    total_active_offers: int
    total_expired_offers: int
    anomalies_detected: int
    conflicts_count: int
    requires_review_count: int
    anomalies: List[str]


# ==========================================
# RAG POLICY QUERY SCHEMAS
# ==========================================

class RAGCitation(BaseModel):
    source_title: str
    publisher: str
    source_url: str
    document_type: str
    effective_dates: Optional[str] = None
    passage_snippet: str
    relevance_score: float


class RAGQueryRequest(BaseModel):
    query: str
    category_filter: Optional[str] = None
    issuer_filter: Optional[str] = None
    target_date: Optional[date] = None


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    verified_recommendation: Optional[str] = None
    deterministic_rule_match: Optional[str] = None
    citations: List[RAGCitation]
    confidence_level: str  # verified_official, partial_policy, needs_review
