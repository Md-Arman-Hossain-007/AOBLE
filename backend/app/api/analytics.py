from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..db.session import get_db
from ..services.analytics import AnalyticsService, AnalyticsPeriod
from ..schemas import analytics as schemas
from .auth import get_current_active_user, RoleChecker
from ..models import models

router = APIRouter()

@router.get("/dashboard", response_model=schemas.DashboardMetrics, summary="Get dashboard analytics")
async def get_dashboard_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get comprehensive dashboard metrics for the current organization.
    """
    try:
        service = AnalyticsService(db)
        return service.get_dashboard_metrics(org_id=current_user.org_id, period=period)
    except Exception as e:
        import traceback
        error_msg = f"Analytics Error: {type(e).__name__}: {str(e)}"
        error_trace = traceback.format_exc()
        print(error_msg)
        print(error_trace)
        raise HTTPException(
            status_code=500,
            detail={
                "message": error_msg,
                "traceback": error_trace
            }
        )

@router.get("/screening", response_model=schemas.ScreeningStats, summary="Get screening analytics")
async def get_screening_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get detailed screening analytics.
    """
    service = AnalyticsService(db)
    return service.get_screening_analytics(org_id=current_user.org_id, period=period)

@router.get("/compliance", response_model=schemas.ComplianceStats, summary="Get compliance analytics")
async def get_compliance_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin"]))
):
    """
    Get compliance and case management analytics.
    """
    service = AnalyticsService(db)
    return service.get_compliance_analytics(org_id=current_user.org_id, period=period)

@router.get("/predictive", response_model=Dict[str, Any], summary="Get predictive insights")
async def get_predictive_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin", "Analyst"]))
):
    """
    Generate predictive insights using historical data.
    """
    service = AnalyticsService(db)
    return service.get_predictive_insights(org_id=current_user.org_id)

@router.post("/report", summary="Generate custom analytics report")
async def generate_report(
    request: schemas.AnalyticsReportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["Compliance Officer", "Admin"]))
):
    """
    Generate a custom analytical report.
    """
    service = AnalyticsService(db)
    return service.generate_custom_report(
        org_id=current_user.org_id,
        report_type=request.report_type,
        start_date=request.start_date,
        end_date=request.end_date,
        filters=request.filters
    )
