from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.card_service import CardService

router = APIRouter(prefix="/cards", tags=["Credit Cards"])


@router.get("", response_model=List[schemas.CardResponse])
def get_cards(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Fetches user credit cards stored in the SQL database."""
    cards = CardService.list_cards(db, user_id)
    return [schemas.CardResponse.from_orm(c) for c in cards]


@router.post("/simulate-swipe", response_model=schemas.SimulateSwipeResponse)
def simulate_swipe(payload: schemas.SimulateSwipeRequest, db: Session = Depends(get_db)):
    """Simulates a card swipe transaction with instant cashback calculation and balance update."""
    return CardService.simulate_swipe(db, payload)
