"""
Data Ingestion, Deterministic Validation, Change Detection, and Expiry Engine.
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from services.catalog_data import (
    compute_sha256,
    OFFICIAL_SOURCE_DOCUMENTS,
    OFFICIAL_CREDIT_CARDS,
    OFFICIAL_REWARD_RULES,
    OFFICIAL_UPI_APPLICATIONS,
    OFFICIAL_REWARD_OFFERS,
)


class IngestionService:
    """Manages the lifecycle of financial policy ingestion, integrity hashing, and validation."""

    _last_run_time: Optional[datetime] = None
    _last_summary: str = "Ingestion pipeline initialized."

    @classmethod
    def run_ingestion(cls, db: Session) -> Dict[str, Any]:
        """Ingests official documents, credit cards, UPI apps, and offers with change detection."""
        cls._last_run_time = datetime.utcnow()
        documents_scanned = 0
        records_updated = 0
        changes_detected = 0
        errors_logged = 0

        try:
            # 1. Ingest Source Documents
            doc_id_map: Dict[int, int] = {}
            for doc_data in OFFICIAL_SOURCE_DOCUMENTS:
                documents_scanned += 1
                content_hash = compute_sha256(doc_data["raw_content"])

                existing_doc = (
                    db.query(models.SourceDocument)
                    .filter(models.SourceDocument.source_url == doc_data["source_url"])
                    .first()
                )

                if existing_doc:
                    # Check for content change
                    if existing_doc.content_hash != content_hash:
                        # Log change
                        change = models.RewardProgramChange(
                            related_entity_type="SourceDocument",
                            related_entity_id=existing_doc.id,
                            field_changed="content_hash",
                            previous_value=existing_doc.content_hash,
                            new_value=content_hash,
                            source_document_id=existing_doc.id,
                            detected_at=datetime.utcnow(),
                        )
                        db.add(change)
                        changes_detected += 1

                        existing_doc.content_hash = content_hash
                        existing_doc.raw_content = doc_data["raw_content"]
                        existing_doc.retrieved_at = datetime.utcnow()
                        existing_doc.verification_status = "verified"
                        records_updated += 1
                    doc_id_map[doc_data["id"]] = existing_doc.id
                else:
                    new_doc = models.SourceDocument(
                        title=doc_data["title"],
                        publisher=doc_data["publisher"],
                        source_url=doc_data["source_url"],
                        document_type=doc_data["document_type"],
                        publication_date=doc_data["publication_date"],
                        effective_from=doc_data["effective_from"],
                        effective_until=doc_data["effective_until"],
                        retrieved_at=datetime.utcnow(),
                        content_hash=content_hash,
                        raw_content=doc_data["raw_content"],
                        verification_status="verified",
                    )
                    db.add(new_doc)
                    db.flush()
                    doc_id_map[doc_data["id"]] = new_doc.id
                    records_updated += 1

            # 2. Ingest Credit Cards
            card_id_map: Dict[int, int] = {}
            for card_data in OFFICIAL_CREDIT_CARDS:
                existing_card = (
                    db.query(models.CreditCard)
                    .filter(
                        models.CreditCard.issuer == card_data["issuer"],
                        models.CreditCard.card_name == card_data["card_name"],
                    )
                    .first()
                )

                if existing_card:
                    # Check for rate or fee adjustments
                    if existing_card.annual_fee != card_data["annual_fee"]:
                        change = models.RewardProgramChange(
                            related_entity_type="CreditCard",
                            related_entity_id=existing_card.id,
                            field_changed="annual_fee",
                            previous_value=str(existing_card.annual_fee),
                            new_value=str(card_data["annual_fee"]),
                            source_document_id=doc_id_map.get(1),
                            detected_at=datetime.utcnow(),
                        )
                        db.add(change)
                        changes_detected += 1
                        existing_card.annual_fee = card_data["annual_fee"]

                    existing_card.last_verified_at = datetime.utcnow()
                    existing_card.status = card_data["status"]
                    card_id_map[card_data["id"]] = existing_card.id
                    records_updated += 1
                else:
                    new_card = models.CreditCard(
                        issuer=card_data["issuer"],
                        card_name=card_data["card_name"],
                        network=card_data["network"],
                        card_category=card_data["card_category"],
                        annual_fee=card_data["annual_fee"],
                        joining_fee=card_data["joining_fee"],
                        fee_waiver_conditions=card_data["fee_waiver_conditions"],
                        forex_markup=card_data["forex_markup"],
                        eligibility_summary=card_data["eligibility_summary"],
                        official_url=card_data["official_url"],
                        application_url=card_data["application_url"],
                        fuel_surcharge_benefit=card_data["fuel_surcharge_benefit"],
                        lounge_access_summary=card_data["lounge_access_summary"],
                        upi_enabled=card_data["upi_enabled"],
                        rupay_on_upi_supported=card_data["rupay_on_upi_supported"],
                        status=card_data["status"],
                        last_verified_at=datetime.utcnow(),
                    )
                    db.add(new_card)
                    db.flush()
                    card_id_map[card_data["id"]] = new_card.id
                    records_updated += 1

            # 3. Ingest Reward Rules
            for rule_data in OFFICIAL_REWARD_RULES:
                actual_card_id = card_id_map.get(rule_data["card_id"])
                actual_doc_id = doc_id_map.get(rule_data["source_document_id"])
                if not actual_card_id:
                    continue

                existing_rule = (
                    db.query(models.RewardRule)
                    .filter(
                        models.RewardRule.card_id == actual_card_id,
                        models.RewardRule.transaction_category == rule_data["transaction_category"],
                    )
                    .first()
                )

                if existing_rule:
                    if existing_rule.reward_rate != rule_data["reward_rate"]:
                        change = models.RewardProgramChange(
                            related_entity_type="RewardRule",
                            related_entity_id=existing_rule.id,
                            field_changed="reward_rate",
                            previous_value=str(existing_rule.reward_rate),
                            new_value=str(rule_data["reward_rate"]),
                            source_document_id=actual_doc_id,
                            detected_at=datetime.utcnow(),
                        )
                        db.add(change)
                        changes_detected += 1
                        existing_rule.reward_rate = rule_data["reward_rate"]
                    existing_rule.verification_status = "verified"
                else:
                    new_rule = models.RewardRule(
                        card_id=actual_card_id,
                        transaction_category=rule_data["transaction_category"],
                        merchant_restrictions=rule_data["merchant_restrictions"],
                        reward_type=rule_data["reward_type"],
                        reward_rate=rule_data["reward_rate"],
                        points_per_amount=rule_data["points_per_amount"],
                        eligible_transaction_types=rule_data["eligible_transaction_types"],
                        minimum_spend=rule_data["minimum_spend"],
                        maximum_reward=rule_data["maximum_reward"],
                        reward_cap_period=rule_data["reward_cap_period"],
                        redemption_value=rule_data["redemption_value"],
                        redemption_options=rule_data["redemption_options"],
                        redemption_fee=rule_data["redemption_fee"],
                        exclusions=rule_data["exclusions"],
                        effective_from=rule_data["effective_from"],
                        effective_until=rule_data["effective_until"],
                        source_document_id=actual_doc_id,
                        verification_status="verified",
                    )
                    db.add(new_rule)
                    records_updated += 1

            # 4. Ingest UPI Applications
            upi_app_map: Dict[int, int] = {}
            for app_data in OFFICIAL_UPI_APPLICATIONS:
                existing_app = (
                    db.query(models.UpiApplication)
                    .filter(models.UpiApplication.app_name == app_data["app_name"])
                    .first()
                )
                if existing_app:
                    existing_app.last_verified_at = datetime.utcnow()
                    upi_app_map[app_data["id"]] = existing_app.id
                    records_updated += 1
                else:
                    new_app = models.UpiApplication(
                        app_name=app_data["app_name"],
                        official_url=app_data["official_url"],
                        official_help_url=app_data["official_help_url"],
                        supported_payment_methods=app_data["supported_payment_methods"],
                        bank_account_upi_supported=app_data["bank_account_upi_supported"],
                        rupay_cc_on_upi_supported=app_data["rupay_cc_on_upi_supported"],
                        merchant_payment_supported=app_data["merchant_payment_supported"],
                        p2p_supported=app_data["p2p_supported"],
                        published_programs_summary=app_data["published_programs_summary"],
                        last_verified_at=datetime.utcnow(),
                    )
                    db.add(new_app)
                    db.flush()
                    upi_app_map[app_data["id"]] = new_app.id
                    records_updated += 1

            # 5. Ingest Reward Offers
            for offer_data in OFFICIAL_REWARD_OFFERS:
                actual_card_id = card_id_map.get(offer_data["associated_card_id"]) if offer_data["associated_card_id"] else None
                actual_upi_id = upi_app_map.get(offer_data["associated_upi_app_id"]) if offer_data["associated_upi_app_id"] else None
                actual_doc_id = doc_id_map.get(offer_data["source_document_id"])

                existing_offer = (
                    db.query(models.RewardOffer)
                    .filter(
                        models.RewardOffer.offer_name == offer_data["offer_name"],
                        models.RewardOffer.merchant == offer_data["merchant"],
                    )
                    .first()
                )

                if existing_offer:
                    existing_offer.effective_until = offer_data["effective_until"]
                    existing_offer.verification_status = "verified"
                else:
                    new_offer = models.RewardOffer(
                        offer_name=offer_data["offer_name"],
                        issuer=offer_data["issuer"],
                        merchant=offer_data["merchant"],
                        associated_card_id=actual_card_id,
                        associated_upi_app_id=actual_upi_id,
                        offer_type=offer_data["offer_type"],
                        reward_rate=offer_data["reward_rate"],
                        fixed_reward_amount=offer_data["fixed_reward_amount"],
                        minimum_transaction_amount=offer_data["minimum_transaction_amount"],
                        maximum_reward_amount=offer_data["maximum_reward_amount"],
                        eligible_categories=offer_data["eligible_categories"],
                        eligible_user_conditions=offer_data["eligible_user_conditions"],
                        excluded_transactions=offer_data["excluded_transactions"],
                        stacking_rules=offer_data["stacking_rules"],
                        effective_from=offer_data["effective_from"],
                        effective_until=offer_data["effective_until"],
                        source_document_id=actual_doc_id,
                        verification_status="verified",
                    )
                    db.add(new_offer)
                    records_updated += 1

            # Run offer expiry pass
            today = date.today()
            expired_offers = (
                db.query(models.RewardOffer)
                .filter(models.RewardOffer.effective_until < today)
                .all()
            )
            for exp in expired_offers:
                exp.verification_status = "expired"

            db.commit()
            cls._last_summary = f"Successfully scanned {documents_scanned} documents; committed {records_updated} records."
        except Exception as e:
            db.rollback()
            errors_logged += 1
            cls._last_summary = f"Ingestion error: {str(e)}"
            raise

        return {
            "status": "success",
            "documents_scanned": documents_scanned,
            "records_updated": records_updated,
            "changes_detected": changes_detected,
            "errors_logged": errors_logged,
            "summary_message": cls._last_summary,
            "timestamp": datetime.utcnow().isoformat(),
        }

    @classmethod
    def validate_catalog(cls, db: Session) -> Dict[str, Any]:
        """Runs deterministic validations across all financial models and detects anomalies."""
        anomalies: List[str] = []
        today = date.today()

        cards = db.query(models.CreditCard).all()
        rules = db.query(models.RewardRule).all()
        upi_apps = db.query(models.UpiApplication).all()
        offers = db.query(models.RewardOffer).all()
        conflicts = db.query(models.RewardProgramChange).count()

        # Validate Cards
        for card in cards:
            if card.annual_fee is not None and card.annual_fee < 0:
                anomalies.append(f"Card '{card.card_name}' has negative annual fee: {card.annual_fee}")
            if not card.official_url or not card.official_url.startswith("http"):
                anomalies.append(f"Card '{card.card_name}' missing valid official URL.")
            if card.rupay_on_upi_supported and card.network.lower() != "rupay":
                anomalies.append(f"Card '{card.card_name}' claims RuPay on UPI support but network is {card.network}.")

        # Validate Reward Rules
        for rule in rules:
            if rule.reward_rate is not None and rule.reward_rate < 0:
                anomalies.append(f"Rule ID {rule.id} has negative reward rate: {rule.reward_rate}")
            if rule.minimum_spend is not None and rule.minimum_spend < 0:
                anomalies.append(f"Rule ID {rule.id} has negative minimum spend.")
            if rule.effective_from and rule.effective_until and rule.effective_from > rule.effective_until:
                anomalies.append(f"Rule ID {rule.id} effective_from is after effective_until.")

        # Validate Offers
        active_offers_count = 0
        expired_offers_count = 0
        for offer in offers:
            if offer.effective_until < today:
                expired_offers_count += 1
                if offer.verification_status != "expired":
                    offer.verification_status = "expired"
                    db.commit()
            else:
                active_offers_count += 1

            if offer.effective_from > offer.effective_until:
                anomalies.append(f"Offer '{offer.offer_name}' has invalid date range.")
            if offer.minimum_transaction_amount is not None and offer.minimum_transaction_amount < 0:
                anomalies.append(f"Offer '{offer.offer_name}' has negative minimum transaction amount.")

        # Validate UPI Apps
        for app in upi_apps:
            if not app.official_url or not app.official_url.startswith("http"):
                anomalies.append(f"UPI app '{app.app_name}' missing official URL.")

        return {
            "total_cards_verified": len(cards),
            "total_rules_verified": len(rules),
            "total_upi_apps_verified": len(upi_apps),
            "total_active_offers": active_offers_count,
            "total_expired_offers": expired_offers_count,
            "anomalies_detected": len(anomalies),
            "conflicts_count": conflicts,
            "requires_review_count": len([c for c in cards if c.status == "requires_verification"]),
            "anomalies": anomalies,
        }

    @classmethod
    def get_status(cls, db: Session) -> Dict[str, Any]:
        """Returns the status and metrics of the ingestion engine."""
        doc_count = db.query(func.count(models.SourceDocument.id)).scalar() or 0
        card_count = db.query(func.count(models.CreditCard.id)).scalar() or 0
        rule_count = db.query(func.count(models.RewardRule.id)).scalar() or 0
        offer_count = db.query(func.count(models.RewardOffer.id)).scalar() or 0
        changes_count = db.query(func.count(models.RewardProgramChange.id)).scalar() or 0

        return {
            "status": "ready" if doc_count > 0 else "needs_seed",
            "last_run_at": cls._last_run_time or datetime.utcnow(),
            "documents_scanned": doc_count,
            "records_updated": card_count + rule_count + offer_count,
            "changes_detected": changes_count,
            "errors_logged": 0,
            "summary_message": cls._last_summary,
        }
