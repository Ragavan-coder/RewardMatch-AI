from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.post("/register", response_model=schemas.AuthResponse)
def register(payload: schemas.UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user account and saves profile, cards, and bank details into SQL."""
    return AuthService.register_user(db, payload)


@router.post("/onboarding", response_model=schemas.UserResponse)
def setup_onboarding_profile(
    payload: schemas.UserOnboardingRequest, db: Session = Depends(get_db)
):
    """Sets up user profile and stores all collected cards and bank accounts in SQL."""
    return AuthService.setup_onboarding_profile(db, payload)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates credentials against the SQL database."""
    return AuthService.authenticate_user(db, payload)


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(user_id: Optional[int] = None, email: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns current active user account with linked cards and bank accounts."""
    if user_id:
        user_res = AuthService.get_user_response(db, user_id)
        if user_res:
            return user_res
    if email:
        clean_email = email.lower().strip()
        from models.user import User
        user = db.query(User).filter(User.email == clean_email).first()
        if user:
            return AuthService._build_user_response(user)

    # Fallback to demo/first user
    from models.user import User
    user = db.query(User).first()
    return AuthService._build_user_response(user)


@router.get("/banks", response_model=List[schemas.BankAccountResponse])
def get_user_bank_accounts(user_id: int = 1, db: Session = Depends(get_db)):
    """Retrieves all SQL-persisted bank accounts and linked UPI VPAs for the user."""
    return AuthService.get_user_bank_accounts(db, user_id)


@router.post("/banks", response_model=schemas.BankAccountResponse)
def add_bank_account(
    payload: schemas.BankOnboardingItem,
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """Adds a new bank account and linked UPI VPA into SQL database."""
    return AuthService.add_user_bank_account(db, user_id, payload)
