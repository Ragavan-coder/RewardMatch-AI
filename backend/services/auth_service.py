from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import models
import schemas
from security import hash_password, verify_password, generate_session_token


class AuthService:
    """Handles user registration, card/bank onboarding, SQL persistence, and profile management."""

    @staticmethod
    def _build_user_response(user: models.User) -> schemas.UserResponse:
        cards_count = len(user.cards) if hasattr(user, "cards") and user.cards else 0
        bank_accounts_list = (
            user.bank_accounts
            if hasattr(user, "bank_accounts") and user.bank_accounts
            else []
        )
        bank_accounts_data = [
            schemas.BankAccountResponse(
                id=b.id,
                user_id=b.user_id,
                bank_name=b.bank_name,
                account_type=b.account_type,
                account_number_masked=b.account_number_masked,
                upi_id=b.upi_id,
                primary_upi_app=b.primary_upi_app or "Google Pay",
                is_primary=b.is_primary,
                rupay_credit_linked=b.rupay_credit_linked,
                created_at=b.created_at,
            )
            for b in bank_accounts_list
        ]
        return schemas.UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            is_demo=user.is_demo,
            phone=user.phone,
            monthly_spend=user.monthly_spend or 50000,
            primary_category=user.primary_category or "Shopping",
            primary_bank=user.primary_bank,
            primary_upi_id=user.primary_upi_id,
            primary_upi_app=user.primary_upi_app or "Google Pay",
            profile_completed=user.profile_completed or False,
            cards_count=cards_count,
            bank_accounts_count=len(bank_accounts_list),
            bank_accounts=bank_accounts_data,
            created_at=user.created_at,
        )

    @classmethod
    def register_user(cls, db: Session, payload: schemas.UserRegisterRequest) -> schemas.AuthResponse:
        clean_email = payload.email.lower().strip()
        existing = db.query(models.User).filter(models.User.email == clean_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        new_user = models.User(
            name=payload.name.strip(),
            email=clean_email,
            hashed_password=hash_password(payload.password),
            phone=payload.phone.strip() if payload.phone else None,
            monthly_spend=payload.monthly_spend or 50000,
            primary_category=payload.primary_category or "Shopping",
            primary_bank=payload.primary_bank,
            primary_upi_id=payload.primary_upi_id,
            primary_upi_app=payload.primary_upi_app or "Google Pay",
            profile_completed=bool(payload.cards or payload.bank_accounts),
            is_demo=False,
            created_at=datetime.utcnow(),
            last_login_at=datetime.utcnow(),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 1. Process and persist any cards provided during registration
        if payload.cards and len(payload.cards) > 0:
            for c in payload.cards:
                last_4 = c.last_4.strip() if c.last_4 else "1234"
                masked = f"•••• •••• •••• {last_4}"
                card_record = models.CreditCardRecord(
                    user_id=new_user.id,
                    name=c.name.strip(),
                    bank_name=c.bank_name or c.name.split()[0],
                    nickname=f"{c.name.strip()} ({last_4})",
                    tier="Platinum",
                    card_number_masked=masked,
                    network=c.network.upper() if c.network else "VISA",
                    accent_color="#FF3038" if "rupay" in c.network.lower() else "#A30016",
                    credit_limit=c.credit_limit or 150000,
                    available_limit=int((c.credit_limit or 150000) * 0.85),
                    reward_points=c.reward_points or 5000,
                    cashback_earned=2400,
                    annual_fee=500,
                    dining_multiplier=5.0,
                    travel_multiplier=2.0,
                    shopping_multiplier=3.0,
                    rupay_on_upi_linked=c.rupay_on_upi or ("rupay" in c.network.lower()),
                )
                db.add(card_record)
        else:
            # Default starter card for new sign-ups
            starter_card = models.CreditCardRecord(
                user_id=new_user.id,
                name="RewardMatch Starter Card",
                bank_name="RewardMatch Partner",
                nickname="Primary Card",
                tier="Platinum",
                card_number_masked="4532 •••• •••• 1001",
                network="VISA",
                accent_color="#FF263D",
                credit_limit=75000,
                available_limit=68000,
                reward_points=2500,
                cashback_earned=1200,
                rupay_on_upi_linked=False,
            )
            db.add(starter_card)

        # 2. Process and persist any bank accounts and UPI details provided
        if payload.bank_accounts and len(payload.bank_accounts) > 0:
            for idx, b in enumerate(payload.bank_accounts):
                last_4 = b.last_4.strip() if b.last_4 else "5678"
                masked_ac = f"•••• •••• {last_4}"
                bank_record = models.BankAccountRecord(
                    user_id=new_user.id,
                    bank_name=b.bank_name.strip(),
                    account_type=b.account_type or "Savings",
                    account_number_masked=masked_ac,
                    account_holder_name=new_user.name,
                    upi_id=b.upi_id or f"{new_user.name.lower().replace(' ', '')}@{b.bank_name.lower().split()[0]}",
                    primary_upi_app=b.primary_upi_app or "Google Pay",
                    is_primary=(idx == 0) or b.is_primary,
                    rupay_credit_linked=b.rupay_credit_linked,
                    created_at=datetime.utcnow(),
                )
                db.add(bank_record)

        db.commit()
        db.refresh(new_user)

        token = generate_session_token(new_user.id, new_user.email)
        return schemas.AuthResponse(
            success=True,
            message="Account, credit cards, and bank details saved to SQL database.",
            token=token,
            user=cls._build_user_response(new_user),
        )

    @classmethod
    def setup_onboarding_profile(
        cls, db: Session, payload: schemas.UserOnboardingRequest
    ) -> schemas.UserResponse:
        """Updates user profile and saves collected cards and bank accounts to SQL."""
        user = None
        if payload.user_id:
            user = db.query(models.User).filter(models.User.id == payload.user_id).first()
        elif payload.email:
            user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
        if not user:
            # Fallback to the latest non-demo user or first user
            user = db.query(models.User).filter(models.User.is_demo == False).order_by(models.User.id.desc()).first()
            if not user:
                user = db.query(models.User).first()

        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        # Update profile attributes
        if payload.phone:
            user.phone = payload.phone.strip()
        if payload.monthly_spend:
            user.monthly_spend = payload.monthly_spend
        if payload.primary_category:
            user.primary_category = payload.primary_category
        if payload.primary_bank:
            user.primary_bank = payload.primary_bank
        if payload.primary_upi_id:
            user.primary_upi_id = payload.primary_upi_id
        if payload.primary_upi_app:
            user.primary_upi_app = payload.primary_upi_app
        user.profile_completed = True

        # Persist credit cards in SQL
        if payload.cards:
            for c in payload.cards:
                last_4 = c.last_4.strip() if c.last_4 else "1234"
                masked = f"•••• •••• •••• {last_4}"
                card_record = models.CreditCardRecord(
                    user_id=user.id,
                    name=c.name.strip(),
                    bank_name=c.bank_name or c.name.split()[0],
                    nickname=f"{c.name.strip()} ({last_4})",
                    tier="Platinum",
                    card_number_masked=masked,
                    network=c.network.upper() if c.network else "VISA",
                    accent_color="#FF3038" if "rupay" in c.network.lower() else "#E5B567",
                    credit_limit=c.credit_limit or 150000,
                    available_limit=int((c.credit_limit or 150000) * 0.85),
                    reward_points=c.reward_points or 5000,
                    cashback_earned=1800,
                    annual_fee=500,
                    dining_multiplier=5.0,
                    travel_multiplier=2.0,
                    shopping_multiplier=3.0,
                    rupay_on_upi_linked=c.rupay_on_upi or ("rupay" in c.network.lower()),
                )
                db.add(card_record)

        # Persist bank accounts in SQL
        if payload.bank_accounts:
            for idx, b in enumerate(payload.bank_accounts):
                last_4 = b.last_4.strip() if b.last_4 else "5678"
                masked_ac = f"•••• •••• {last_4}"
                bank_record = models.BankAccountRecord(
                    user_id=user.id,
                    bank_name=b.bank_name.strip(),
                    account_type=b.account_type or "Savings",
                    account_number_masked=masked_ac,
                    account_holder_name=user.name,
                    upi_id=b.upi_id or f"{user.name.lower().replace(' ', '')}@{b.bank_name.lower().split()[0]}",
                    primary_upi_app=b.primary_upi_app or "Google Pay",
                    is_primary=(idx == 0) or b.is_primary,
                    rupay_credit_linked=b.rupay_credit_linked,
                    created_at=datetime.utcnow(),
                )
                db.add(bank_record)

        db.commit()
        db.refresh(user)
        return cls._build_user_response(user)

    @classmethod
    def authenticate_user(cls, db: Session, payload: schemas.UserLoginRequest) -> schemas.AuthResponse:
        clean_email = payload.email.lower().strip()
        user = db.query(models.User).filter(models.User.email == clean_email).first()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)

        token = generate_session_token(user.id, user.email)
        return schemas.AuthResponse(
            success=True,
            message="Credentials verified in SQL database.",
            token=token,
            user=cls._build_user_response(user),
        )

    @classmethod
    def get_user_by_id(cls, db: Session, user_id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()

    @classmethod
    def get_user_response(cls, db: Session, user_id: int) -> Optional[schemas.UserResponse]:
        user = cls.get_user_by_id(db, user_id)
        if not user:
            return None
        return cls._build_user_response(user)

    @classmethod
    def get_user_bank_accounts(cls, db: Session, user_id: int) -> List[schemas.BankAccountResponse]:
        accounts = (
            db.query(models.BankAccountRecord)
            .filter(models.BankAccountRecord.user_id == user_id)
            .order_by(models.BankAccountRecord.is_primary.desc(), models.BankAccountRecord.id.desc())
            .all()
        )
        return [
            schemas.BankAccountResponse(
                id=a.id,
                user_id=a.user_id,
                bank_name=a.bank_name,
                account_type=a.account_type,
                account_number_masked=a.account_number_masked,
                upi_id=a.upi_id,
                primary_upi_app=a.primary_upi_app or "Google Pay",
                is_primary=a.is_primary,
                rupay_credit_linked=a.rupay_credit_linked,
                created_at=a.created_at,
            )
            for a in accounts
        ]

    @classmethod
    def add_user_bank_account(
        cls, db: Session, user_id: int, payload: schemas.BankOnboardingItem
    ) -> schemas.BankAccountResponse:
        user = cls.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        last_4 = payload.last_4.strip() if payload.last_4 else "5678"
        masked = f"•••• •••• {last_4}"
        bank_record = models.BankAccountRecord(
            user_id=user_id,
            bank_name=payload.bank_name.strip(),
            account_type=payload.account_type or "Savings",
            account_number_masked=masked,
            account_holder_name=user.name,
            upi_id=payload.upi_id or f"{user.name.lower().replace(' ', '')}@{payload.bank_name.lower().split()[0]}",
            primary_upi_app=payload.primary_upi_app or "Google Pay",
            is_primary=payload.is_primary,
            rupay_credit_linked=payload.rupay_credit_linked,
            created_at=datetime.utcnow(),
        )
        db.add(bank_record)
        db.commit()
        db.refresh(bank_record)
        return schemas.BankAccountResponse.from_orm(bank_record)
