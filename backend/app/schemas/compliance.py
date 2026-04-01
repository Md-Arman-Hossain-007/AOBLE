from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Any, Dict
import uuid

class ComplianceSettingsBase(BaseModel):
    fuzzy_threshold: int = 80
    enable_pep: bool = True
    enable_sanctions: bool = True
    enable_adverse_media: bool = True
    auto_clear_threshold: int = 50

class ComplianceSettingsUpdate(ComplianceSettingsBase):
    pass

class ComplianceSettingsResponse(ComplianceSettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class ScreeningResultBrief(BaseModel):
    id: uuid.UUID
    screened_at: datetime
    customer_name: str
    customer_ref: str
    match_count: int
    top_score: float
    risk_level: str
    status: str
    final_decision: Optional[str]
    reviewed_by: Optional[str]

    class Config:
        from_attributes = True

class ScreeningDecisionUpdate(BaseModel):
    decision: str = Field(..., description="match | false_positive | review_needed")
    notes: Optional[str] = None
    whitelist_entity_id: Optional[str] = Field(None, description="If provided, this entity will be whitelisted for this customer")

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    timestamp: datetime
    user_id: str
    query_name: str
    match_count: int
    dataset_version: str
    search_context: Optional[str]

    class Config:
        from_attributes = True
class AIInsightResponse(BaseModel):
    id: uuid.UUID
    feature: str
    confidence: float
    explanation: str
    recommendations: List[str]
    insight_metadata: Optional[Dict[str, Any]] = Field(default={}, alias="metadata")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class MonitoringAlertResponse(BaseModel):
    id: uuid.UUID
    monitored_entity_id: uuid.UUID
    previous_risk: str
    new_risk: str
    change_type: str
    is_read: bool
    created_at: datetime
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
