from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(tags=["Offers & Sources (v1)"])


@router.get("/offers", response_model=List[schemas.RewardOfferResponse])
def list_offers(
    merchant: Optional[str] = Query(None, description="Filter by merchant name (e.g., 'Swiggy', 'Amazon')"),
    category: Optional[str] = Query(None, description="Filter by category ('Dining', 'Groceries')"),
    issuer: Optional[str] = Query(None, description="Filter by issuing entity"),
    card_id: Optional[int] = Query(None, description="Filter by associated card ID"),
    upi_app_id: Optional[int] = Query(None, description="Filter by associated UPI app ID"),
    db: Session = Depends(get_db),
):
    """Lists all verified reward and promotional offers."""
    query = db.query(models.RewardOffer)
    if merchant:
        query = query.filter(models.RewardOffer.merchant.ilike(f"%{merchant}%"))
    if category:
        query = query.filter(models.RewardOffer.eligible_categories.ilike(f"%{category}%"))
    if issuer:
        query = query.filter(models.RewardOffer.issuer.ilike(f"%{issuer}%"))
    if card_id is not None:
        query = query.filter(models.RewardOffer.associated_card_id == card_id)
    if upi_app_id is not None:
        query = query.filter(models.RewardOffer.associated_upi_app_id == upi_app_id)
    return query.order_by(models.RewardOffer.effective_until.asc()).all()


@router.get("/offers/active", response_model=List[schemas.RewardOfferResponse])
def list_active_offers(
    target_date: Optional[date] = Query(
        None,
        alias="date",
        description="Target evaluation date (ISO 8601: YYYY-MM-DD). Defaults to current date."
    ),
    merchant: Optional[str] = Query(None, description="Filter by merchant"),
    category: Optional[str] = Query(None, description="Filter by category"),
    card_id: Optional[int] = Query(None, description="Filter by associated card ID"),
    upi_app_id: Optional[int] = Query(None, description="Filter by associated UPI app ID"),
    db: Session = Depends(get_db),
):
    """
    Returns only verified offers active on the specified date.
    Does NOT assume an offer is active solely based on a stale database record.
    """
    eval_date = target_date or date.today()
    query = (
        db.query(models.RewardOffer)
        .filter(
            models.RewardOffer.effective_from <= eval_date,
            models.RewardOffer.effective_until >= eval_date,
            models.RewardOffer.verification_status == "verified",
        )
    )
    if merchant:
        query = query.filter(models.RewardOffer.merchant.ilike(f"%{merchant}%"))
    if category:
        query = query.filter(models.RewardOffer.eligible_categories.ilike(f"%{category}%"))
    if card_id is not None:
        query = query.filter(models.RewardOffer.associated_card_id == card_id)
    if upi_app_id is not None:
        query = query.filter(models.RewardOffer.associated_upi_app_id == upi_app_id)

    return query.order_by(models.RewardOffer.effective_until.asc()).all()


@router.get("/sources/{source_id}", response_model=schemas.SourceDocumentResponse)
def get_source_document(source_id: int, db: Session = Depends(get_db)):
    """Retrieves official source document metadata, verification hash, and raw text excerpt."""
    doc = db.query(models.SourceDocument).filter(models.SourceDocument.id == source_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source document not found.")
    return doc
