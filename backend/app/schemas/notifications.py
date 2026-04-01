from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    priority: str = "normal"
    link: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
