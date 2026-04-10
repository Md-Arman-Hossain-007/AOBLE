from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import models
from ..schemas import notifications as schemas

def create_notification(db: Session, notification: schemas.NotificationCreate):
    """Create a new notification"""
    try:
        db_notification = models.Notification(
            user_id=notification.user_id,
            title=notification.title,
            message=notification.message,
            type=notification.type,
            priority=notification.priority,
            link=notification.link,
            metadata_json=notification.metadata_json
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification
    except Exception as e:
        db.rollback()
        print(f"Error creating notification: {e}")
        raise

def get_notifications(db: Session, user_id: str, skip: int = 0, limit: int = 100, 
                     is_read: Optional[bool] = None, type: Optional[str] = None):
    """Get notifications with optional filters"""
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    
    if is_read is not None:
        query = query.filter(models.Notification.is_read == is_read)
    
    if type is not None:
        query = query.filter(models.Notification.type == type)
    
    return query.order_by(models.Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_unread_count(db: Session, user_id: str) -> int:
    """Get count of unread notifications"""
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == user_id, models.Notification.is_read == False)\
        .count()

def mark_as_read(db: Session, notification_id: str, user_id: str):
    """Mark a single notification as read"""
    db_notification = db.query(models.Notification)\
        .filter(models.Notification.id == notification_id, models.Notification.user_id == user_id)\
        .first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_all_as_read(db: Session, user_id: str):
    """Mark all notifications as read"""
    count = db.query(models.Notification)\
        .filter(models.Notification.user_id == user_id, models.Notification.is_read == False)\
        .update({models.Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return count

def delete_notification(db: Session, notification_id: str, user_id: str):
    """Delete a notification"""
    db_notification = db.query(models.Notification)\
        .filter(models.Notification.id == notification_id, models.Notification.user_id == user_id)\
        .first()
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification
