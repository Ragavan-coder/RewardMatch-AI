from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[schemas.TransactionResponse])
def get_transactions(limit: int = 20, db: Session = Depends(get_db)):
    """Returns recent transaction activities from the SQL database."""
    transactions = TransactionService.list_transactions(db, limit)
    return [schemas.TransactionResponse.from_orm(t) for t in transactions]


@router.get("/summary", response_model=schemas.SpendingSummaryResponse)
def get_spending_summary(db: Session = Depends(get_db)):
    """Returns aggregated spending, total cashback earned, and top categories."""
    return TransactionService.get_spending_summary(db)
