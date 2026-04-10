from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class HistoryItem(BaseModel):
    id: str
    type: str  # screening, case, bulk, individual, entity
    action: str
    subject: str
    subject_type: str
    user_id: str
    timestamp: str
    status: str
    details: Optional[Dict[str, Any]] = None

class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    skip: int
    limit: int

class AuditLogItem(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource: str
    success: bool
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    timestamp: str

class AuditLogListResponse(BaseModel):
    items: List[AuditLogItem]
    total: int
    skip: int
    limit: int

class DailyTrend(BaseModel):
    date: str
    count: int

class TopUser(BaseModel):
    user_id: str
    count: int

class HistoryStatsResponse(BaseModel):
    period_days: int
    total_screenings: int
    individual_screenings: int
    entity_screenings: int
    total_cases: int
    daily_trend: List[DailyTrend]
    top_users: List[TopUser]
