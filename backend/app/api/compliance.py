import uuid
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import datetime
from ..db.session import get_db
from ..models import models
from ..models.models import ScreeningResult, ScreeningAuditLog, WhitelistedEntity, MonitoredEntity, AIInsight, MonitoringAlert
from ..services.ai_enhancement import AIEnhancementService
from ..schemas import compliance as schemas
from .users import get_current_active_user
from .auth import RoleChecker

router = APIRouter()

@router.get("", response_model=schemas.ComplianceSettingsResponse)
def get_compliance_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin"]))
):
    
    # Settings are unique to the organization
    settings = db.query(models.ComplianceSettings).filter(models.ComplianceSettings.org_id== current_user.org_id).first()
    if not settings:
        settings = models.ComplianceSettings(org_id=current_user.org_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=schemas.ComplianceSettingsResponse)
def update_compliance_settings(
    obj_in: schemas.ComplianceSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin"]))
):
    
    settings = db.query(models.ComplianceSettings).filter(models.ComplianceSettings.org_id== current_user.org_id).first()
    if not settings:
        settings = models.ComplianceSettings(org_id=current_user.org_id)
        db.add(settings)
    
    for field, value in obj_in.model_dump().items():
        setattr(settings, field, value)
    
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/results", response_model=List[schemas.ScreeningResultBrief])
def get_screening_results(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    customer_ref: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Auditor", "Admin", "Analyst"]))
):
    query = db.query(ScreeningResult).join(
        models.User, models.User.username == ScreeningResult.screened_by
    ).filter(models.User.org_id== current_user.org_id)
    
    if status:
        query = query.filter(ScreeningResult.status == status)
    if risk_level:
        query = query.filter(ScreeningResult.risk_level == risk_level)
    if customer_ref:
        query = query.filter(ScreeningResult.customer_ref == customer_ref)
    
    return query.order_by(ScreeningResult.screened_at.desc()).offset(skip).limit(limit).all()

@router.post("/results/{result_id}/decision", response_model=schemas.ScreeningResultBrief)
def update_screening_decision(
    result_id: str,
    obj_in: schemas.ScreeningDecisionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin", "Analyst"]))
):
    try:
        uuid_val = uuid.UUID(result_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
        
    result = db.query(ScreeningResult).filter(ScreeningResult.id == uuid_val).first()
    if not result:
        raise HTTPException(status_code=404, detail="Screening result not found")
    
    result.final_decision = obj_in.decision
    result.status = obj_in.decision if obj_in.decision != "false_positive" else "cleared"
    result.reviewed_by = current_user.username
    result.reviewed_at = datetime.datetime.utcnow()
    result.notes = obj_in.notes
    
    # Optional logic: If marked as False Positive, we can whitelist the top match
    if obj_in.decision == "false_positive" and obj_in.whitelist_entity_id:
        # Check if already whitelisted
        existing = db.query(WhitelistedEntity).filter(
            WhitelistedEntity.customer_ref == result.customer_ref,
            WhitelistedEntity.entity_id == obj_in.whitelist_entity_id
        ).first()
        
        if not existing:
            whitelist = WhitelistedEntity(
                customer_ref = result.customer_ref,
                entity_id = obj_in.whitelist_entity_id,
                entity_name = result.customer_name, # or get from matches
                reason = obj_in.notes or "Marked as false positive during review",
                added_by = current_user.username
            )
            db.add(whitelist)

    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Auditor", "Admin", "Compliance Officer"]))
):
    # Only admins and auditors can view full audit logs
    # Filter by org_id for security
    return db.query(ScreeningAuditLog).join(
        models.User, models.User.username == ScreeningAuditLog.user_id
    ).filter(models.User.org_id == current_user.org_id).order_by(ScreeningAuditLog.timestamp.desc()).offset(skip).limit(limit).all()

@router.post("/{result_id}/monitor", response_model=dict)
async def toggle_monitoring(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin", "Analyst"]))
):
    """
    Toggle ongoing monitoring for a screening result.
    """
    try:
        uuid_val = uuid.UUID(result_id)
        result = db.query(ScreeningResult).filter(ScreeningResult.id == uuid_val).first()
        if not result:
             raise HTTPException(status_code=404, detail="Screening result not found")
        
        # Check if already monitored
        # We use the screening ID as the customer_ref for V2 monitoring
        existing = db.query(MonitoredEntity).filter(
            MonitoredEntity.customer_ref == str(uuid_val)
        ).first()
        
        if existing:
            # Toggle status
            existing.status = "active" if existing.status == "inactive" else "inactive"
            db.commit()
            return {"monitoring_enabled": existing.status == "active"}
        
        # Create new monitored entity
        # Extract query details from the screening result
        payload = result.query_payload or {}
        query_details = payload.get("details", {})
        if not query_details and "individual" in payload:
            query_details = payload.get("individual", {})
        if not query_details and "entity" in payload:
            query_details = payload.get("entity", {})

        new_monitored = MonitoredEntity(
            user_id=current_user.username,
            customer_ref=str(uuid_val),
            entity_id=result.top_match_id,
            query_name=result.customer_name,
            query_details=query_details,
            last_risk_level=result.risk_level
        )
        db.add(new_monitored)
        db.commit()
        return {"monitoring_enabled": True}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid result ID format")

@router.get("/results/{result_id}/ai-insights", response_model=List[schemas.AIInsightResponse])
async def get_ai_insights(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin", "Analyst"]))
):
    """
    Fetch AI-generated insights for a specific screening result.
    """
    try:
        uuid_val = uuid.UUID(result_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid result ID format")
        
    insights = db.query(AIInsight).filter(AIInsight.screening_result_id == uuid_val).all()
    
    if not insights:
        # Generate insights if not present
        result = db.query(ScreeningResult).filter(ScreeningResult.id == uuid_val).first()
        if not result:
            raise HTTPException(status_code=404, detail="Screening result not found")
            
        ai_service = AIEnhancementService(db)
        new_insights = await ai_service.analyze_screening_result(result)
        
        # Save to DB
        insights = []
        for insight_data in new_insights:
            db_insight = AIInsight(
                screening_result_id=uuid_val,
                feature=insight_data.feature.value,
                confidence=insight_data.confidence,
                explanation=insight_data.explanation,
                recommendations=insight_data.recommendations,
                insight_metadata=insight_data.metadata
            )
            db.add(db_insight)
            insights.append(db_insight)
        
        db.commit()
        
    return insights

@router.get("/monitoring/alerts", response_model=List[schemas.MonitoringAlertResponse])
def get_compliance_monitoring_alerts(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin", "Analyst"]))
):
    """
    Fetch monitoring alerts for the organization.
    """
    query = db.query(models.MonitoringAlert).join(
        models.MonitoredEntity, models.MonitoredEntity.id == models.MonitoringAlert.monitored_entity_id
    ).join(
        models.User, models.User.username == models.MonitoredEntity.user_id
    ).filter(models.User.org_id== current_user.org_id)
    
    if unread_only:
        query = query.filter(models.MonitoringAlert.is_read == False)
        
    return query.order_by(models.MonitoringAlert.created_at.desc()).offset(skip).limit(limit).all()
