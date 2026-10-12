from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/cards", tags=["Cards Catalog (v1)"])


@router.get("", response_model=List[schemas.CreditCardListResponse])
def list_cards(
    issuer: Optional[str] = Query(None, description="Filter by issuing bank (e.g., 'HDFC Bank', 'SBI Card')"),
    network: Optional[str] = Query(None, description="Filter by card network ('Visa', 'Mastercard', 'RuPay')"),
    category: Optional[str] = Query(None, description="Filter by category ('Cashback', 'Travel & Lifestyle')"),
    upi_enabled: Optional[bool] = Query(None, description="Filter by UPI linkage support"),
    search: Optional[str] = Query(None, description="Search term in card name or issuer"),
    db: Session = Depends(get_db),
):
    """Retrieves verified master catalog of credit cards available in India."""
    query = db.query(models.CreditCard)
    if issuer:
        query = query.filter(models.CreditCard.issuer.ilike(f"%{issuer}%"))
    if network:
        query = query.filter(models.CreditCard.network.ilike(network))
    if category:
        query = query.filter(models.CreditCard.card_category.ilike(f"%{category}%"))
    if upi_enabled is not None:
        query = query.filter(models.CreditCard.upi_enabled == upi_enabled)
    if search:
        query = query.filter(
            models.CreditCard.card_name.ilike(f"%{search}%") | models.CreditCard.issuer.ilike(f"%{search}%")
        )
    return query.order_by(models.CreditCard.issuer, models.CreditCard.card_name).all()


@router.get("/{card_id}", response_model=schemas.CreditCardDetailResponse)
def get_card_detail(card_id: int, db: Session = Depends(get_db)):
    """Fetches full card specification including verified reward rules and fee waiver policies."""
    card = db.query(models.CreditCard).filter(models.CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found in master catalog.")
    return card


@router.get("/{card_id}/rewards", response_model=List[schemas.RewardRuleResponse])
def get_card_rewards(card_id: int, db: Session = Depends(get_db)):
    """Returns granular category reward rules, multipliers, caps, and redemption values for a card."""
    card = db.query(models.CreditCard).filter(models.CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found in master catalog.")
    rules = (
        db.query(models.RewardRule)
        .filter(models.RewardRule.card_id == card_id)
        .order_by(models.RewardRule.reward_rate.desc())
        .all()
    )
    return rules
