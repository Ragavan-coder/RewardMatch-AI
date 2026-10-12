from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class RewardRecord(Base):
    """Stores vouchers, coupon codes, and scratch card rewards."""
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(120), nullable=False)
    value = Column(String(50), nullable=False)
    reward_type = Column(String(50), default="voucher")  # voucher, discount, cashback, travel
    code = Column(String(50), nullable=False)
    category = Column(String(50), default="Shopping")
    expiry = Column(String(30), default="31 Dec 2025")
    is_claimed = Column(Boolean, default=False)
    is_revealed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="rewards")
