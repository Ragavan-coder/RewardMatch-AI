from pydantic import BaseModel


class RewardResponse(BaseModel):
    id: int
    title: str
    value: str
    reward_type: str
    code: str
    category: str
    expiry: str
    is_claimed: bool
    is_revealed: bool

    class Config:
        from_attributes = True


class ClaimRewardResponse(BaseModel):
    success: bool
    message: str
    code: str
    reward: RewardResponse
