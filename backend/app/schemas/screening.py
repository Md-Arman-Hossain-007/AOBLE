from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
import datetime

class ScreeningType(str, Enum):
    individual = "individual"
    entity     = "entity"

class ReviewRequest(BaseModel):
    decision: str  # "cleared" | "rejected" | "escalated" | "in_review"
    notes: Optional[str] = None
    match_id: Optional[str] = None
    match_idx: Optional[int] = None  # Index-based targeting to avoid entity_id collisions
    match_status: Optional[str] = None # "matched" | "false_positive" | "potential"

class RiskLevel(str, Enum):
    HIGH   = "HIGH"
    MEDIUM = "MEDIUM"
    LOW    = "LOW"

class Algorithm(str, Enum):
    logic_v2       = "logic-v2"
    logic_v1       = "logic-v1"
    name_based     = "name-based"
    name_qualified = "name-qualified"

class IndividualScreenRequest(BaseModel):
    name: str
    birth_date:       Optional[str] = None
    nationality:      Optional[str] = None
    id_number:        Optional[str] = None
    gender:           Optional[str] = None
    place_of_birth:   Optional[str] = None
    address:          Optional[str] = None
    phone:            Optional[str] = None
    email:            Optional[str] = None
    position:         Optional[str] = None

class EntityScreenRequest(BaseModel):
    name: str
    country:             Optional[str] = None
    registration_number: Optional[str] = None
    tax_id:              Optional[str] = None
    lei:                 Optional[str] = None
    imo_number:          Optional[str] = None
    address:             Optional[str] = None
    incorporation_date:  Optional[str] = None

class ScreenRequest(BaseModel):
    screening_type: str # individual | entity
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    country: Optional[str] = None
    date_of_birth: Optional[str] = None
    threshold: float = 0.65

class ExportRequest(BaseModel):
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    risk_level: Optional[str] = None # high | medium | low
    format: str = "csv" # csv | json

class ScreeningRequest(BaseModel):
    individual: Optional[IndividualScreenRequest] = None
    entity:     Optional[EntityScreenRequest]     = None
    customer_ref:     str
    screening_reason: Optional[str] = "manual"
    screened_by:      Optional[str] = None
    algorithm:        Algorithm = Algorithm.logic_v2
    match_limit:      int       = 5
    threshold:        float     = 0.65
    topics:           Optional[List[str]] = None
    include_datasets: Optional[List[str]] = None
    exclude_datasets: Optional[List[str]] = None
    batch_id:         Optional[str]       = None

class SourceDetail(BaseModel):
    identifier:        str
    title:             Optional[str] = None
    publisher:         Optional[str] = None
    publisher_country: Optional[str] = None
    source_url:        Optional[str] = None
    frequency:         Optional[str] = None

class SanctionDetail(BaseModel):
    authority:    Optional[List[str]] = Field(default_factory=list)
    program:      Optional[List[str]] = Field(default_factory=list)
    start_date:   Optional[List[str]] = Field(default_factory=list)
    end_date:     Optional[List[str]] = Field(default_factory=list)
    listing_date: Optional[List[str]] = Field(default_factory=list)
    reason:       Optional[List[str]] = Field(default_factory=list)
    source_url:   Optional[List[str]] = Field(default_factory=list)

class PassportDetail(BaseModel):
    number:      Optional[List[str]] = Field(default_factory=list)
    country:     Optional[List[str]] = Field(default_factory=list)
    expiry_date: Optional[List[str]] = Field(default_factory=list)
    issue_date:  Optional[List[str]] = Field(default_factory=list)

class AddressDetail(BaseModel):
    full:        Optional[List[str]] = Field(default_factory=list)
    city:        Optional[List[str]] = Field(default_factory=list)
    country:     Optional[List[str]] = Field(default_factory=list)
    postal_code: Optional[List[str]] = Field(default_factory=list)

class FamilyDetail(BaseModel):
    name:         Optional[str] = None
    entity_id:    Optional[str] = None
    relationship: Optional[List[str]] = Field(default_factory=list)

class OwnershipDetail(BaseModel):
    name:       Optional[str] = None
    entity_id:  Optional[str] = None
    percentage: Optional[List[str]] = Field(default_factory=list)
    start_date: Optional[List[str]] = Field(default_factory=list)

class MatchResult(BaseModel):
    match_id:    str = ""  # System-generated unique match ID (e.g., "M-1", "M-2")
    entity_id:   str = ""
    schema_type: str = "Entity"
    caption:     str = "Unknown"
    aliases:     List[str] = Field(default_factory=list)
    score:           float = 0.0
    risk_level:      RiskLevel = RiskLevel.LOW
    topic_risk:      float = 0.0
    primary_topic:   Optional[str] = None
    match_features:  Optional[Dict] = None
    topics:   List[str] = Field(default_factory=list)
    datasets: List[str] = Field(default_factory=list)
    sources:  List[SourceDetail] = Field(default_factory=list)
    birth_dates:    List[str] = Field(default_factory=list)
    nationalities:  List[str] = Field(default_factory=list)
    countries:      List[str] = Field(default_factory=list)
    id_numbers:     List[str] = Field(default_factory=list)
    positions:      List[str] = Field(default_factory=list)
    gender:         List[str] = Field(default_factory=list)
    sanctions:  List[SanctionDetail] = Field(default_factory=list)
    passports:  List[PassportDetail] = Field(default_factory=list)
    addresses:  List[AddressDetail] = Field(default_factory=list)
    family:     List[FamilyDetail] = Field(default_factory=list)
    ownership:  List[OwnershipDetail] = Field(default_factory=list)
    opensanctions_url: Optional[str] = None
    status: str = "potential" # "potential" | "matched" | "false_positive"

class ScreeningResponse(BaseModel):
    screening_id:    str = ""
    screened_at:     str = ""
    customer_ref:    str = ""
    screening_type:  str = "individual"
    screening_reason: Optional[str] = "manual"
    algorithm:       str = "logic-v2"
    duration_ms:     int = 0
    query_name:      str = ""
    query_details:   Dict[str, Any] = Field(default_factory=dict)
    match_count:     int = 0
    top_score:       float = 0.0
    risk_level:      RiskLevel = RiskLevel.LOW
    auto_decision:   str = "clear"
    matches: List[MatchResult] = Field(default_factory=list)
    batch_id:        Optional[str] = None

class ScreeningSummary(BaseModel):
    total_matches: int = 0
    max_score: float = 0.0

class SearchQuery(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    date_of_birth: Optional[str] = None

class ScreenResponse(BaseModel):
    screening_id: str
    query: SearchQuery
    timestamp: datetime.datetime
    overall_status: str
    monitoring_enabled: Optional[bool] = False
    decision: Optional[str] = None
    notes: Optional[str] = None
    matches: List[Any] = Field(default_factory=list)
    summary: ScreeningSummary

# Aliases for backward compatibility
ScreeningResponseV2 = ScreeningResponse

class BatchScreeningRequest(BaseModel):
    screenings:       List[ScreeningRequest]
    screening_reason: Optional[str] = "batch"
    screened_by:      Optional[str] = None

class BatchScreeningResponse(BaseModel):
    total:      int
    high_risk:  int
    medium_risk: int
    low_risk:   int
    duration_ms: int
    results:    List[ScreeningResponse]

class ScreeningListEntry(BaseModel):
    id: str = ""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    status: str = "Pending"
    monitoring_enabled: Optional[bool] = False
    match_count: int = 0
    top_match_id: Optional[str] = None
    top_match_name: Optional[str] = None

    model_config = {"from_attributes": True}
