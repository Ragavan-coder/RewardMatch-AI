from typing import List
from pydantic import BaseModel


class OptimizeBestCardRequest(BaseModel):
    merchant: str
    category: str
    amount: float


class OptimizeBestCardResponse(BaseModel):
    recommended_card: str
    tier: str
    estimated_savings: float
    cashback_rate: str
    reason: str
    alternative_cards: List[dict]
