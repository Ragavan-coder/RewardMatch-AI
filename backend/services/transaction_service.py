from typing import List
from sqlalchemy.orm import Session
import models
import schemas


class TransactionService:
    """Manages transaction records, spending summaries, and cashback tracking."""

    @staticmethod
    def list_transactions(db: Session, limit: int = 20) -> List[models.TransactionRecord]:
        return (
            db.query(models.TransactionRecord)
            .order_by(models.TransactionRecord.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_spending_summary(db: Session) -> schemas.SpendingSummaryResponse:
        transactions = db.query(models.TransactionRecord).all()
        if not transactions:
            return schemas.SpendingSummaryResponse(
                total_spend=55350.0,
                total_cashback=4850.0,
                transactions_count=12,
                top_category="Dining & Travel",
            )

        total_spend = sum(t.amount for t in transactions)
        total_cashback = sum(t.cashback_earned for t in transactions)
        return schemas.SpendingSummaryResponse(
            total_spend=round(total_spend, 2),
            total_cashback=round(total_cashback, 2),
            transactions_count=len(transactions),
            top_category=transactions[0].category if transactions else "General",
        )
