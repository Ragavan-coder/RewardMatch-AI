from pydantic import BaseModel


class CardResponse(BaseModel):
    id: int
    name: str
    tier: str
    card_number_masked: str
    network: str
    accent_color: str
    credit_limit: int
    available_limit: int
    reward_points: int
    cashback_earned: int
    annual_fee: int
    dining_multiplier: float
    travel_multiplier: float
    shopping_multiplier: float

    class Config:
        from_attributes = True


class SimulateSwipeRequest(BaseModel):
    card_id: int
    amount: float
    category: str


class SimulateSwipeResponse(BaseModel):
    card_name: str
    amount: float
    category: str
    rate: str
    cashback_earned: float
    new_reward_points: int
    status: str
