from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.optimizer_service import OptimizerService

router = APIRouter(prefix="/optimizer", tags=["Savings Optimizer"])


@router.post("/best-card", response_model=schemas.OptimizeBestCardResponse)
def calculate_best_card(payload: schemas.OptimizeBestCardRequest, db: Session = Depends(get_db)):
    """Computes the optimal card to maximize rewards for any merchant purchase."""
    return OptimizerService.calculate_best_card(db, payload)
