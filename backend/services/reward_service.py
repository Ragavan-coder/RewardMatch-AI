import random
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import models
import schemas


class RewardService:
    """Manages coupon codes, reward vouchers, and scratch cards."""

    @staticmethod
    def list_rewards(db: Session, user_id: Optional[int] = None) -> List[models.RewardRecord]:
        query = db.query(models.RewardRecord)
        if user_id:
            rewards = query.filter(models.RewardRecord.user_id == user_id).all()
            if rewards:
                return rewards
        return query.all()

    @staticmethod
    def claim_reward(db: Session, reward_id: int) -> schemas.ClaimRewardResponse:
        reward = db.query(models.RewardRecord).filter(models.RewardRecord.id == reward_id).first()
        if not reward:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found.")

        if reward.is_claimed:
            return schemas.ClaimRewardResponse(
                success=True,
                message="Reward already claimed.",
                code=reward.code,
                reward=schemas.RewardResponse.from_orm(reward),
            )

        reward.is_claimed = True
        db.commit()
        db.refresh(reward)

        return schemas.ClaimRewardResponse(
            success=True,
            message="Reward successfully claimed and saved.",
            code=reward.code,
            reward=schemas.RewardResponse.from_orm(reward),
        )

    @staticmethod
    def generate_scratch_reward(db: Session, user_id: int) -> schemas.RewardResponse:
        """Generates a dynamic scratch card reward in the SQL database."""
        prizes = [
            ("Swiggy Gourmet ₹250 Discount", "₹250 OFF", "voucher", "SWIGGY-GOLD-250"),
            ("MakeMyTrip 10% Domestic Travel Saver", "10% OFF", "discount", "MMT-DOM-10"),
            ("Amazon Pay ₹100 Cashback Voucher", "₹100 CASHBACK", "voucher", "AMZ-CASH-100"),
            ("Zomato Pro Dining ₹500 Flat Off", "₹500 OFF", "voucher", "ZOMATO-DINE-500"),
        ]
        chosen = random.choice(prizes)
        new_reward = models.RewardRecord(
            user_id=user_id,
            title=chosen[0],
            value=chosen[1],
            reward_type=chosen[2],
            code=chosen[3],
            category="Dining" if "Swiggy" in chosen[0] or "Zomato" in chosen[0] else "Shopping",
            is_claimed=False,
            is_revealed=True,
        )
        db.add(new_reward)
        db.commit()
        db.refresh(new_reward)
        return schemas.RewardResponse.from_orm(new_reward)
