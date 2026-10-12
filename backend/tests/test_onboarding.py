import unittest
import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from database import engine, Base, SessionLocal, run_migrations
import models


class TestAccountCreationAndOnboarding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        run_migrations()
        cls.client = TestClient(app)

    def test_01_register_with_card_and_bank_details(self):
        """Verify that registering an account collects cards, bank accounts, and sets up profile in SQL."""
        unique_email = f"user_{os.urandom(4).hex()}@example.com"
        payload = {
            "name": "Aarav Sharma",
            "email": unique_email,
            "password": "SecurePassword123!",
            "phone": "+91 98765 43210",
            "monthly_spend": 65000,
            "primary_category": "Dining & Grocery",
            "primary_bank": "HDFC Bank",
            "primary_upi_id": "aarav@okhdfcbank",
            "primary_upi_app": "Google Pay",
            "cards": [
                {
                    "name": "HDFC Regalia Gold",
                    "bank_name": "HDFC Bank",
                    "last_4": "4821",
                    "network": "VISA",
                    "credit_limit": 250000,
                    "reward_points": 14000,
                    "rupay_on_upi": False,
                },
                {
                    "name": "Tata Neu Infinity HDFC Bank",
                    "bank_name": "HDFC Bank",
                    "last_4": "9102",
                    "network": "RuPay",
                    "credit_limit": 150000,
                    "reward_points": 8500,
                    "rupay_on_upi": True,
                },
            ],
            "bank_accounts": [
                {
                    "bank_name": "HDFC Bank",
                    "account_type": "Salary",
                    "last_4": "3491",
                    "upi_id": "aarav@okhdfcbank",
                    "primary_upi_app": "Google Pay",
                    "is_primary": True,
                    "rupay_credit_linked": True,
                },
                {
                    "bank_name": "State Bank of India",
                    "account_type": "Savings",
                    "last_4": "8812",
                    "upi_id": "aarav@oksbi",
                    "primary_upi_app": "PhonePe",
                    "is_primary": False,
                    "rupay_credit_linked": False,
                },
            ],
        }

        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertTrue(data["success"])
        user = data["user"]
        self.assertEqual(user["email"], unique_email)
        self.assertEqual(user["phone"], "+91 98765 43210")
        self.assertEqual(user["monthly_spend"], 65000)
        self.assertEqual(user["primary_bank"], "HDFC Bank")
        self.assertEqual(user["primary_upi_id"], "aarav@okhdfcbank")
        self.assertEqual(user["cards_count"], 2)
        self.assertEqual(user["bank_accounts_count"], 2)
        self.assertTrue(user["profile_completed"])

        # Directly verify SQL persistence
        db = SessionLocal()
        try:
            sql_user = db.query(models.User).filter(models.User.email == unique_email).first()
            self.assertIsNotNone(sql_user)
            self.assertEqual(len(sql_user.cards), 2)
            self.assertEqual(len(sql_user.bank_accounts), 2)

            # Check cards in SQL
            card_names = [c.name for c in sql_user.cards]
            self.assertIn("HDFC Regalia Gold", card_names)
            self.assertIn("Tata Neu Infinity HDFC Bank", card_names)

            # Check bank accounts in SQL
            bank_names = [b.bank_name for b in sql_user.bank_accounts]
            self.assertIn("HDFC Bank", bank_names)
            self.assertIn("State Bank of India", bank_names)
        finally:
            db.close()

    def test_02_onboarding_wizard_update(self):
        """Verify that existing user can complete onboarding wizard and persist cards/banks in SQL."""
        unique_email = f"onboard_{os.urandom(4).hex()}@example.com"
        reg_res = self.client.post(
            "/api/auth/register",
            json={"name": "Kavita Rao", "email": unique_email, "password": "Password123!"},
        )
        self.assertEqual(reg_res.status_code, 200)
        user_id = reg_res.json()["user"]["id"]

        # Run onboarding setup
        onboarding_payload = {
            "user_id": user_id,
            "phone": "+91 91234 56789",
            "monthly_spend": 80000,
            "primary_category": "Shopping",
            "primary_bank": "ICICI Bank",
            "primary_upi_id": "kavita@icici",
            "primary_upi_app": "PhonePe",
            "cards": [
                {
                    "name": "Amazon Pay ICICI Bank Credit Card",
                    "bank_name": "ICICI Bank",
                    "last_4": "7712",
                    "network": "VISA",
                    "credit_limit": 200000,
                    "reward_points": 5000,
                    "rupay_on_upi": False,
                }
            ],
            "bank_accounts": [
                {
                    "bank_name": "ICICI Bank",
                    "account_type": "Savings",
                    "last_4": "9921",
                    "upi_id": "kavita@icici",
                    "primary_upi_app": "PhonePe",
                    "is_primary": True,
                    "rupay_credit_linked": False,
                }
            ],
        }

        onboard_res = self.client.post("/api/auth/onboarding", json=onboarding_payload)
        self.assertEqual(onboard_res.status_code, 200, onboard_res.text)
        user_data = onboard_res.json()
        self.assertTrue(user_data["profile_completed"])
        self.assertEqual(user_data["phone"], "+91 91234 56789")
        self.assertEqual(user_data["primary_bank"], "ICICI Bank")

        # Check bank accounts endpoint
        banks_res = self.client.get(f"/api/auth/banks?user_id={user_id}")
        self.assertEqual(banks_res.status_code, 200)
        banks_data = banks_res.json()
        self.assertGreaterEqual(len(banks_data), 1)
        self.assertEqual(banks_data[0]["bank_name"], "ICICI Bank")


if __name__ == "__main__":
    unittest.main()
