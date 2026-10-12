from datetime import datetime
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
from security import hash_password


def seed_database(db: Session):
    """Populates SQLite/SQL database with initial fintech data if not already present."""
    Base.metadata.create_all(bind=engine)

    demo_email = "ragavan@example.com"
    existing = db.query(models.User).filter(models.User.email == demo_email).first()
    if existing:
        return

    # 1. Primary User
    user = models.User(
        name="Ragavan",
        email=demo_email,
        hashed_password=hash_password("password123"),
        is_demo=False,
        created_at=datetime.utcnow(),
        last_login_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Credit Cards
    cards = [
        models.CreditCardRecord(
            user_id=user.id,
            name="RewardMatch Platinum",
            tier="Platinum",
            card_number_masked="4532 •••• •••• 4242",
            network="VISA",
            accent_color="#FF263D",
            credit_limit=150000,
            available_limit=124500,
            reward_points=14850,
            cashback_earned=18450,
            annual_fee=2999,
            dining_multiplier=10.0,
            travel_multiplier=5.0,
            shopping_multiplier=3.0,
        ),
        models.CreditCardRecord(
            user_id=user.id,
            name="RewardMatch Gold",
            tier="Gold",
            card_number_masked="5552 •••• •••• 5555",
            network="Mastercard",
            accent_color="#E5B567",
            credit_limit=250000,
            available_limit=218000,
            reward_points=28400,
            cashback_earned=24300,
            annual_fee=4999,
            dining_multiplier=5.0,
            travel_multiplier=8.0,
            shopping_multiplier=4.0,
        ),
        models.CreditCardRecord(
            user_id=user.id,
            name="RewardMatch Cashback",
            tier="Cashback",
            card_number_masked="6080 •••• •••• 9010",
            network="RuPay",
            accent_color="#C0C0C0",
            credit_limit=100000,
            available_limit=86200,
            reward_points=8900,
            cashback_earned=12600,
            annual_fee=999,
            dining_multiplier=3.0,
            travel_multiplier=2.0,
            shopping_multiplier=5.0,
        ),
    ]
    db.add_all(cards)

    # 3. Rewards & Vouchers
    rewards = [
        models.RewardRecord(
            user_id=user.id,
            title="Amazon ₹500 Shopping Voucher",
            value="₹500 OFF",
            reward_type="voucher",
            code="AMZ-SHOP-500",
            category="Shopping",
            expiry="31 Dec 2026",
            is_claimed=False,
        ),
        models.RewardRecord(
            user_id=user.id,
            title="MakeMyTrip 15% Flight Discount",
            value="15% OFF",
            reward_type="discount",
            code="FLY-REWARD-15",
            category="Travel",
            expiry="15 Jan 2027",
            is_claimed=False,
        ),
        models.RewardRecord(
            user_id=user.id,
            title="Taj Hotels ₹2,000 Luxury Stay Credit",
            value="₹2,000 OFF",
            reward_type="voucher",
            code="TAJ-LUXURY-2000",
            category="Hotels",
            expiry="28 Feb 2027",
            is_claimed=False,
        ),
        models.RewardRecord(
            user_id=user.id,
            title="Swiggy Gourmet ₹250 Dining Cashback",
            value="₹250 CASHBACK",
            reward_type="cashback",
            code="SWIGGY-DINE-250",
            category="Dining",
            expiry="30 Nov 2026",
            is_claimed=True,
        ),
    ]
    db.add_all(rewards)

    # 4. Recent Transactions
    transactions = [
        models.TransactionRecord(
            user_id=user.id,
            merchant="Taj Hotels & Resorts",
            category="Hotels & Travel",
            amount=14800.0,
            cashback_earned=1480.0,
            card_used="RewardMatch Platinum",
            status="Completed",
        ),
        models.TransactionRecord(
            user_id=user.id,
            merchant="Apple Store BKC",
            category="Luxury Electronics",
            amount=89900.0,
            cashback_earned=7192.0,
            card_used="RewardMatch Gold",
            status="Completed",
        ),
        models.TransactionRecord(
            user_id=user.id,
            merchant="Nature's Basket Gourmet",
            category="Groceries",
            amount=4250.0,
            cashback_earned=212.5,
            card_used="RewardMatch Cashback",
            status="Completed",
        ),
    ]
    db.add_all(transactions)

    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    db.close()
    print("Database seeding completed.")
