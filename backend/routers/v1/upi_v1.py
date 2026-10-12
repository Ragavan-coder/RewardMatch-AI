from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/upi/apps", tags=["UPI Applications (v1)"])


@router.get("", response_model=List[schemas.UpiApplicationResponse])
def list_upi_apps(
    rupay_cc_supported: Optional[bool] = Query(None, description="Filter by RuPay credit card on UPI linkage"),
    db: Session = Depends(get_db),
):
    """Returns catalog of supported Indian UPI payment applications, payment rails, and rules."""
    query = db.query(models.UpiApplication)
    if rupay_cc_supported is not None:
        query = query.filter(models.UpiApplication.rupay_cc_on_upi_supported == rupay_cc_supported)
    return query.order_by(models.UpiApplication.app_name).all()


@router.get("/{app_id}", response_model=schemas.UpiApplicationResponse)
def get_upi_app(app_id: int, db: Session = Depends(get_db)):
    """Fetches detailed payment rail support, terms, and RuPay card guidelines for a UPI application."""
    app = db.query(models.UpiApplication).filter(models.UpiApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="UPI application not found.")
    return app
