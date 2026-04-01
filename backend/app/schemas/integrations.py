from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class IntegrationType(str, Enum):
    SALESFORCE = "salesforce"
    HUBSPOT = "hubspot"
    SLACK = "slack"
    MICROSOFT_TEAMS = "microsoft_teams"
    WEBHOOK = "webhook"
    SIEM = "siem"

class WebhookBase(BaseModel):
    url: HttpUrl
    events: List[str]
    headers: Optional[Dict[str, str]] = {}
    is_active: bool = True

class WebhookCreate(WebhookBase):
    pass

class WebhookUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    events: Optional[List[str]] = None
    headers: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class WebhookRead(WebhookBase):
    id: str
    org_id: str
    created_at: datetime
    last_used: Optional[datetime] = None

    class Config:
        from_attributes = True

class IntegrationConfigBase(BaseModel):
    integration_type: IntegrationType
    config: Dict[str, Any]
    is_active: bool = False

class IntegrationConfigCreate(IntegrationConfigBase):
    pass

class IntegrationConfigUpdate(BaseModel):
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class IntegrationConfigRead(IntegrationConfigBase):
    id: str
    org_id: str
    last_sync: Optional[datetime] = None
    sync_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IntegrationTestResult(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None
