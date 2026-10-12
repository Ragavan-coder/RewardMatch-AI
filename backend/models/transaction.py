from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from database import Base


class TransactionRecord(Base):
    """
    Stores user purchases, verification source, payment method, and the 6 distinct
    financial savings categories using Decimal (Numeric) precision.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), default="Credit Card")  # Credit Card, RuPay on UPI, UPI, Debit Card
    card_used = Column(String(100), default="Tata Neu Infinity HDFC Bank")
    payment_app_used = Column(String(50), nullable=True)  # Google Pay, PhonePe, Paytm

    # The 6 strictly distinct savings categories (Financial-grade precision)
    confirmed_instant_discount = Column(Numeric(12, 2), default=0.00)
    confirmed_cashback = Column(Numeric(12, 2), default=0.00)
    confirmed_redeemed_reward = Column(Numeric(12, 2), default=0.00)
    pending_reward = Column(Numeric(12, 2), default=0.00)
    estimated_reward = Column(Numeric(12, 2), default=0.00)
    potential_savings = Column(Numeric(12, 2), default=0.00)  # Kept separate from actual savings

    # Backward compatibility helper column
    cashback_earned = Column(Numeric(12, 2), default=0.00)

    reward_status = Column(String(30), default="Confirmed")  # Confirmed, Pending, Estimated, Rejected
    source = Column(String(50), default="manual_entry")  # manual_entry, csv_upload, bank_sync, simulated_swipe
    verification_notes = Column(Text, nullable=True)
    status = Column(String(20), default="Completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")

