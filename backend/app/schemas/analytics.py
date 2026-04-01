from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from enum import Enum

class AnalyticsPeriod(str, Enum):
    LAST_24_HOURS = "24h"
    LAST_7_DAYS = "7d"
    LAST_30_DAYS = "30d"
    LAST_90_DAYS = "90d"
    CUSTOM = "custom"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ScreeningStats(BaseModel):
    total_screenings: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_score: float
    top_countries: List[Tuple[str, int]]
    top_datasets: List[Tuple[str, int]]
    time_series: List[Dict[str, Any]]
    entity_breakdown: Dict[str, int] = {"individual": 0, "entity": 0}
    match_breakdown: Dict[str, int] = {"pep": 0, "sanctions": 0, "adverse_media": 0, "clear": 0}

class UserActivityStats(BaseModel):
    active_user_rate: float
    screenings_per_active_user: float
    most_active_user: Tuple[str, int]
    user_retention: float

class ComplianceStats(BaseModel):
    case_resolution_rate: float
    average_resolution_time: float
    false_positive_rate: float
    monitoring_coverage: float
    pending_cases: int

class RiskTrend(BaseModel):
    high_risk_trend: str
    medium_risk_trend: str
    low_risk_trend: str

class RiskDistribution(BaseModel):
    high_risk_percentage: float
    medium_risk_percentage: float
    low_risk_percentage: float
    risk_trend: RiskTrend

class SystemPerformance(BaseModel):
    average_response_time: float
    system_uptime: float
    error_rate: float
    data_quality_score: float

class DashboardMetrics(BaseModel):
    screening_volume: ScreeningStats
    risk_distribution: RiskDistribution
    user_engagement: UserActivityStats
    compliance_health: ComplianceStats
    system_performance: SystemPerformance
    time_series: List[Dict[str, Any]]
    risk_counts: Dict[str, int]
    stats: Optional[Dict[str, Any]] = None # For backward compatibility with UI

class AnalyticsReportRequest(BaseModel):
    report_type: str
    start_date: datetime
    end_date: datetime
    filters: Optional[Dict[str, Any]] = None
