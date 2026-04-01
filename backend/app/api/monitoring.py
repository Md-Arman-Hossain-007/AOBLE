from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from ..db.session import get_db
from ..models import models
from .users import get_current_active_user
from .auth import RoleChecker
from pydantic import BaseModel

router = APIRouter()

class MonitorRequest(BaseModel):
    customer_ref: str
    entity_id: str
    query_name: str
    query_details: dict
    last_risk_level: str

class MonitoredEntityResponse(BaseModel):
    id: str
    customer_ref: str
    entity_id: Optional[str]
    query_name: str
    last_risk_level: str
    last_screened_at: datetime.datetime
    status: str

    class Config:
        orm_mode = True

class MonitoringAlertResponse(BaseModel):
    id: str
    monitored_entity_id: str
    previous_risk: str
    new_risk: str
    change_type: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        orm_mode = True

@router.post("/entities", response_model=MonitoredEntityResponse)
def add_monitored_entity(
    req: MonitorRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check if already monitored
    existing = db.query(models.MonitoredEntity).filter(
        models.MonitoredEntity.customer_ref == req.customer_ref,
        models.MonitoredEntity.status == "active"
    ).first()
    
    if existing:
        return existing

    new_entity = models.MonitoredEntity(
        user_id=current_user.username,
        customer_ref=req.customer_ref,
        entity_id=req.entity_id,
        query_name=req.query_name,
        query_details=req.query_details,
        last_risk_level=req.last_risk_level
    )
    db.add(new_entity)
    db.commit()
    db.refresh(new_entity)
    return new_entity

@router.get("/entities", response_model=List[MonitoredEntityResponse])
def get_monitored_entities(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return db.query(models.MonitoredEntity).join(
        models.User, models.User.username == models.MonitoredEntity.user_id
    ).filter(models.User.org_id == current_user.org_id).order_by(models.MonitoredEntity.created_at.desc()).offset(skip).limit(limit).all()

@router.delete("/entities/{entity_id}")
def remove_monitored_entity(
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    entity = db.query(models.MonitoredEntity).filter(models.MonitoredEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Monitored entity not found")
    
    entity.status = "inactive"
    db.commit()
    return {"status": "success"}

@router.get("/alerts", response_model=List[MonitoringAlertResponse])
def get_monitoring_alerts(
    unread_only: bool = False,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.MonitoringAlert).join(
        models.MonitoredEntity, models.MonitoredEntity.id == models.MonitoringAlert.monitored_entity_id
    ).join(
        models.User, models.User.username == models.MonitoredEntity.user_id
    ).filter(models.User.org_id == current_user.org_id)
    
    if unread_only:
        query = query.filter(models.MonitoringAlert.is_read == False)
    return query.order_by(models.MonitoringAlert.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    alert = db.query(models.MonitoringAlert).filter(models.MonitoringAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    db.commit()
    return {"status": "success"}
