from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.reward_service import RewardService

router = APIRouter(prefix="/rewards", tags=["Rewards & Coupons"])


@router.get("", response_model=List[schemas.RewardResponse])
def get_rewards(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Returns active coupons, vouchers, and rewards stored in the SQL database."""
    rewards = RewardService.list_rewards(db, user_id)
    return [schemas.RewardResponse.from_orm(r) for r in rewards]


@router.post("/{reward_id}/claim", response_model=schemas.ClaimRewardResponse)
def claim_reward(reward_id: int, db: Session = Depends(get_db)):
    """Claims a voucher in the SQL database and returns the coupon code."""
    return RewardService.claim_reward(db, reward_id)


@router.post("/scratch", response_model=schemas.RewardResponse)
def scratch_card(user_id: int = 1, db: Session = Depends(get_db)):
    """Generates and reveals a new scratch card reward."""
    return RewardService.generate_scratch_reward(db, user_id)
