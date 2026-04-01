from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from ..db.session import get_db
from ..api.auth import get_current_active_user
from ..models import models
from ..schemas import integrations as schemas
from ..services.integrations import IntegrationManager, IntegrationType

router = APIRouter()

@router.get("/configs", response_model=List[schemas.IntegrationConfigRead])
async def list_integration_configs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """List all integration configurations for the current organization."""
    return db.query(models.IntegrationConfig).filter(
        models.IntegrationConfig.org_id == current_user.org_id
    ).all()

@router.post("/configs", response_model=schemas.IntegrationConfigRead)
async def create_integration_config(
    request: schemas.IntegrationConfigCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a new integration configuration."""
    # Check if config already exists for this type and org
    existing = db.query(models.IntegrationConfig).filter(
        models.IntegrationConfig.org_id == current_user.org_id,
        models.IntegrationConfig.integration_type == request.integration_type
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Integration of type {request.integration_type} already exists. Update it instead."
        )

    db_config = models.IntegrationConfig(
        org_id=current_user.org_id,
        integration_type=request.integration_type,
        config=request.config,
        is_active=request.is_active
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.put("/configs/{config_id}", response_model=schemas.IntegrationConfigRead)
async def update_integration_config(
    config_id: str,
    request: schemas.IntegrationConfigUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update an existing integration configuration."""
    db_config = db.query(models.IntegrationConfig).filter(
        models.IntegrationConfig.id == config_id,
        models.IntegrationConfig.org_id == current_user.org_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="Integration config not found")

    if request.config is not None:
        db_config.config = request.config
    if request.is_active is not None:
        db_config.is_active = request.is_active
    
    db_config.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_config)
    return db_config

@router.post("/configs/{config_id}/test", response_model=schemas.IntegrationTestResult)
async def test_integration_connection(
    config_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Test the connection of a specific integration."""
    db_config = db.query(models.IntegrationConfig).filter(
        models.IntegrationConfig.id == config_id,
        models.IntegrationConfig.org_id == current_user.org_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="Integration config not found")

    manager = IntegrationManager(db)
    try:
        # Convert string type to Enum if needed
        itype = IntegrationType(db_config.integration_type)
        integration = manager.register_integration(itype, db_config.config)
        result = await integration.test_connection()
        return schemas.IntegrationTestResult(
            success=result.success,
            message=result.message,
            error=result.error
        )
    except Exception as e:
        return schemas.IntegrationTestResult(
            success=False,
            message="Test failed due to internal error",
            error=str(e)
        )

@router.get("/webhooks", response_model=List[schemas.WebhookRead])
async def list_webhooks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """List all webhooks for the current organization."""
    return db.query(models.Webhook).filter(
        models.Webhook.org_id == current_user.org_id
    ).all()

@router.post("/webhooks", response_model=schemas.WebhookRead)
async def create_webhook(
    request: schemas.WebhookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Register a new webhook."""
    db_webhook = models.Webhook(
        org_id=current_user.org_id,
        url=str(request.url),
        events=request.events,
        headers=request.headers,
        is_active=request.is_active
    )
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook

@router.delete("/webhooks/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a webhook registration."""
    db_webhook = db.query(models.Webhook).filter(
        models.Webhook.id == webhook_id,
        models.Webhook.org_id == current_user.org_id
    ).first()
    
    if not db_webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    db.delete(db_webhook)
    db.commit()
    return None
