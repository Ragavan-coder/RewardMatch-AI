import os
import sys
import unittest
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


import models
from services.savings_service import SavingsService
from services.activity_service import ActivityService
from services.monitoring_service import MonitoringService
from services.report_service import WeeklyReportService
from services.notification_service import NotificationService


class TestMasterPlatform(unittest.TestCase):
    """Test suite covering the master enterprise platform features."""

    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Create test user
        self.test_user = models.User(
            id=1,
            name="Test User",
            email="test.master@example.com",
            hashed_password="hashed_pw_test",
            country="India",
            currency="INR",
            timezone="Asia/Kolkata",
            monthly_spend=50000,
            monthly_savings_goal=5000,
            primary_category="Shopping",
            email_verified=True,
            consent_terms=True,
        )
        self.db.merge(self.test_user)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_decimal_savings_buckets_and_strict_separation(self):
        """Validates that Decimal calculations separate realized from potential savings."""
        tx1 = models.TransactionRecord(
            user_id=1,
            merchant="Amazon India",
            category="Electronics",
            amount=Decimal("10000.00"),
            confirmed_instant_discount=Decimal("1000.00"),
            confirmed_cashback=Decimal("500.00"),
            confirmed_redeemed_reward=Decimal("200.00"),
            pending_reward=Decimal("150.00"),
            estimated_reward=Decimal("300.00"),
            potential_savings=Decimal("1200.00"),
        )
        self.db.add(tx1)
        self.db.commit()

        summary = SavingsService.get_savings_summary(self.db, user_id=1)
        
        # Realized = 1000 + 500 + 200 = 1700
        self.assertEqual(summary["total_realized_savings"], 1700.0)
        self.assertEqual(summary["buckets"]["confirmed_instant_discount"], 1000.0)
        self.assertEqual(summary["buckets"]["confirmed_cashback"], 500.0)
        self.assertEqual(summary["buckets"]["confirmed_redeemed_reward"], 200.0)
        
        # Potential savings must be strictly 1200 and NOT included in total_realized_savings
        self.assertEqual(summary["buckets"]["potential_savings"], 1200.0)
        self.assertNotEqual(summary["total_realized_savings"], 1700.0 + 1200.0)

    def test_activity_timeline_logging(self):
        """Verifies chronological activity event logging."""
        event = ActivityService.record_event(
            self.db,
            user_id=1,
            category="card",
            event_type="card_added",
            description="Linked Tata Neu RuPay card",
            status="confirmed",
        )
        self.assertIsNotNone(event.id)
        events = ActivityService.get_user_events(self.db, user_id=1, category="card")
        self.assertTrue(any(e.id == event.id for e in events))

    def test_merchant_monitoring(self):
        """Verifies merchant list and product tracking."""
        MonitoringService.ensure_merchants(self.db)
        merchants = self.db.query(models.Merchant).all()
        self.assertGreaterEqual(len(merchants), 6)
        
        product = MonitoringService.add_tracked_product(
            self.db,
            user_id=1,
            title="Sony Wireless Headphones",
            merchant_name="Amazon India",
            current_price=24999.0,
            target_price=22000.0,
        )
        self.assertIsNotNone(product.id)
        self.assertEqual(product.merchant_name, "Amazon India")

    def test_weekly_report_sections_generation(self):
        """Verifies compilation of all 7 sections (A-G) in weekly reports."""
        report = WeeklyReportService.generate_report_for_user(self.db, user_id=1)
        self.assertIsNotNone(report.id)
        self.assertIn("A_overview", report.report_sections_json)
        self.assertIn("B_spending_analysis", report.report_sections_json)
        self.assertIn("C_rewards_performance", report.report_sections_json)
        self.assertIn("D_shopping_activity", report.report_sections_json)
        self.assertIn("E_best_opportunities", report.report_sections_json)
        self.assertIn("F_security_activity", report.report_sections_json)
        self.assertIn("G_recommendations", report.report_sections_json)

    def test_notification_service(self):
        """Verifies notification creation and preference management."""
        pref = NotificationService.update_preferences(
            self.db,
            user_id=1,
            email_alerts=True,
            in_app_alerts=True,
            min_price_drop=10,
            weekly_report_day="Sunday",
        )
        self.assertEqual(pref.min_price_drop_percent, 10)
        self.assertEqual(pref.weekly_report_day, "Sunday")


if __name__ == "__main__":
    unittest.main()
