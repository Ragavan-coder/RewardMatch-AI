from pydantic import BaseModel, Field
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models.monitoring import Merchant, TrackedProduct
from services.monitoring_service import MonitoringService

router = APIRouter(prefix="/monitor", tags=["Shopping & Offer Monitoring"])


class AddProductRequest(BaseModel):
    title: str = Field(..., description="Product name")
    merchant_name: str = Field(..., description="Amazon India, Flipkart, Croma, etc.")
    current_price: float = Field(..., gt=0, description="Observed price")
    target_price: Optional[float] = Field(None, description="User target alert price")
    category: str = Field("Electronics", description="Product category")
    product_url: Optional[str] = Field(None, description="Product web link")


@router.get("/merchants")
def get_merchants(db: Session = Depends(get_db)):
    """Returns list of supported online retail merchants and payment methods."""
    MonitoringService.ensure_merchants(db)
    merchants = db.query(Merchant).filter(Merchant.is_active == True).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "slug": m.slug,
            "website_url": m.website_url,
            "category": m.category,
            "supported_payment_methods": m.supported_payment_methods,
        }
        for m in merchants
    ]


@router.get("/products")
def get_tracked_products(
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Returns all products actively monitored for the user with card multipliers."""
    products = MonitoringService.get_tracked_products(db, user_id)
    return [
        {
            "id": p.id,
            "title": p.title,
            "brand": p.brand,
            "category": p.category,
            "merchant_name": p.merchant_name,
            "current_price": float(p.current_price),
            "original_price": float(p.original_price or p.current_price),
            "target_price": float(p.target_price) if p.target_price else None,
            "best_card_name": p.best_card_name,
            "best_discount_rate": p.best_discount_rate,
            "estimated_savings": float(p.estimated_savings or 0.0),
            "image_url": p.image_url,
            "is_in_stock": p.is_in_stock,
            "last_monitored_at": p.last_monitored_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }
        for p in products
    ]


@router.post("/products")
def add_tracked_product(
    payload: AddProductRequest,
    user_id: int = Query(1, description="Authenticated user ID"),
    db: Session = Depends(get_db),
):
    """Adds a new product to monitor for price drops and verified credit card discounts."""
    item = MonitoringService.add_tracked_product(
        db,
        user_id=user_id,
        title=payload.title,
        merchant_name=payload.merchant_name,
        current_price=payload.current_price,
        target_price=payload.target_price,
        category=payload.category,
        product_url=payload.product_url,
    )
    return {
        "id": item.id,
        "title": item.title,
        "merchant_name": item.merchant_name,
        "current_price": float(item.current_price),
        "best_card_name": item.best_card_name,
        "estimated_savings": float(item.estimated_savings),
    }
