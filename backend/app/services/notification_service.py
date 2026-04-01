from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import models
from ..schemas import notifications as schemas

def create_notification(db: Session, notification: schemas.NotificationCreate):
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

def get_notifications(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == user_id)\
        .order_by(models.Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def mark_as_read(db: Session, notification_id: str, user_id: str):
    db_notification = db.query(models.Notification)\
        .filter(models.Notification.id == notification_id, models.Notification.user_id == user_id)\
        .first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_all_as_read(db: Session, user_id: str):
    db.query(models.Notification)\
        .filter(models.Notification.user_id == user_id, models.Notification.is_read == False)\
        .update({models.Notification.is_read: True}, synchronize_session=False)
    db.commit()

def delete_notification(db: Session, notification_id: str, user_id: str):
    db_notification = db.query(models.Notification)\
        .filter(models.Notification.id == notification_id, models.Notification.user_id == user_id)\
        .first()
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification
