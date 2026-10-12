import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from models.activity import ActivityEvent


class ActivityService:
    """Manages immutable chronological activity timeline and audit events."""

    @staticmethod
    def record_event(
        db: Session,
        user_id: int,
        category: str,
        event_type: str,
        description: str,
        related_entity_id: Optional[str] = None,
        related_entity_type: Optional[str] = None,
        status: str = "confirmed",
        source: str = "system",
        meta_data: Optional[Dict[str, Any]] = None,
        display_timezone: str = "Asia/Kolkata",
    ) -> ActivityEvent:
        """Records an audit event in the database."""
        event = ActivityEvent(
            user_id=user_id,
            category=category,
            event_type=event_type,
            description=description,
            timestamp=datetime.utcnow(),
            display_timezone=display_timezone,
            related_entity_id=related_entity_id,
            related_entity_type=related_entity_type,
            status=status,
            source=source,
            meta_data=json.dumps(meta_data or {}),
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get_user_events(
        db: Session,
        user_id: int,
        category: Optional[str] = None,
        event_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ActivityEvent]:
        """Fetches chronological activity events with optional filtering."""
        query = db.query(ActivityEvent).filter(ActivityEvent.user_id == user_id)
        if category and category != "all":
            query = query.filter(ActivityEvent.category == category)
        if event_type:
            query = query.filter(ActivityEvent.event_type == event_type)
        return query.order_by(ActivityEvent.timestamp.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def seed_initial_activity(db: Session, user_id: int):
        """Seeds initial historical events if user history is brand new."""
        existing = db.query(ActivityEvent).filter(ActivityEvent.user_id == user_id).first()
        if existing:
            return

        initial_events = [
            ("account", "account_created", "Account created and secured with bank-grade encryption", "confirmed", "manual"),
            ("card", "card_added", "Linked Tata Neu Infinity HDFC Bank (RuPay on UPI enabled)", "confirmed", "manual"),
            ("bank", "bank_profile_updated", "Configured HDFC Bank Salary account & UPI VPA", "confirmed", "manual"),
            ("offer", "offer_discovered", "Discovered 5% NeuCoins reward boost on Croma & BigBasket", "confirmed", "engine"),
            ("transaction", "purchase_recorded", "Transaction of ₹3,499 on Swiggy Instamart evaluated for cashback", "confirmed", "simulated_swipe"),
            ("reward", "cashback_confirmed", "Confirmed ₹175 cashback for dining & supermarket spend", "confirmed", "engine"),
        ]
        for cat, ev_type, desc, stat, src in initial_events:
            ActivityService.record_event(
                db,
                user_id=user_id,
                category=cat,
                event_type=ev_type,
                description=desc,
                status=stat,
                source=src,
            )
