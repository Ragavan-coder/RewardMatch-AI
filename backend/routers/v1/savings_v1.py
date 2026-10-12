from pydantic import BaseModel, Field
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.savings_service import SavingsService

router = APIRouter(prefix="/savings", tags=["Savings Analytics"])


class RecordTransactionRequest(BaseModel):
    merchant: str = Field(..., description="Store or merchant name")
    category: str = Field(..., description="Shopping, Dining, Travel, Electronics, etc.")
    amount: float = Field(..., gt=0, description="Purchase amount")
    card_used: str = Field("Tata Neu Infinity HDFC Bank", description="Card or payment method")
    payment_method: str = Field("Credit Card", description="Credit Card, RuPay on UPI, etc.")
    confirmed_discount: float = Field(0.0, description="Evidenced instant discount")
    confirmed_cashback: float = Field(0.0, description="Verified card cashback")
    pending_reward: float = Field(0.0, description="Pending rewards awaiting confirmation")
    estimated_reward: float = Field(0.0, description="Estimated future reward points")


@router.get("/summary")
def get_savings_summary(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """
    Returns verified financial savings calculated with Decimal precision
    broken into the 6 distinct categories.
    """
    return SavingsService.get_savings_summary(db, user_id)


@router.post("/transactions")
def record_transaction(
    payload: RecordTransactionRequest,
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Records a purchase transaction and automatically updates savings totals."""
    tx = SavingsService.record_transaction(
        db,
        user_id=user_id,
        merchant=payload.merchant,
        category=payload.category,
        amount=payload.amount,
        card_used=payload.card_used,
        payment_method=payload.payment_method,
        confirmed_discount=payload.confirmed_discount,
        confirmed_cashback=payload.confirmed_cashback,
        pending_reward=payload.pending_reward,
        estimated_reward=payload.estimated_reward,
        source="manual_entry",
    )
    return {
        "id": tx.id,
        "merchant": tx.merchant,
        "amount": float(tx.amount),
        "confirmed_cashback": float(tx.confirmed_cashback),
        "status": tx.status,
        "created_at": tx.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
