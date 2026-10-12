import sys
import os
import unittest
from datetime import date

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from main import app
from database import engine, Base, SessionLocal
import models
from services.ingestion_service import IngestionService


class TestV1CatalogAndRAG(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Ensures test database tables and seed catalog data are initialized."""
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        IngestionService.run_ingestion(db)
        db.close()
        cls.client = TestClient(app)

    def test_01_list_cards(self):
        """Tests GET /api/v1/cards and filtering by issuer and UPI capability."""
        res = self.client.get("/api/v1/cards")
        self.assertEqual(res.status_code, 200)
        cards = res.json()
        self.assertGreaterEqual(len(cards), 8)

        # Filter by issuer
        res_hdfc = self.client.get("/api/v1/cards?issuer=HDFC")
        self.assertEqual(res_hdfc.status_code, 200)
        hdfc_cards = res_hdfc.json()
        self.assertTrue(all("HDFC" in c["issuer"] for c in hdfc_cards))
        self.assertGreaterEqual(len(hdfc_cards), 3)

        # Filter by UPI enabled
        res_upi = self.client.get("/api/v1/cards?upi_enabled=true")
        self.assertEqual(res_upi.status_code, 200)
        upi_cards = res_upi.json()
        self.assertTrue(all(c["upi_enabled"] is True for c in upi_cards))
        self.assertTrue(any("Tata Neu" in c["card_name"] for c in upi_cards))

    def test_02_card_detail_and_rewards(self):
        """Tests GET /api/v1/cards/{id} and /api/v1/cards/{id}/rewards."""
        res = self.client.get("/api/v1/cards/1")
        self.assertEqual(res.status_code, 200)
        card = res.json()
        self.assertEqual(card["card_name"], "HDFC Regalia Gold Credit Card")
        self.assertTrue(card["official_url"].startswith("http"))

        res_rewards = self.client.get("/api/v1/cards/1/rewards")
        self.assertEqual(res_rewards.status_code, 200)
        rules = res_rewards.json()
        self.assertGreaterEqual(len(rules), 2)
        self.assertTrue(any(r["reward_type"] == "points_per_spend" for r in rules))
        self.assertTrue(all(r["exclusions"] is not None for r in rules))

    def test_03_upi_applications(self):
        """Tests GET /api/v1/upi/apps and RuPay CC on UPI support."""
        res = self.client.get("/api/v1/upi/apps")
        self.assertEqual(res.status_code, 200)
        apps = res.json()
        self.assertGreaterEqual(len(apps), 5)

        app_names = [a["app_name"] for a in apps]
        self.assertIn("Google Pay", app_names)
        self.assertIn("PhonePe", app_names)
        self.assertIn("Paytm", app_names)
        self.assertIn("BHIM (NPCI)", app_names)

        # Test individual app
        gpay_id = next(a["id"] for a in apps if a["app_name"] == "Google Pay")
        res_gpay = self.client.get(f"/api/v1/upi/apps/{gpay_id}")
        self.assertEqual(res_gpay.status_code, 200)
        self.assertTrue(res_gpay.json()["rupay_cc_on_upi_supported"])

    def test_04_active_offers_with_date_filtering(self):
        """Tests GET /api/v1/offers/active with strict date validation."""
        # Active in 2026
        res_2026 = self.client.get("/api/v1/offers/active?date=2026-10-15")
        self.assertEqual(res_2026.status_code, 200)
        active_2026 = res_2026.json()
        self.assertGreaterEqual(len(active_2026), 5)
        self.assertTrue(all(o["verification_status"] == "verified" for o in active_2026))

        # Historical date where offers did not exist
        res_past = self.client.get("/api/v1/offers/active?date=2020-01-01")
        self.assertEqual(res_past.status_code, 200)
        self.assertEqual(len(res_past.json()), 0)

        # Far future expired date
        res_future = self.client.get("/api/v1/offers/active?date=2030-01-01")
        self.assertEqual(res_future.status_code, 200)
        self.assertEqual(len(res_future.json()), 0)

    def test_05_source_document(self):
        """Tests GET /api/v1/sources/{id} returns SHA-256 hash and official URL."""
        res = self.client.get("/api/v1/sources/1")
        self.assertEqual(res.status_code, 200)
        doc = res.json()
        self.assertEqual(len(doc["content_hash"]), 64)
        self.assertEqual(doc["publisher"], "HDFC Bank Ltd.")
        self.assertIn("hdfcbank.com", doc["source_url"])

    def test_06_admin_validation(self):
        """Tests POST /api/v1/admin/data/validate for deterministic anomaly detection."""
        res = self.client.post("/api/v1/admin/data/validate")
        self.assertEqual(res.status_code, 200)
        report = res.json()
        self.assertEqual(report["anomalies_detected"], 0)
        self.assertGreaterEqual(report["total_cards_verified"], 8)
        self.assertGreaterEqual(report["total_rules_verified"], 18)

    def test_07_rag_query_engine(self):
        """Tests POST /api/v1/rag/query for grounded answers and verifiable citations."""
        payload = {
            "query": "Which of my supported cards earns rewards on eligible UPI merchant payments?"
        }
        res = self.client.post("/api/v1/rag/query", json=payload)
        self.assertEqual(res.status_code, 200)
        rag = res.json()
        self.assertIn("Tata Neu Infinity", rag["answer"])
        self.assertIn("P2M", rag["answer"])
        self.assertGreaterEqual(len(rag["citations"]), 1)
        self.assertEqual(rag["confidence_level"], "verified_official")
        self.assertTrue(rag["citations"][0]["source_url"].startswith("http"))


if __name__ == "__main__":
    unittest.main()
