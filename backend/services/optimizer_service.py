from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models
import schemas


class OptimizerService:
    """Financial optimization engine calculating highest ROI card for any purchase."""

    @staticmethod
    def calculate_best_card(
        db: Session,
        payload: schemas.OptimizeBestCardRequest
    ) -> schemas.OptimizeBestCardResponse:
        cards = db.query(models.CreditCardRecord).all()
        if not cards:
            return schemas.OptimizeBestCardResponse(
                recommended_card="RewardMatch Platinum",
                tier="Platinum",
                estimated_savings=round(payload.amount * 0.05, 2),
                cashback_rate="5% Baseline",
                reason="Default baseline reward recommendation.",
                alternative_cards=[],
            )

        cat_lower = payload.category.lower()
        scored_cards = []

        for card in cards:
            if "dining" in cat_lower or "food" in cat_lower or "cafe" in cat_lower:
                rate = card.dining_multiplier
                perk = "Highest dining multiplier"
            elif "flight" in cat_lower or "travel" in cat_lower or "hotel" in cat_lower:
                rate = card.travel_multiplier
                perk = "Travel reward rate"
            elif "shop" in cat_lower or "mart" in cat_lower or "electronics" in cat_lower:
                rate = card.shopping_multiplier
                perk = "Shopping cashback benefit"
            else:
                rate = 2.0
                perk = "Base spending reward"

            savings = round((payload.amount * rate) / 100.0, 2)
            scored_cards.append({
                "card_name": card.name,
                "tier": card.tier,
                "savings": savings,
                "rate": f"{rate}% Cashback",
                "perk": perk,
            })

        # Sort by maximum savings
        scored_cards.sort(key=lambda x: x["savings"], reverse=True)
        best = scored_cards[0]

        return schemas.OptimizeBestCardResponse(
            recommended_card=best["card_name"],
            tier=best["tier"],
            estimated_savings=best["savings"],
            cashback_rate=best["rate"],
            reason=f"Recommended for {payload.category}: {best['perk']} providing ₹{best['savings']:.2f} savings on ₹{payload.amount:.2f}.",
            alternative_cards=scored_cards[1:],
        )
