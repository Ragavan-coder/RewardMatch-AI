from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for yielding database session with automatic closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Ensures existing SQL tables have all newly added columns."""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    with engine.begin() as conn:
        if "users" in table_names:
            columns = [col["name"] for col in inspector.get_columns("users")]
            if "phone" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
            if "monthly_spend" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN monthly_spend INTEGER DEFAULT 50000"))
            if "primary_category" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN primary_category VARCHAR(50) DEFAULT 'Shopping'"))
            if "primary_bank" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN primary_bank VARCHAR(100)"))
            if "primary_upi_id" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN primary_upi_id VARCHAR(100)"))
            if "primary_upi_app" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN primary_upi_app VARCHAR(50) DEFAULT 'Google Pay'"))
            if "profile_completed" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT 0"))

            if "country" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR(50) DEFAULT 'India'"))
            if "currency" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'"))
            if "timezone" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'"))
            if "monthly_savings_goal" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN monthly_savings_goal INTEGER DEFAULT 5000"))
            if "preferred_stores" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN preferred_stores VARCHAR(255) DEFAULT 'Amazon India, Flipkart, Myntra'"))
            if "email_verified" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1"))
            if "consent_terms" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN consent_terms BOOLEAN DEFAULT 1"))

        if "credit_cards" in table_names:
            cc_columns = [col["name"] for col in inspector.get_columns("credit_cards")]
            if "bank_name" not in cc_columns:
                conn.execute(text("ALTER TABLE credit_cards ADD COLUMN bank_name VARCHAR(100)"))
            if "rupay_on_upi_linked" not in cc_columns:
                conn.execute(text("ALTER TABLE credit_cards ADD COLUMN rupay_on_upi_linked BOOLEAN DEFAULT 0"))

        if "transactions" in table_names:
            tx_columns = [col["name"] for col in inspector.get_columns("transactions")]
            if "currency" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'"))
            if "payment_method" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Credit Card'"))
            if "payment_app_used" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN payment_app_used VARCHAR(50)"))
            if "confirmed_instant_discount" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN confirmed_instant_discount DECIMAL(12,2) DEFAULT 0.00"))
            if "confirmed_cashback" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN confirmed_cashback DECIMAL(12,2) DEFAULT 0.00"))
            if "confirmed_redeemed_reward" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN confirmed_redeemed_reward DECIMAL(12,2) DEFAULT 0.00"))
            if "pending_reward" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN pending_reward DECIMAL(12,2) DEFAULT 0.00"))
            if "estimated_reward" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN estimated_reward DECIMAL(12,2) DEFAULT 0.00"))
            if "potential_savings" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN potential_savings DECIMAL(12,2) DEFAULT 0.00"))
            if "reward_status" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN reward_status VARCHAR(30) DEFAULT 'Confirmed'"))
            if "source" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN source VARCHAR(50) DEFAULT 'manual_entry'"))
            if "verification_notes" not in tx_columns:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN verification_notes TEXT"))

