from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..api.auth import get_current_active_user
from ..models import models
from ..etl.tasks import run_full_sync
from ..models.models import ScreeningAuditLog

router = APIRouter()

@router.post("/sync", status_code=status.HTTP_202_ACCEPTED)
def trigger_sync(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Triggers a full OpenSanctions data sync in the background via Celery.
    In real production, this should check if current_user is an admin.
    """
    task = run_full_sync.delay()
    return {"message": "Sync started in background", "task_id": task.id}

@router.get("/audit", response_model=List[dict])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    limit: int = 50,
    offset: int = 0
):
    """
    Returns the screening audit logs.
    """
    # In production, check for admin role
    logs = db.query(ScreeningAuditLog).order_by(ScreeningAuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "query_name": log.query_name,
            "match_count": log.match_count,
            "timestamp": log.timestamp.isoformat(),
            "params": log.query_params
        } for log in logs
    ]
