from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CaseStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"

class CasePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CaseType(str, Enum):
    SCREENING_MATCH = "screening_match"
    MANUAL_REVIEW = "manual_review"
    CUSTOMER_REQUEST = "customer_request"
    REGULATORY_INQUIRY = "regulatory_inquiry"

class NoteType(str, Enum):
    GENERAL = "general"
    RESOLUTION = "resolution"
    ESCALATION = "escalation"
    INVESTIGATION = "investigation"

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class ResolutionType(str, Enum):
    MANUAL = "manual"
    AUTOMATED = "automated"
    ESCALATED = "escalated"

class CaseCreate(BaseModel):
    case_type: CaseType
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    priority: CasePriority = CasePriority.MEDIUM
    customer_ref: Optional[str] = None

class CaseStatusUpdate(BaseModel):
    status: CaseStatus
    resolution_notes: Optional[str] = None
    resolution_type: Optional[ResolutionType] = None
    escalation_reason: Optional[str] = None

class CaseAssignmentCreate(BaseModel):
    assigned_to: str = Field(..., min_length=3)
    reason: Optional[str] = Field(None, max_length=500)

class CaseNoteCreate(BaseModel):
    content: str = Field(..., min_length=5, max_length=2000)
    note_type: NoteType = NoteType.GENERAL

class WorkflowStepCompletion(BaseModel):
    completion_notes: Optional[str] = Field(None, max_length=1000)
    step_data: Optional[Dict[str, Any]] = None

class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    steps: List[Dict[str, Any]] = Field(..., min_items=1)
    auto_assign: bool = False
    escalation_rules: List[Dict[str, Any]] = []

class WorkflowAssignment(BaseModel):
    workflow_id: str

class CaseResponse(BaseModel):
    id: str
    case_type: CaseType
    title: str
    description: str
    status: CaseStatus
    priority: CasePriority
    assigned_to: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime]
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    resolution_notes: Optional[str]
    resolution_type: Optional[ResolutionType]
    escalated_at: Optional[datetime]
    escalated_by: Optional[str]
    escalation_reason: Optional[str]
    org_id: str
    customer_ref: Optional[str]
    screening_result_id: Optional[str]

    class Config:
        from_attributes = True

class CaseAssignmentResponse(BaseModel):
    id: str
    case_id: str
    assigned_to: str
    assigned_by: str
    assigned_at: datetime
    reason: Optional[str]
    status: str

    class Config:
        from_attributes = True

class CaseNoteResponse(BaseModel):
    id: str
    case_id: str
    author: str
    content: str
    note_type: NoteType
    created_at: datetime

    class Config:
        from_attributes = True

class CaseHistoryResponse(BaseModel):
    id: str
    case_id: str
    action: str
    description: str
    performed_by: str
    metadata: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    steps: List[Dict[str, Any]]
    auto_assign: bool
    escalation_rules: List[Dict[str, Any]]
    is_active: bool
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkflowStepResponse(BaseModel):
    id: str
    workflow_id: str
    step_name: str
    step_type: str
    parameters: Dict[str, Any]
    order: int
    required_approvals: int
    timeout_minutes: int

    class Config:
        from_attributes = True

class WorkflowInstanceResponse(BaseModel):
    id: str
    case_id: str
    workflow_id: str
    status: WorkflowStatus
    current_step: int
    step_data: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime]
    completed_by: Optional[str]

    class Config:
        from_attributes = True

class CaseDetailResponse(BaseModel):
    case: CaseResponse
    assignments: List[CaseAssignmentResponse]
    notes: List[CaseNoteResponse]
    history: List[CaseHistoryResponse]
    workflow_instance: Optional[WorkflowInstanceResponse]
    related_screening: Optional[Dict[str, Any]]

class CaseStatsResponse(BaseModel):
    total_cases: int
    pending_cases: int
    resolved_cases: int
    escalated_cases: int
    resolution_rate: float
    avg_resolution_time: float
    case_types: Dict[str, int]
    priorities: Dict[str, int]
    open_cases_by_assignee: List[Dict[str, Any]]

class CaseAnalyticsResponse(BaseModel):
    period: Dict[str, str]
    metrics: Dict[str, Any]
    distributions: Dict[str, Any]

# Bulk Operation Schemas
class BulkCaseAssignment(BaseModel):
    case_ids: List[str] = Field(..., min_items=1)
    assigned_to: str = Field(..., min_length=3)
    reason: Optional[str] = Field(None, max_length=500)

class BulkCaseAction(BaseModel):
    case_ids: List[str] = Field(..., min_items=1)
    reason: Optional[str] = Field(None, max_length=1000)

class CaseWithSLA(BaseModel):
    id: str
    case_type: str
    title: str
    description: str
    status: str
    priority: str
    assigned_to: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime]
    resolved_at: Optional[datetime]
    customer_ref: Optional[str]
    sla_status: str  # ok, warning, breached
    time_remaining_hours: Optional[float]

    class Config:
        from_attributes = True

class CaseListResponse(BaseModel):
    cases: List[Dict[str, Any]]
    total: int
    skip: int
    limit: int

class RiskFactor(BaseModel):
    factor: str
    score: float
    weight: float

class RiskAssessmentResponse(BaseModel):
    case_id: str
    overall_risk_score: float
    risk_level: str  # low, medium, high, critical
    risk_factors: List[RiskFactor]
    assessed_at: str

class RelatedCase(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    case_type: str
    created_at: str
    relationship: str  # same_customer, similar_title

class RelatedCasesResponse(BaseModel):
    case_id: str
    related_cases: List[RelatedCase]
    total_related: int

class UserSimpleResponse(BaseModel):
    username: str
    full_name: str
    role: str
    email: str

    class Config:
        from_attributes = True