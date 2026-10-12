from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator


class CardOnboardingItem(BaseModel):
    name: str
    bank_name: Optional[str] = None
    last_4: str = "1234"
    network: str = "VISA"
    credit_limit: int = 150000
    reward_points: int = 5000
    rupay_on_upi: bool = False


class BankOnboardingItem(BaseModel):
    bank_name: str
    account_type: str = "Savings"
    last_4: str = "5678"
    upi_id: Optional[str] = None
    primary_upi_app: str = "Google Pay"
    is_primary: bool = True
    rupay_credit_linked: bool = False


class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    monthly_spend: Optional[int] = 50000
    primary_category: Optional[str] = "Shopping"
    primary_bank: Optional[str] = None
    primary_upi_id: Optional[str] = None
    primary_upi_app: Optional[str] = "Google Pay"
    cards: Optional[List[CardOnboardingItem]] = []
    bank_accounts: Optional[List[BankOnboardingItem]] = []

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if '@' not in clean or '.' not in clean.split('@')[-1]:
            raise ValueError('Invalid email format')
        return clean


class UserOnboardingRequest(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    monthly_spend: Optional[int] = 50000
    primary_category: Optional[str] = "Shopping"
    primary_bank: Optional[str] = None
    primary_upi_id: Optional[str] = None
    primary_upi_app: Optional[str] = "Google Pay"
    cards: List[CardOnboardingItem] = []
    bank_accounts: List[BankOnboardingItem] = []


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


class BankAccountResponse(BaseModel):
    id: int
    user_id: int
    bank_name: str
    account_type: str
    account_number_masked: str
    upi_id: Optional[str] = None
    primary_upi_app: Optional[str] = "Google Pay"
    is_primary: bool = True
    rupay_credit_linked: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_demo: bool
    phone: Optional[str] = None
    monthly_spend: Optional[int] = 50000
    primary_category: Optional[str] = "Shopping"
    primary_bank: Optional[str] = None
    primary_upi_id: Optional[str] = None
    primary_upi_app: Optional[str] = "Google Pay"
    profile_completed: bool = False
    cards_count: int = 0
    bank_accounts_count: int = 0
    bank_accounts: List[BankAccountResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse
