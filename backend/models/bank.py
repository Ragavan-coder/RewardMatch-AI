from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class BankAccountRecord(Base):
    """Stores user bank accounts and linked UPI VPAs in the SQL database."""
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(50), default="Savings")
    account_number_masked = Column(String(30), nullable=False)
    ifsc_code = Column(String(20), nullable=True)
    account_holder_name = Column(String(100), nullable=True)
    upi_id = Column(String(100), nullable=True)
    primary_upi_app = Column(String(50), default="Google Pay")
    is_primary = Column(Boolean, default=True)
    rupay_credit_linked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="bank_accounts")
