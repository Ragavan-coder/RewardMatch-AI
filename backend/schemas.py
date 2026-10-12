from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if '@' not in clean or '.' not in clean.split('@')[-1]:
            raise ValueError('Invalid email format')
        return clean


class UserLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if '@' not in clean or '.' not in clean.split('@')[-1]:
            raise ValueError('Invalid email format')
        return clean


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_demo: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse


class CardResponse(BaseModel):
    id: int
    name: str
    tier: str
    card_number_masked: str
    network: str
    credit_limit: int
    reward_points: int
    cashback_earned: int

    class Config:
        from_attributes = True


class RewardResponse(BaseModel):
    id: int
    title: str
    value: str
    reward_type: str
    code: str
    is_claimed: bool

    class Config:
        from_attributes = True
