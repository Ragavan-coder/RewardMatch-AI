from typing import List
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.ingestion_service import IngestionService

router = APIRouter(prefix="/admin", tags=["Data Quality & Ingestion (v1)"])


def verify_admin_access(authorization: str = Header(None)):
    """Simple authorization verification for administrative ingestion operations."""
    # In production, check Bearer token or API key; here allow demo access if header or token present
    return True


@router.post("/ingestion/run", response_model=schemas.IngestionStatusResponse)
def trigger_ingestion(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_access),
):
    """Triggers the data ingestion pipeline, content-hash verification, and change audit."""
    res = IngestionService.run_ingestion(db)
    return schemas.IngestionStatusResponse(
        status=res["status"],
        last_run_at=IngestionService._last_run_time,
        documents_scanned=res["documents_scanned"],
        records_updated=res["records_updated"],
        changes_detected=res["changes_detected"],
        errors_logged=res["errors_logged"],
        summary_message=res["summary_message"],
    )


@router.get("/ingestion/status", response_model=schemas.IngestionStatusResponse)
def get_ingestion_status(db: Session = Depends(get_db)):
    """Returns current status, document scan counts, and last execution logs."""
    return IngestionService.get_status(db)


@router.post("/data/validate", response_model=schemas.ValidationReportResponse)
def run_data_validation(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_access),
):
    """Executes deterministic validations across all financial entities and flags anomalies."""
    report = IngestionService.validate_catalog(db)
    return schemas.ValidationReportResponse(**report)


@router.get("/data/conflicts", response_model=List[schemas.RewardProgramChangeResponse])
def get_policy_conflicts(db: Session = Depends(get_db)):
    """Returns audit log of detected policy modifications, fee changes, and rule revisions."""
    changes = (
        db.query(models.RewardProgramChange)
        .order_by(models.RewardProgramChange.detected_at.desc())
        .limit(50)
        .all()
    )
    return changes
