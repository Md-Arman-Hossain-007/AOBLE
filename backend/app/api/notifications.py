from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..db.session import get_db
from ..schemas import notifications as schemas
from ..services import notification_service
from ..api.auth import get_current_user
from ..models import models

router = APIRouter()

@router.get("/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    count = notification_service.get_unread_count(
        db, user_id=current_user.username
    )
    return {"unread_count": count, "user_id": current_user.username}

@router.get("", response_model=List[schemas.Notification])
def read_notifications(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    is_read: Optional[bool] = Query(default=None, description="Filter by read status"),
    type: Optional[str] = Query(default=None, description="Filter by notification type"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's notifications with optional filters"""
    notifications = notification_service.get_notifications(
        db, user_id=current_user.username, skip=skip, limit=limit,
        is_read=is_read, type=type
    )
    return notifications

@router.patch("/{notification_id}/read", response_model=schemas.Notification)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notification = notification_service.mark_as_read(
        db, notification_id=notification_id, user_id=current_user.username
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notification_service.mark_all_as_read(db, user_id=current_user.username)
    return {"status": "success", "message": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    success = notification_service.delete_notification(
        db, notification_id=notification_id, user_id=current_user.username
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "message": "Notification deleted"}
