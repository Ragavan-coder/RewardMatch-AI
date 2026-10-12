from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Stores user accounts with credentials, preferences, and security profile."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    phone = Column(String(20), nullable=True)
    
    # Financial Lifestyle & Preferences
    country = Column(String(50), default="India")
    currency = Column(String(10), default="INR")
    timezone = Column(String(50), default="Asia/Kolkata")
    monthly_spend = Column(Integer, default=50000)
    monthly_savings_goal = Column(Integer, default=5000)
    primary_category = Column(String(50), default="Shopping")
    preferred_stores = Column(String(255), default="Amazon India, Flipkart, Myntra")
    
    # Banking & UPI defaults
    primary_bank = Column(String(100), nullable=True)
    primary_upi_id = Column(String(100), nullable=True)
    primary_upi_app = Column(String(50), default="Google Pay")
    
    # Security, Verification & Status
    email_verified = Column(Boolean, default=True)
    consent_terms = Column(Boolean, default=True)
    profile_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    cards = relationship("CreditCardRecord", back_populates="owner", cascade="all, delete-orphan")
    bank_accounts = relationship("BankAccountRecord", back_populates="owner", cascade="all, delete-orphan")
    rewards = relationship("RewardRecord", back_populates="owner", cascade="all, delete-orphan")
    transactions = relationship("TransactionRecord", back_populates="user", cascade="all, delete-orphan")

