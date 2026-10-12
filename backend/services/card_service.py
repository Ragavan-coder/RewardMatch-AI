from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import models
import schemas


class CardService:
    """Handles credit card queries, limit updates, and swipe simulations."""

    @staticmethod
    def list_cards(db: Session, user_id: Optional[int] = None) -> List[models.CreditCardRecord]:
        query = db.query(models.CreditCardRecord)
        if user_id:
            cards = query.filter(models.CreditCardRecord.user_id == user_id).all()
            if cards:
                return cards
        return query.all()

    @staticmethod
    def simulate_swipe(db: Session, payload: schemas.SimulateSwipeRequest) -> schemas.SimulateSwipeResponse:
        card = db.query(models.CreditCardRecord).filter(models.CreditCardRecord.id == payload.card_id).first()
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")

        # Determine multiplier based on category
        cat_lower = payload.category.lower()
        if "dining" in cat_lower or "food" in cat_lower:
            rate_pct = card.dining_multiplier
        elif "flight" in cat_lower or "travel" in cat_lower or "hotel" in cat_lower:
            rate_pct = card.travel_multiplier
        elif "shop" in cat_lower or "mart" in cat_lower or "electronic" in cat_lower:
            rate_pct = card.shopping_multiplier
        else:
            rate_pct = 2.0  # baseline

        cashback = round((payload.amount * rate_pct) / 100.0, 2)
        points_gained = int(payload.amount * 0.1)

        # Update card balance in SQL database
        card.cashback_earned += int(cashback)
        card.reward_points += points_gained
        card.available_limit = max(0, card.available_limit - int(payload.amount))
        db.commit()

        return schemas.SimulateSwipeResponse(
            card_name=card.name,
            amount=payload.amount,
            category=payload.category,
            rate=f"{rate_pct}% Cashback",
            cashback_earned=cashback,
            new_reward_points=card.reward_points,
            status="Transaction Approved",
        )
