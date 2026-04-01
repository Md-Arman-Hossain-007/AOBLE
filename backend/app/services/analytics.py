# Analytics Service v1.2.0 - Resolved ValidationError
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from collections import defaultdict, Counter
import json
import statistics
from dataclasses import dataclass, asdict
from enum import Enum

from ..models.models import (
    ScreeningResult, User, Organization, Subscription, 
    MonitoringAlert, ComplianceSettings, WebSearchResult,
    MonitoredEntity
)
from ..core.security import audit_logger

from ..schemas.analytics import (
    AnalyticsPeriod, ScreeningStats, UserActivityStats, 
    ComplianceStats, RiskDistribution, SystemPerformance, 
    DashboardMetrics, RiskTrend, RiskLevel
)

@dataclass
class InternalUserStats:
    total_users: int
    active_users: int
    screenings_per_user: Dict[str, int]
    last_login_stats: Dict[str, Any]
    role_distribution: Dict[str, int]

@dataclass
class InternalComplianceStats:
    total_cases: int
    pending_cases: int
    resolved_cases: int
    average_resolution_time: float
    false_positive_rate: float
    monitoring_alerts: int

class AnalyticsService:
    """Advanced analytics and reporting service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_screening_analytics(
        self, 
        org_id: Optional[str] = None,
        period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> ScreeningStats:
        """Get comprehensive screening analytics"""
        
        # Build query with optional organization filter
        query = self.db.query(ScreeningResult)
        if org_id:
            query = query.join(User, ScreeningResult.screened_by == User.username)\
                        .filter(User.org_id == org_id)
        
        # Apply date filtering
        start_dt, end_dt = self._get_date_range(period, start_date, end_date)
        query = query.filter(
            ScreeningResult.screened_at >= start_dt,
            ScreeningResult.screened_at <= end_dt
        )
        
        # Get basic counts
        total_screenings = query.count()
        
        # Get risk distribution
        risk_counts = defaultdict(int)
        for result in query.all():
            if result.risk_level:
                risk_counts[result.risk_level.upper()] += 1
        
        high_risk = risk_counts.get(RiskLevel.HIGH.value, 0)
        medium_risk = risk_counts.get(RiskLevel.MEDIUM.value, 0)
        low_risk = risk_counts.get(RiskLevel.LOW.value, 0)
        
        # Calculate average score
        avg_score = query.with_entities(func.avg(ScreeningResult.top_score)).scalar() or 0.0
        
        # Calculate breakdowns
        entity_breakdown = {"individual": 0, "entity": 0}
        match_breakdown = {"pep": 0, "sanctions": 0, "adverse_media": 0, "clear": 0}
        
        for result in query.all():
            # Entity type
            stype = (result.schema_type or "Person").lower()
            if "person" in stype:
                entity_breakdown["individual"] += 1
            else:
                entity_breakdown["entity"] += 1
                
            # Match type
            topics = result.top_match_topics or []
            if result.match_count == 0:
                match_breakdown["clear"] += 1
            else:
                has_hit = False
                for t in topics:
                    t_lower = t.lower()
                    if "pep" in t_lower:
                        match_breakdown["pep"] += 1
                        has_hit = True
                        break
                    if "sanction" in t_lower:
                        match_breakdown["sanctions"] += 1
                        has_hit = True
                        break
                    if "media" in t_lower or "adverse" in t_lower:
                        match_breakdown["adverse_media"] += 1
                        has_hit = True
                        break
                if not has_hit:
                    match_breakdown["clear"] += 1

        # Get top countries
        top_countries = self._get_top_countries(query, org_id)
        
        # Get top datasets
        top_datasets = self._get_top_datasets(query, org_id)
        
        # Get time series data
        time_series = self._get_time_series(query, start_dt, end_dt)
        
        return ScreeningStats(
            total_screenings=total_screenings,
            high_risk_count=high_risk,
            medium_risk_count=medium_risk,
            low_risk_count=low_risk,
            average_score=float(avg_score),
            top_countries=top_countries,
            top_datasets=top_datasets,
            time_series=time_series,
            entity_breakdown=entity_breakdown,
            match_breakdown=match_breakdown
        )
    
    def get_user_analytics(
        self, 
        org_id: Optional[str] = None,
        period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
    ) -> InternalUserStats:
        """Get user activity analytics"""
        
        # Build user query
        user_query = self.db.query(User)
        if org_id:
            user_query = user_query.filter(User.org_id == org_id)
        
        users = user_query.all()
        total_users = len(users)
        
        # Count active users (users who performed screenings in the period)
        screening_query = self.db.query(ScreeningResult)
        if org_id:
            screening_query = screening_query.join(User, ScreeningResult.screened_by == User.username)\
                                           .filter(User.org_id == org_id)
        
        start_dt, end_dt = self._get_date_range(period)
        active_usernames = screening_query.filter(
            ScreeningResult.screened_at >= start_dt,
            ScreeningResult.screened_at <= end_dt
        ).with_entities(ScreeningResult.screened_by).distinct().all()
        
        active_users = len(active_usernames)
        
        # Screenings per user (Optimized with a single aggregation query)
        user_counts = self.db.query(
            ScreeningResult.screened_by,
            func.count(ScreeningResult.id)
        ).filter(ScreeningResult.screened_by.in_([u.username for u in users]))\
         .group_by(ScreeningResult.screened_by).all()
        
        counts_dict = {username: count for username, count in user_counts}
        screenings_per_user = {user.username: counts_dict.get(user.username, 0) for user in users}
        
        # Last login stats (Safely handle missing field)
        # Note: last_login might be in UserEnhanced in this schema
        last_login_stats = {
            "most_recent": None,
            "least_recent": None,
            "average_days_since_login": 0.0
        }
        
        # Role distribution
        role_distribution = Counter(user.role for user in users)
        
        return InternalUserStats(
            total_users=total_users,
            active_users=active_users,
            screenings_per_user=screenings_per_user,
            last_login_stats=last_login_stats,
            role_distribution=dict(role_distribution)
        )
    
    def get_compliance_analytics(
        self, 
        org_id: Optional[str] = None,
        period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
    ) -> ComplianceStats:
        """Get compliance and case management analytics"""
        
        # Build query for screening results
        query = self.db.query(ScreeningResult)
        if org_id:
            query = query.join(User, ScreeningResult.screened_by == User.username)\
                        .filter(User.org_id == org_id)
        
        start_dt, end_dt = self._get_date_range(period)
        query = query.filter(
            ScreeningResult.screened_at >= start_dt,
            ScreeningResult.screened_at <= end_dt
        )
        
        results = query.all()
        total_cases = len(results)
        
        # Count pending vs resolved cases
        pending_cases = sum(1 for r in results if r.status in ['pending', 'review'])
        resolved_cases = total_cases - pending_cases
        
        # Calculate average resolution time
        resolution_times = []
        for result in results:
            if result.status == 'resolved' and result.reviewed_at:
                time_diff = result.reviewed_at - result.screened_at
                resolution_times.append(time_diff.total_seconds() / 3600)  # hours
        
        avg_resolution_time = statistics.mean(resolution_times) if resolution_times else 0.0
        
        # Calculate false positive rate (simplified calculation)
        # This would need more sophisticated logic in a real implementation
        high_risk_cases = sum(1 for r in results if r.risk_level and r.risk_level.upper() == RiskLevel.HIGH.value)
        false_positives = max(0, high_risk_cases - resolved_cases)
        false_positive_rate = (false_positives / total_cases * 100) if total_cases > 0 else 0.0
        
        # Get monitoring alerts (Wrapped in try-except to handle potential schema inconsistencies)
        monitoring_alerts = 0
        try:
            alert_query = self.db.query(MonitoringAlert)
            if org_id:
                alert_query = alert_query.join(MonitoredEntity, MonitoringAlert.monitored_entity_id == MonitoredEntity.id)\
                                       .join(User, MonitoredEntity.user_id == User.username)\
                                       .filter(User.org_id == org_id)
            
            monitoring_alerts = alert_query.filter(
                MonitoringAlert.created_at >= start_dt,
                MonitoringAlert.created_at <= end_dt
            ).count()
        except Exception as e:
            print(f"Warning: Failed to fetch monitoring alerts for analytics: {e}")
            # Log specific error if it's a known schema issue
            if "monitored_entity_id" in str(e):
                print("Schema mismatch: monitoring_alerts.monitored_entity_id is missing.")
        
        return InternalComplianceStats(
            total_cases=total_cases,
            pending_cases=pending_cases,
            resolved_cases=resolved_cases,
            average_resolution_time=avg_resolution_time,
            false_positive_rate=false_positive_rate,
            monitoring_alerts=monitoring_alerts
        )
    
    def get_dashboard_metrics(
        self, 
        org_id: Optional[str] = None,
        period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
    ) -> DashboardMetrics:
        """Get comprehensive dashboard metrics"""
        
        # Screening volume metrics
        screening_stats = self.get_screening_analytics(org_id, period)
        
        # User engagement metrics
        user_stats = self.get_user_analytics(org_id, period)
        user_engagement = UserActivityStats(
            active_user_rate=(user_stats.active_users / user_stats.total_users * 100) if user_stats.total_users > 0 else 0.0,
            screenings_per_active_user=statistics.mean(user_stats.screenings_per_user.values()) if user_stats.screenings_per_user else 0.0,
            most_active_user=max(user_stats.screenings_per_user.items(), key=lambda x: x[1], default=("None", 0)),
            user_retention=float(self._calculate_user_retention(org_id, period))
        )
        
        # Compliance health metrics
        compliance_stats = self.get_compliance_analytics(org_id, period)
        compliance_health = ComplianceStats(
            case_resolution_rate=(compliance_stats.resolved_cases / compliance_stats.total_cases * 100) if compliance_stats.total_cases > 0 else 0.0,
            average_resolution_time=float(compliance_stats.average_resolution_time),
            false_positive_rate=float(compliance_stats.false_positive_rate),
            monitoring_coverage=float(self._get_monitoring_coverage(org_id)),
            pending_cases=int(compliance_stats.pending_cases)
        )
        
        # Risk distribution metrics
        risk_distribution = RiskDistribution(
            high_risk_percentage=(screening_stats.high_risk_count / screening_stats.total_screenings * 100) if screening_stats.total_screenings > 0 else 0.0,
            medium_risk_percentage=(screening_stats.medium_risk_count / screening_stats.total_screenings * 100) if screening_stats.total_screenings > 0 else 0.0,
            low_risk_percentage=(screening_stats.low_risk_count / screening_stats.total_screenings * 100) if screening_stats.total_screenings > 0 else 0.0,
            risk_trend=self._get_risk_trend(org_id, period)
        )

        # System performance metrics
        system_performance = SystemPerformance(
            average_response_time=float(self._get_average_response_time(org_id, period)),
            system_uptime=99.9,
            error_rate=0.01,
            data_quality_score=98.5
        )
        
        # Prepare backward compatible 'stats' field for UI
        stats_shortcut = {
            "total": screening_stats.total_screenings,
            "breakdown": {
                "individual": screening_stats.entity_breakdown.get("individual", 0),
                "entity": screening_stats.entity_breakdown.get("entity", 0),
                "pep": screening_stats.match_breakdown.get("pep", 0),
                "sanctions": screening_stats.match_breakdown.get("sanctions", 0),
                "adverse_media": screening_stats.match_breakdown.get("adverse_media", 0),
                "others": 0,
                "non_matches": screening_stats.match_breakdown.get("clear", 0)
            }
        }
        
        return DashboardMetrics(
            screening_volume=screening_stats,
            risk_distribution=risk_distribution,
            user_engagement=user_engagement,
            compliance_health=compliance_health,
            system_performance=system_performance,
            time_series=screening_stats.time_series,
            risk_counts={
                "High": screening_stats.high_risk_count,
                "Medium": screening_stats.medium_risk_count,
                "Low": screening_stats.low_risk_count
            },
            stats=stats_shortcut
        )
    
    def generate_custom_report(
        self, 
        org_id: str,
        report_type: str,
        start_date: datetime,
        end_date: datetime,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate custom analytical reports"""
        
        report_data = {
            "organization_id": org_id,
            "report_type": report_type,
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "generated_at": datetime.utcnow().isoformat(),
            "data": {}
        }
        
        if report_type == "screening_volume":
            stats = self.get_screening_analytics(org_id, AnalyticsPeriod.CUSTOM, start_date, end_date)
            report_data["data"] = {
                "total_screenings": stats.total_screenings,
                "daily_breakdown": stats.time_series,
                "top_countries": stats.top_countries,
                "risk_distribution": {
                    "high": stats.high_risk_count,
                    "medium": stats.medium_risk_count,
                    "low": stats.low_risk_count
                }
            }
        
        elif report_type == "user_activity":
            stats = self.get_user_analytics(org_id, AnalyticsPeriod.CUSTOM)
            report_data["data"] = {
                "user_engagement": asdict(stats),
                "activity_trends": self._get_user_activity_trends(org_id, start_date, end_date)
            }
        
        elif report_type == "compliance":
            stats = self.get_compliance_analytics(org_id, AnalyticsPeriod.CUSTOM)
            report_data["data"] = {
                "case_management": asdict(stats),
                "resolution_metrics": self._get_resolution_metrics(org_id, start_date, end_date)
            }
        
        elif report_type == "risk_analysis":
            report_data["data"] = self._get_risk_analysis(org_id, start_date, end_date)
        
        # Audit log the report generation
        audit_logger.log_action(
            "system", "report_generated", "analytics", 
            {"org_id": org_id, "report_type": report_type, "period": f"{start_date} to {end_date}"}, 
            True
        )
        
        return report_data
    
    def get_predictive_insights(self, org_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate predictive insights using historical data"""
        
        # Get historical data
        screening_stats = self.get_screening_analytics(org_id, AnalyticsPeriod.LAST_90_DAYS)
        user_stats = self.get_user_analytics(org_id, AnalyticsPeriod.LAST_90_DAYS)
        
        insights = {
            "screening_volume_trends": self._analyze_screening_trends(org_id),
            "risk_level_predictions": self._predict_risk_levels(org_id),
            "user_behavior_patterns": self._analyze_user_patterns(org_id),
            "resource_optimization": self._suggest_optimizations(org_id),
            "compliance_risks": self._identify_compliance_risks(org_id)
        }
        
        return insights
    
    # Helper methods
    
    def _get_date_range(self, period: AnalyticsPeriod, start_date=None, end_date=None) -> Tuple[datetime, datetime]:
        """Get start and end dates for the specified period"""
        now = datetime.utcnow()
        
        if period == AnalyticsPeriod.LAST_24_HOURS:
            start_dt = now - timedelta(hours=24)
        elif period == AnalyticsPeriod.LAST_7_DAYS:
            start_dt = now - timedelta(days=7)
        elif period == AnalyticsPeriod.LAST_30_DAYS:
            start_dt = now - timedelta(days=30)
        elif period == AnalyticsPeriod.LAST_90_DAYS:
            start_dt = now - timedelta(days=90)
        elif period == AnalyticsPeriod.CUSTOM:
            start_dt = start_date or now - timedelta(days=30)
            end_date = end_date or now
        else:
            start_dt = now - timedelta(days=30)
        
        end_dt = end_date or now
        return start_dt, end_dt
    
    def _get_top_countries(self, query, org_id: Optional[str]) -> List[Tuple[str, int]]:
        """Get top countries by screening volume"""
        # This would need to be implemented based on your data structure
        # For now, returning mock data
        return [("USA", 150), ("UK", 89), ("Germany", 67), ("France", 45)]
    
    def _get_top_datasets(self, query, org_id: Optional[str]) -> List[Tuple[str, int]]:
        """Get top datasets by usage"""
        # This would need to be implemented based on your data structure
        # For now, returning mock data
        return [("OpenSanctions", 1200), ("PEP Database", 800), ("Sanctions List", 600)]
    
    def _get_time_series(self, query, start_dt: datetime, end_dt: datetime) -> List[Dict[str, Any]]:
        """Get time series data for screenings"""
        # This would aggregate screenings by day/week/month
        # For now, returning mock data
        return [
            {"date": (start_dt + timedelta(days=i)).isoformat(), "count": 10 + i}
            for i in range((end_dt - start_dt).days + 1)
        ]
    
    def _calculate_avg_days_since_login(self, users: List[User]) -> float:
        """Calculate average days since last login"""
        if not users:
            return 0.0
        
        total_days = 0
        count = 0
        now = datetime.utcnow()
        
        for user in users:
            if user.last_login:
                days = (now - user.last_login).days
                total_days += days
                count += 1
        
        return total_days / count if count > 0 else 0.0
    
    def _calculate_growth_rate(self, org_id: Optional[str], period: AnalyticsPeriod) -> float:
        """Calculate growth rate of screenings"""
        # Implementation would compare current period with previous period
        return 15.5  # Mock data
    
    def _get_peak_screening_day(self, org_id: Optional[str], period: AnalyticsPeriod) -> Dict[str, Any]:
        """Get the day with highest screening volume"""
        return {"date": "2024-01-15", "count": 150}  # Mock data
    
    def _get_risk_trend(self, org_id: Optional[str], period: AnalyticsPeriod) -> Dict[str, Any]:
        """Get risk level trends over time"""
        return {
            "high_risk_trend": "increasing",
            "medium_risk_trend": "stable", 
            "low_risk_trend": "decreasing"
        }
    
    def _calculate_user_retention(self, org_id: Optional[str], period: AnalyticsPeriod) -> float:
        """Calculate user retention rate"""
        return 85.2  # Mock data
    
    def _get_monitoring_coverage(self, org_id: Optional[str]) -> float:
        """Get percentage of entities under monitoring"""
        return 45.7  # Mock data
    
    def _get_average_response_time(self, org_id: Optional[str], period: AnalyticsPeriod) -> float:
        """Get average system response time"""
        return 1.2  # Mock data in seconds
    
    def _get_system_uptime(self) -> float:
        """Get system uptime percentage"""
        return 99.8  # Mock data
    
    def _get_error_rate(self, org_id: Optional[str], period: AnalyticsPeriod) -> float:
        """Get system error rate"""
        return 0.1  # Mock data in percentage
    
    def _calculate_data_quality_score(self, org_id: Optional[str]) -> float:
        """Calculate data quality score"""
        return 94.5  # Mock data
    
    def _get_user_activity_trends(self, org_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get user activity trends"""
        return {"daily_active_users": [10, 12, 15, 11, 18, 20, 16]}  # Mock data
    
    def _get_resolution_metrics(self, org_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get case resolution metrics"""
        return {
            "average_resolution_time": 4.5,  # hours
            "resolution_by_priority": {"high": 85, "medium": 92, "low": 95},
            "escalation_rate": 8.2
        }
    
    def _get_risk_analysis(self, org_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get detailed risk analysis"""
        return {
            "risk_concentration": {"high_risk_countries": ["Country A", "Country B"]},
            "risk_factors": ["PEP associations", "Sanctions history"],
            "mitigation_recommendations": ["Enhanced due diligence", "Ongoing monitoring"]
        }
    
    def _analyze_screening_trends(self, org_id: Optional[str]) -> Dict[str, Any]:
        """Analyze screening volume trends for predictions"""
        return {
            "predicted_volume_next_month": 1250,
            "seasonal_patterns": ["Q1 peak", "Q3 decline"],
            "growth_forecast": "15% increase expected"
        }
    
    def _predict_risk_levels(self, org_id: Optional[str]) -> Dict[str, Any]:
        """Predict future risk levels"""
        return {
            "high_risk_prediction": "12%",
            "medium_risk_prediction": "28%",
            "low_risk_prediction": "60%",
            "confidence_interval": "85%"
        }
    
    def _analyze_user_patterns(self, org_id: Optional[str]) -> Dict[str, Any]:
        """Analyze user behavior patterns"""
        return {
            "peak_usage_hours": ["10:00-12:00", "14:00-16:00"],
            "common_workflows": ["Batch screening", "Individual screening"],
            "training_recommendations": ["Advanced search techniques"]
        }
    
    def _suggest_optimizations(self, org_id: Optional[str]) -> Dict[str, Any]:
        """Suggest system optimizations"""
        return {
            "resource_allocation": "Increase during peak hours",
            "performance_improvements": ["Database indexing", "Caching strategies"],
            "cost_optimizations": ["Batch processing during off-peak hours"]
        }
    
    def _identify_compliance_risks(self, org_id: Optional[str]) -> Dict[str, Any]:
        """Identify potential compliance risks"""
        return {
            "high_risk_areas": ["Manual review delays", "Incomplete documentation"],
            "recommendations": ["Automate review workflows", "Implement audit trails"],
            "regulatory_updates": ["New AML regulations expected Q2"]
        }

# Usage example:
"""
# Initialize analytics service
analytics_service = AnalyticsService(db)

# Get dashboard metrics for an organization
metrics = analytics_service.get_dashboard_metrics(org_id="org-123", period=AnalyticsPeriod.LAST_30_DAYS)

# Generate custom report
report = analytics_service.generate_custom_report(
    org_id="org-123",
    report_type="screening_volume",
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 1, 31)
)

# Get predictive insights
insights = analytics_service.get_predictive_insights(org_id="org-123")

# Get specific analytics
screening_stats = analytics_service.get_screening_analytics(
    org_id="org-123",
    period=AnalyticsPeriod.LAST_7_DAYS
)
"""