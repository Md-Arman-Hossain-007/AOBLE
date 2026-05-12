"""
History & Audit API - Comprehensive audit trail and history tracking
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import csv
import io

from ..db.session import get_db
from ..models.models import (
    User, Screening, ScreeningResult, ScreeningAuditLog, AuditLog, 
    Case, CaseHistory, BulkJob, Notification
)
from ..api.auth import get_current_active_user, RoleChecker
from ..schemas import history_audit as schemas
from ..core.config import settings

router = APIRouter(prefix=f"{settings.API_V1_STR}/history", tags=["History & Audit"])

@router.get("/all", response_model=schemas.HistoryListResponse)
def get_all_history(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type (screening, case, bulk)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in subject/description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("timestamp", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get unified history from screenings, cases, and bulk jobs"""
    from sqlalchemy import or_, desc, asc
    
    history_items = []
    
    # Parse dates
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow() + timedelta(days=1)
    
    # Get all users in the same organization to show organization-wide history
    user_ids = [u.username for u in db.query(User).filter(User.org_id == current_user.org_id).all()]
    
    # Get screening history
    if not resource_type or resource_type == "screening":
        screening_query = db.query(Screening).filter(
            Screening.user_id.in_(user_ids),
            Screening.timestamp >= start_dt,
            Screening.timestamp <= end_dt
        )
        
        if user_id:
            screening_query = screening_query.filter(Screening.user_id == user_id)
        
        if search:
            search_term = f"%{search}%"
            screening_query = screening_query.filter(
                or_(
                    Screening.first_name.ilike(search_term),
                    Screening.last_name.ilike(search_term),
                    Screening.company_name.ilike(search_term)
                )
            )
        
        # Sort legacy screenings
        screenings = screening_query.order_by(Screening.timestamp.desc()).all()
        for s in screenings:
            subject_name = s.company_name or f"{s.first_name or ''} {s.last_name or ''}".strip()
            normalized_status = s.status.lower() if s.status else "unknown"
            history_items.append({
                "id": s.id,
                "type": "screening",
                "action": f"Screening completed - {s.status}",
                "subject": subject_name,
                "subject_type": "entity" if s.company_name else "individual",
                "user_id": s.user_id,
                "timestamp": s.timestamp.isoformat(),
                "status": normalized_status,
                "details": {
                    "match_count": s.match_count,
                    "results": s.results
                }
            })

        # Get modern ScreeningResult history
        v2_query = db.query(ScreeningResult).filter(
            ScreeningResult.screened_by.in_(user_ids),
            ScreeningResult.screened_at >= start_dt,
            ScreeningResult.screened_at <= end_dt
        )

        if search:
            search_term = f"%{search}%"
            v2_query = v2_query.filter(ScreeningResult.customer_name.ilike(search_term))

        v2_screenings = v2_query.order_by(ScreeningResult.screened_at.desc()).all()
        for s in v2_screenings:
            normalized_status = s.status.lower() if s.status else "unknown"
            
            # Map matches to minimal data
            minimal_matches = []
            if s.all_matches:
                for m in s.all_matches:
                    minimal_matches.append({
                        "id": m.get("entity_id") or m.get("match_id"),
                        "name": m.get("caption") or m.get("name") or "Unknown",
                        "score": m.get("score") or (m.get("match_score", 0) / 100),
                        "status": m.get("status", "potential")
                    })

            history_items.append({
                "id": str(s.id),
                "type": "screening",
                "action": f"Screening completed - {s.status.capitalize()}",
                "subject": s.customer_name,
                "subject_type": "entity" if s.schema_type != 'Person' else "individual",
                "user_id": s.screened_by,
                "timestamp": s.screened_at.isoformat(),
                "status": normalized_status,
                "details": {
                    "match_count": s.match_count,
                    "risk_level": s.risk_level,
                    "top_score": s.top_score,
                    "matches": minimal_matches
                }
            })
    
    # Get case history
    if not resource_type or resource_type == "case":
        case_query = db.query(Case).filter(
            Case.org_id == current_user.org_id,
            Case.created_at >= start_dt,
            Case.created_at <= end_dt
        )
        
        if user_id:
            case_query = case_query.filter(
                or_(
                    Case.created_by == user_id,
                    Case.assigned_to == user_id
                )
            )
        
        if search:
            search_term = f"%{search}%"
            case_query = case_query.filter(Case.title.ilike(search_term))
        
        cases = case_query.order_by(Case.created_at.desc()).all()
        for c in cases:
            # Normalize status to lowercase
            normalized_status = c.status.lower() if c.status else "unknown"
            history_items.append({
                "id": c.id,
                "type": "case",
                "action": f"Case {c.status.replace('_', ' ')}",
                "subject": c.title,
                "subject_type": "case",
                "user_id": c.created_by,
                "timestamp": c.created_at.isoformat(),
                "status": normalized_status,
                "details": {
                    "case_type": c.case_type,
                    "priority": c.priority,
                    "assigned_to": c.assigned_to
                }
            })
    
    # Get bulk job history
    if not resource_type or resource_type == "bulk":
        bulk_query = db.query(BulkJob).filter(
            BulkJob.user_id.in_(user_ids),
            BulkJob.created_at >= start_dt,
            BulkJob.created_at <= end_dt
        )
        
        if user_id:
            bulk_query = bulk_query.filter(BulkJob.user_id == user_id)
        
        bulk_jobs = bulk_query.order_by(BulkJob.created_at.desc()).all()
        for b in bulk_jobs:
            # Normalize status to lowercase
            normalized_status = b.status.lower() if b.status else "unknown"
            
            # Fetch individual screenings for this bulk job
            bulk_screenings = db.query(ScreeningResult).filter(
                ScreeningResult.batch_id == str(b.id)
            ).all()
            
            nested_screenings = []
            for bs in bulk_screenings:
                # Map matches for each screening in the batch
                minimal_bs_matches = []
                if bs.all_matches:
                    for m in bs.all_matches:
                        minimal_bs_matches.append({
                            "id": m.get("entity_id") or m.get("match_id"),
                            "name": m.get("caption") or m.get("name") or "Unknown",
                            "score": m.get("score") or (m.get("match_score", 0) / 100),
                            "status": m.get("status", "potential")
                        })
                
                nested_screenings.append({
                    "id": str(bs.id),
                    "subject": bs.customer_name,
                    "status": bs.status.lower(),
                    "match_count": bs.match_count,
                    "matches": minimal_bs_matches
                })

            history_items.append({
                "id": b.id,
                "type": "bulk",
                "action": f"Bulk screening - {b.status}",
                "subject": b.filename or f"Bulk job ({b.total_rows} records)",
                "subject_type": "bulk",
                "user_id": b.user_id,
                "timestamp": b.created_at.isoformat(),
                "status": normalized_status,
                "details": {
                    "total_rows": b.total_rows,
                    "processed_rows": b.processed_rows,
                    "results_summary": b.results_summary,
                    "nested_screenings": nested_screenings
                }
            })
    
    # Filter by action type if specified
    if action_type:
        history_items = [h for h in history_items if action_type.lower() in h["action"].lower()]
    
    # Filter by status if specified
    if status and status != "all":
        history_items = [h for h in history_items if h["status"] == status.lower()]
    
    # Sort
    sort_field = "timestamp"
    reverse = sort_order == "desc"
    history_items.sort(key=lambda x: x.get(sort_field, ""), reverse=reverse)
    
    # Pagination
    total = len(history_items)
    paginated_items = history_items[skip:skip + limit]
    
    return {
        "items": paginated_items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/individual", response_model=schemas.HistoryListResponse)
def get_individual_history(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get history of individual screenings only"""
    from sqlalchemy import or_
    
    # Parse dates
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow() + timedelta(days=1)
    
    # Get all users in the same organization
    user_ids = [u.username for u in db.query(User).filter(User.org_id == current_user.org_id).all()]
    
    query = db.query(Screening).filter(
        Screening.user_id.in_(user_ids),
        Screening.company_name == None,  # Individual screenings have no company name
        Screening.timestamp >= start_dt,
        Screening.timestamp <= end_dt
    )
    
    if user_id and user_id != current_user.username:
        query = query.filter(Screening.user_id == user_id)
    
    if status:
        query = query.filter(Screening.status.ilike(f"%{status}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Screening.first_name.ilike(search_term),
                Screening.last_name.ilike(search_term)
            )
        )
    
    total_legacy = query.count()
    screenings = query.order_by(Screening.timestamp.desc()).all()
    
    items = []
    for s in screenings:
        items.append({
            "id": s.id,
            "type": "individual",
            "action": f"Individual screening - {s.status}",
            "subject": f"{s.first_name or ''} {s.last_name or ''}".strip(),
            "subject_type": "individual",
            "user_id": s.user_id,
            "timestamp": s.timestamp.isoformat(),
            "status": s.status.lower(),
            "details": {
                "first_name": s.first_name,
                "last_name": s.last_name,
                "date_of_birth": s.date_of_birth,
                "match_count": s.match_count
            }
        })

    # Add V2 individual screenings
    v2_query = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.schema_type == 'Person',
        ScreeningResult.screened_at >= start_dt,
        ScreeningResult.screened_at <= end_dt
    )
    if search:
        v2_query = v2_query.filter(ScreeningResult.customer_name.ilike(f"%{search}%"))
    if status:
        v2_query = v2_query.filter(ScreeningResult.status.ilike(f"%{status}%"))
    
    v2_screenings = v2_query.order_by(ScreeningResult.screened_at.desc()).all()
    for s in v2_screenings:
        items.append({
            "id": str(s.id),
            "type": "individual",
            "action": f"Individual screening - {s.status.capitalize()}",
            "subject": s.customer_name,
            "subject_type": "individual",
            "user_id": s.screened_by,
            "timestamp": s.screened_at.isoformat(),
            "status": s.status.lower(),
            "details": {
                "match_count": s.match_count,
                "risk_level": s.risk_level
            }
        })

    # Re-sort and paginate
    items.sort(key=lambda x: x["timestamp"], reverse=True)
    total = len(items)
    paginated_items = items[skip:skip + limit]
    
    return {
        "items": paginated_items,
        "total": total,
        "skip": skip,
        "limit": limit
    }
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/entity", response_model=schemas.HistoryListResponse)
def get_entity_history(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get history of entity screenings only"""
    from sqlalchemy import or_
    
    # Parse dates
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow() + timedelta(days=1)
    
    # Get all users in the same organization
    user_ids = [u.username for u in db.query(User).filter(User.org_id == current_user.org_id).all()]
    
    query = db.query(Screening).filter(
        Screening.user_id.in_(user_ids),
        Screening.company_name != None,  # Entity screenings have company name
        Screening.timestamp >= start_dt,
        Screening.timestamp <= end_dt
    )
    
    if user_id and user_id != current_user.username:
        query = query.filter(Screening.user_id == user_id)
    
    if status:
        query = query.filter(Screening.status.ilike(f"%{status}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(Screening.company_name.ilike(search_term))
    
    total_legacy = query.count()
    screenings = query.order_by(Screening.timestamp.desc()).all()
    
    items = []
    for s in screenings:
        items.append({
            "id": s.id,
            "type": "entity",
            "action": f"Entity screening - {s.status}",
            "subject": s.company_name,
            "subject_type": "entity",
            "user_id": s.user_id,
            "timestamp": s.timestamp.isoformat(),
            "status": s.status.lower(),
            "details": {
                "company_name": s.company_name,
                "match_count": s.match_count
            }
        })

    # Add V2 entity screenings
    v2_query = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.schema_type != 'Person',
        ScreeningResult.screened_at >= start_dt,
        ScreeningResult.screened_at <= end_dt
    )
    if search:
        v2_query = v2_query.filter(ScreeningResult.customer_name.ilike(f"%{search}%"))
    if status:
        v2_query = v2_query.filter(ScreeningResult.status.ilike(f"%{status}%"))
    
    v2_screenings = v2_query.order_by(ScreeningResult.screened_at.desc()).all()
    for s in v2_screenings:
        items.append({
            "id": str(s.id),
            "type": "entity",
            "action": f"Entity screening - {s.status.capitalize()}",
            "subject": s.customer_name,
            "subject_type": "entity",
            "user_id": s.screened_by,
            "timestamp": s.screened_at.isoformat(),
            "status": s.status.lower(),
            "details": {
                "match_count": s.match_count,
                "risk_level": s.risk_level
            }
        })

    # Re-sort and paginate
    items.sort(key=lambda x: x["timestamp"], reverse=True)
    total = len(items)
    paginated_items = items[skip:skip + limit]
    
    return {
        "items": paginated_items,
        "total": total,
        "skip": skip,
        "limit": limit
    }
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/audit-logs", response_model=schemas.AuditLogListResponse)
def get_audit_logs(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get detailed audit logs"""
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow() + timedelta(days=1)
    
    query = db.query(AuditLog).filter(
        AuditLog.timestamp >= start_dt,
        AuditLog.timestamp <= end_dt
    )
    
    # Filter by organization
    if current_user.org_id:
        user_ids = [u.username for u in db.query(User).filter(User.org_id == current_user.org_id).all()]
        query = query.filter(AuditLog.user_id.in_(user_ids))
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    
    if resource:
        query = query.filter(AuditLog.resource.ilike(f"%{resource}%"))
    
    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    items = [{
        "id": log.id,
        "user_id": log.user_id,
        "action": log.action,
        "resource": log.resource,
        "success": log.success,
        "details": log.details,
        "ip_address": log.ip_address,
        "timestamp": log.timestamp.isoformat()
    } for log in logs]
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/export")
def export_history(
    export_type: str = Query("all", description="all, individual, entity, audit"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Export history to CSV"""
    from fastapi.responses import StreamingResponse
    
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow() + timedelta(days=1)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    if export_type == "audit":
        # Export audit logs
        writer.writerow(["Timestamp", "User", "Action", "Resource", "Success", "Details"])
        logs = db.query(AuditLog).filter(
            AuditLog.timestamp >= start_dt,
            AuditLog.timestamp <= end_dt
        ).order_by(AuditLog.timestamp.desc()).all()
        
        for log in logs:
            writer.writerow([
                log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                log.user_id or "System",
                log.action,
                log.resource,
                "Yes" if log.success else "No",
                str(log.details)[:200] if log.details else ""
            ])
        filename = f"audit_logs_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    else:
        # Export screening history
        writer.writerow(["Timestamp", "Type", "Subject", "Status", "User", "Match Count"])
        
        query = db.query(Screening).filter(
            Screening.user_id == current_user.username,
            Screening.timestamp >= start_dt,
            Screening.timestamp <= end_dt
        )
        
        if export_type == "individual":
            query = query.filter(Screening.company_name == None)
        elif export_type == "entity":
            query = query.filter(Screening.company_name != None)
        
        screenings = query.order_by(Screening.timestamp.desc()).all()
        
        for s in screenings:
            subject = s.company_name or f"{s.first_name or ''} {s.last_name or ''}".strip()
            screening_type = "Entity" if s.company_name else "Individual"
            writer.writerow([
                s.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                screening_type,
                subject,
                s.status,
                s.user_id,
                s.match_count or 0
            ])
        filename = f"{export_type}_history_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/stats", response_model=schemas.HistoryStatsResponse)
def get_history_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get history statistics"""
    start_dt = datetime.utcnow() - timedelta(days=days)
    
    # Get all users in the same organization
    user_ids = [u.username for u in db.query(User).filter(User.org_id == current_user.org_id).all()]
    
    # Screening stats (Legacy + V2)
    total_screenings_legacy = db.query(Screening).filter(
        Screening.user_id.in_(user_ids),
        Screening.timestamp >= start_dt
    ).count()
    
    total_screenings_v2 = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.screened_at >= start_dt
    ).count()
    
    total_screenings = total_screenings_legacy + total_screenings_v2
    
    individual_screenings_legacy = db.query(Screening).filter(
        Screening.user_id.in_(user_ids),
        Screening.company_name == None,
        Screening.timestamp >= start_dt
    ).count()
    
    individual_screenings_v2 = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.schema_type == 'Person',
        ScreeningResult.screened_at >= start_dt
    ).count()
    
    individual_screenings = individual_screenings_legacy + individual_screenings_v2
    
    entity_screenings_legacy = db.query(Screening).filter(
        Screening.user_id.in_(user_ids),
        Screening.company_name != None,
        Screening.timestamp >= start_dt
    ).count()
    
    entity_screenings_v2 = db.query(ScreeningResult).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.schema_type != 'Person',
        ScreeningResult.screened_at >= start_dt
    ).count()
    
    entity_screenings = entity_screenings_legacy + entity_screenings_v2
    
    # Case stats
    total_cases = db.query(Case).filter(
        Case.org_id == current_user.org_id,
        Case.created_at >= start_dt
    ).count()
    
    # Daily trend (Legacy + V2)
    daily_trend = []
    for i in range(days):
        day_start = start_dt + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count_legacy = db.query(Screening).filter(
            Screening.user_id.in_(user_ids),
            Screening.timestamp >= day_start,
            Screening.timestamp < day_end
        ).count()
        count_v2 = db.query(ScreeningResult).filter(
            ScreeningResult.screened_by.in_(user_ids),
            ScreeningResult.screened_at >= day_start,
            ScreeningResult.screened_at < day_end
        ).count()
        daily_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": count_legacy + count_v2
        })
    
    # Top users (Legacy + V2)
    from sqlalchemy import func, union_all
    
    # Use a subquery to combine both screening types for top users
    from sqlalchemy import cast, String as SQLString
    
    legacy_counts = db.query(
        Screening.user_id.label('user_id'), 
        cast(Screening.id, SQLString).label('id')
    ).filter(
        Screening.user_id.in_(user_ids),
        Screening.timestamp >= start_dt
    )
    
    v2_counts = db.query(
        ScreeningResult.screened_by.label('user_id'), 
        cast(ScreeningResult.id, SQLString).label('id')
    ).filter(
        ScreeningResult.screened_by.in_(user_ids),
        ScreeningResult.screened_at >= start_dt
    )
    
    combined = legacy_counts.union_all(v2_counts).subquery()
    
    top_users = db.query(
        combined.c.user_id,
        func.count(combined.c.id).label('count')
    ).group_by(combined.c.user_id).order_by(func.count(combined.c.id).desc()).limit(5).all()
    
    return {
        "period_days": days,
        "total_screenings": total_screenings,
        "individual_screenings": individual_screenings,
        "entity_screenings": entity_screenings,
        "total_cases": total_cases,
        "daily_trend": daily_trend,
        "top_users": [{"user_id": u.user_id, "count": u.count} for u in top_users]
    }
