from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.activity_service import ActivityService

router = APIRouter(prefix="/activity", tags=["Activity History"])


@router.get("")
def get_activity_timeline(
    category: str = Query("all", description="Category filter (account, card, bank, transaction, offer, reward, shopping, alert, report)"),
    user_id: int = Query(1, description="Authenticated user ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Returns complete chronological activity timeline and audit events.
    Supports filtering by category and pagination.
    """
    ActivityService.seed_initial_activity(db, user_id)
    events = ActivityService.get_user_events(
        db, user_id=user_id, category=category, limit=limit, offset=offset
    )
    return [
        {
            "id": ev.id,
            "category": ev.category,
            "event_type": ev.event_type,
            "description": ev.description,
            "timestamp": ev.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "display_timezone": ev.display_timezone,
            "related_entity_id": ev.related_entity_id,
            "related_entity_type": ev.related_entity_type,
            "status": ev.status,
            "source": ev.source,
            "meta_data": ev.meta_data,
        }
        for ev in events
    ]
