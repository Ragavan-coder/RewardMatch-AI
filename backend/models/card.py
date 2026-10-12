from sqlalchemy import Column, ForeignKey, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from database import Base


class CreditCardRecord(Base):
    """Stores credit card account details, limits, and reward rates."""
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=True)
    nickname = Column(String(100), nullable=True)
    tier = Column(String(50), default="Platinum")
    card_number_masked = Column(String(30), nullable=False)
    network = Column(String(30), default="VISA")
    accent_color = Column(String(20), default="#FF263D")
    credit_limit = Column(Integer, default=150000)
    available_limit = Column(Integer, default=124500)
    reward_points = Column(Integer, default=14850)
    cashback_earned = Column(Integer, default=18450)
    annual_fee = Column(Integer, default=2999)
    dining_multiplier = Column(Float, default=10.0)
    travel_multiplier = Column(Float, default=5.0)
    shopping_multiplier = Column(Float, default=3.0)
    rupay_on_upi_linked = Column(Boolean, default=False)

    owner = relationship("User", back_populates="cards")
