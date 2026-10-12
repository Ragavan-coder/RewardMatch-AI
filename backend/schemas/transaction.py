from datetime import datetime
from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: int
    merchant: str
    category: str
    amount: float
    cashback_earned: float
    card_used: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SpendingSummaryResponse(BaseModel):
    total_spend: float
    total_cashback: float
    transactions_count: int
    top_category: str
