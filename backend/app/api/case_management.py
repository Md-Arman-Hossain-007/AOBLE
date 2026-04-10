from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import uuid4

from ..db.session import get_db
from ..models.models import (
    User, Organization, Case, CaseAssignment, CaseNote, CaseHistory,
    Workflow, WorkflowInstance, WorkflowStep, AuditLog, Notification,
    ScreeningResult, ComplianceSettings
)
from ..api.auth import get_current_active_user, RoleChecker
from ..schemas import case_management as schemas
from ..core.config import settings

router = APIRouter(prefix=f"{settings.API_V1_STR}/compliance/cases", tags=["Case Management"])

@router.get("/assignable-users", response_model=List[schemas.UserSimpleResponse])
def get_assignable_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get list of users available for case assignment (same organization)"""
    users = db.query(User).filter(
        User.org_id == current_user.org_id,
        User.is_active == True,
        User.is_deleted == False
    ).all()
    
    return [
        {
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "email": u.email
        }
        for u in users
    ]

@router.get("/stats", response_model=schemas.CaseStatsResponse)
def get_case_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get comprehensive case management statistics"""
    
    org_id = current_user.org_id
    
    # Basic counts
    total_cases = db.query(Case).filter(Case.org_id == org_id).count()
    pending_cases = db.query(Case).filter(
        Case.org_id == org_id,
        Case.status.in_(['pending', 'under_review'])
    ).count()
    resolved_cases = db.query(Case).filter(
        Case.org_id == org_id,
        Case.status == 'resolved'
    ).count()
    escalated_cases = db.query(Case).filter(
        Case.org_id == org_id,
        Case.status == 'escalated'
    ).count()
    
    # Average resolution time (for resolved cases in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    resolved_in_period = db.query(Case).filter(
        Case.org_id == org_id,
        Case.status == 'resolved',
        Case.resolved_at >= thirty_days_ago
    ).all()
    
    if resolved_in_period:
        total_hours = sum([
            (case.resolved_at - case.created_at).total_seconds() / 3600 
            for case in resolved_in_period
        ])
        avg_resolution_hours = total_hours / len(resolved_in_period)
    else:
        avg_resolution_hours = 0
    
    # Case distribution by type and priority
    case_types = {}
    priorities = {}
    
    cases = db.query(Case).filter(Case.org_id == org_id).all()
    for case in cases:
        case_types[case.case_type] = case_types.get(case.case_type, 0) + 1
        priorities[case.priority] = priorities.get(case.priority, 0) + 1
    
    # Open cases by assignee
    open_cases_by_assignee = []
    assignees = db.query(Case.assigned_to).filter(
        Case.org_id == org_id,
        Case.status.in_(['pending', 'under_review'])
    ).distinct().all()
    
    for assignee in assignees:
        if assignee[0]:
            count = db.query(Case).filter(
                Case.org_id == org_id,
                Case.assigned_to == assignee[0],
                Case.status.in_(['pending', 'under_review'])
            ).count()
            user = db.query(User).filter(User.username == assignee[0]).first()
            open_cases_by_assignee.append({
                "username": assignee[0],
                "full_name": user.full_name if user else assignee[0],
                "case_count": count
            })
    
    return {
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "resolved_cases": resolved_cases,
        "escalated_cases": escalated_cases,
        "resolution_rate": (resolved_cases / total_cases * 100) if total_cases > 0 else 0,
        "avg_resolution_time": round(avg_resolution_hours, 1),
        "case_types": case_types,
        "priorities": priorities,
        "open_cases_by_assignee": open_cases_by_assignee
    }

@router.get("", response_model=Dict[str, Any])
def get_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    search: Optional[str] = Query(None, description="Search in title/description"),
    sla_status: Optional[str] = Query(None, description="Filter by SLA status: ok, warning, breached"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get cases with advanced filtering and search"""
    from sqlalchemy import or_, desc, asc
    
    query = db.query(Case).filter(Case.org_id == current_user.org_id)
    
    # Filters
    if status:
        query = query.filter(Case.status == status)
    if priority:
        query = query.filter(Case.priority == priority)
    if case_type:
        query = query.filter(Case.case_type == case_type)
    if assigned_to:
        query = query.filter(Case.assigned_to == assigned_to)
    if created_by:
        query = query.filter(Case.created_by == created_by)
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Case.title.ilike(search_term),
                Case.description.ilike(search_term),
                Case.customer_ref.ilike(search_term)
            )
        )
    
    # SLA filtering
    if sla_status:
        now = datetime.utcnow()
        if sla_status == "breached":
            query = query.filter(Case.due_date < now, Case.status.in_(['pending', 'under_review', 'escalated']))
        elif sla_status == "warning":
            warning_threshold = now + timedelta(hours=24)
            query = query.filter(
                Case.due_date >= now,
                Case.due_date <= warning_threshold,
                Case.status.in_(['pending', 'under_review', 'escalated'])
            )
    
    # Sorting
    sort_field = getattr(Case, sort_by, Case.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_field))
    else:
        query = query.order_by(asc(sort_field))
    
    # Pagination
    total = query.count()
    cases = query.offset(skip).limit(limit).all()
    
    # Calculate SLA status for each case
    now = datetime.utcnow()
    cases_with_sla = []
    for case in cases:
        sla_status_val = "ok"
        time_remaining = None
        if case.due_date and case.status in ['pending', 'under_review', 'escalated']:
            time_remaining = (case.due_date - now).total_seconds() / 3600  # hours
            if time_remaining < 0:
                sla_status_val = "breached"
            elif time_remaining < 24:
                sla_status_val = "warning"
        
        cases_with_sla.append({
            **{c.name: getattr(case, c.name) for c in case.__table__.columns},
            "sla_status": sla_status_val,
            "time_remaining_hours": round(time_remaining, 1) if time_remaining is not None else None
        })
    
    return {
        "cases": cases_with_sla,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("/", response_model=schemas.CaseResponse)
def create_case(
    case_data: schemas.CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Create a new case"""
    
    case = Case(
        id=str(uuid4()),
        case_type=case_data.case_type,
        title=case_data.title,
        description=case_data.description,
        status="pending",
        priority=case_data.priority,
        created_by=current_user.username,
        created_at=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=7),
        org_id=current_user.org_id,
        customer_ref=case_data.customer_ref
    )
    
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # Add to audit log
    audit_log = AuditLog(
        id=str(uuid4()),
        user_id=current_user.username,
        action="case_created",
        resource="case_management",
        success=True,
        details={"case_id": case.id, "case_type": case.case_type},
        timestamp=datetime.utcnow()
    )
    db.add(audit_log)
    db.commit()
    
    return case

@router.put("/{case_id}/assign", response_model=schemas.CaseAssignmentResponse)
def assign_case(
    case_id: str,
    assignment_data: schemas.CaseAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Assign a case to a user"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    user = db.query(User).filter(User.username == assignment_data.assigned_to).first()
    if not user or user.org_id != current_user.org_id:
        raise HTTPException(status_code=400, detail="User not found or not in same organization")
    
    # Create assignment
    assignment = CaseAssignment(
        id=str(uuid4()),
        case_id=case_id,
        assigned_to=assignment_data.assigned_to,
        assigned_by=current_user.username,
        assigned_at=datetime.utcnow(),
        reason=assignment_data.reason or "Manual assignment",
        status="active"
    )
    
    # Update case status
    case.status = "under_review"
    case.assigned_to = assignment_data.assigned_to
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    # Add to case history
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="assigned",
        description=f"Case assigned to {assignment_data.assigned_to}",
        performed_by=current_user.username,
        event_data={"assigned_to": assignment_data.assigned_to},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return assignment

@router.put("/{case_id}/status", response_model=schemas.CaseResponse)
def update_case_status(
    case_id: str,
    status_data: schemas.CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Update case status"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    old_status = case.status
    case.status = status_data.status
    case.updated_at = datetime.utcnow()
    
    if status_data.status == "resolved":
        case.resolved_at = datetime.utcnow()
        case.resolved_by = current_user.username
        case.resolution_notes = status_data.resolution_notes
        case.resolution_type = status_data.resolution_type or "manual"
    elif status_data.status == "escalated":
        case.escalated_at = datetime.utcnow()
        case.escalated_by = current_user.username
        case.escalation_reason = status_data.escalation_reason
    
    db.commit()
    db.refresh(case)
    
    # Add to case history
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="status_changed",
        description=f"Status changed from {old_status} to {status_data.status}",
        performed_by=current_user.username,
        event_data={
    "old_status": old_status,
    "new_status": status_data.status,
    "resolution_notes": status_data.resolution_notes,
    "escalation_reason": status_data.escalation_reason
},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return case

@router.post("/{case_id}/notes", response_model=schemas.CaseNoteResponse)
def add_case_note(
    case_id: str,
    note_data: schemas.CaseNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Add a note to a case"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    note = CaseNote(
        id=str(uuid4()),
        case_id=case_id,
        author=current_user.username,
        content=note_data.content,
        note_type=note_data.note_type or "general",
        created_at=datetime.utcnow()
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    # Add to case history
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="note_added",
        description=f"Note added by {current_user.username}",
        performed_by=current_user.username,
        event_data={"note_id": note.id, "note_type": note.note_type},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return note

@router.get("/{case_id}/workflow", response_model=List[schemas.WorkflowStepResponse])
def get_case_workflow(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get workflow steps for a case"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if not workflow_instance:
        return []
    
    steps = db.query(WorkflowStep).filter(WorkflowStep.workflow_id == workflow_instance.workflow_id).order_by(WorkflowStep.order).all()
    return steps

@router.put("/{case_id}/workflow/step/{step_id}/complete")
def complete_workflow_step(
    case_id: str,
    step_id: str,
    completion_data: schemas.WorkflowStepCompletion,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Complete a workflow step"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if not workflow_instance:
        raise HTTPException(status_code=404, detail="Workflow instance not found")
    
    step = db.query(WorkflowStep).filter(WorkflowStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Workflow step not found")
    
    # Update step data
    if not workflow_instance.step_data:
        workflow_instance.step_data = {}
    
    workflow_instance.step_data[step_id] = {
        "completed": True,
        "completed_at": datetime.utcnow().isoformat(),
        "completed_by": current_user.username,
        "completion_notes": completion_data.completion_notes,
        "step_data": completion_data.step_data
    }
    
    # Update current step if this was the current step
    if workflow_instance.current_step == step.order:
        workflow_instance.current_step += 1
    
    db.commit()
    
    # Add to case history
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="workflow_step_completed",
        description=f"Workflow step '{step.step_name}' completed",
        performed_by=current_user.username,
        event_data={
    "step_id": step_id,
    "step_name": step.step_name,
    "completion_notes": completion_data.completion_notes
},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return {"message": "Workflow step completed successfully"}

@router.post("/workflows", response_model=schemas.WorkflowResponse)
def create_workflow(
    workflow_data: schemas.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin"]))
):
    """Create a new workflow"""
    
    workflow = Workflow(
        id=str(uuid4()),
        name=workflow_data.name,
        description=workflow_data.description,
        steps=workflow_data.steps,
        auto_assign=workflow_data.auto_assign,
        escalation_rules=workflow_data.escalation_rules,
        is_active=True,
        created_by=current_user.username,
        created_at=datetime.utcnow()
    )
    
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    
    # Create workflow steps
    for i, step_data in enumerate(workflow_data.steps):
        step = WorkflowStep(
            id=str(uuid4()),
            workflow_id=workflow.id,
            step_name=step_data["step_name"],
            step_type=step_data["step_type"],
            parameters=step_data.get("parameters", {}),
            order=i,
            required_approvals=step_data.get("required_approvals", 1),
            timeout_minutes=step_data.get("timeout_minutes", 1440)
        )
        db.add(step)
    
    db.commit()
    
    return workflow

@router.post("/{case_id}/workflow/assign")
def assign_workflow(
    case_id: str,
    workflow_data: schemas.WorkflowAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Assign a workflow to a case"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow = db.query(Workflow).filter(Workflow.id == workflow_data.workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Check if workflow instance already exists
    existing_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if existing_instance:
        raise HTTPException(status_code=400, detail="Case already has an active workflow")
    
    # Create workflow instance
    workflow_instance = WorkflowInstance(
        id=str(uuid4()),
        case_id=case_id,
        workflow_id=workflow.id,
        status="pending",
        current_step=0,
        step_data={},
        started_at=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    
    db.add(workflow_instance)
    db.commit()
    
    # Add to case history
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="workflow_assigned",
        description=f"Workflow '{workflow.name}' assigned to case",
        performed_by=current_user.username,
        event_data={"workflow_id": workflow.id, "workflow_name": workflow.name},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    

@router.post("/", response_model=schemas.CaseResponse)
def create_case(
    case_data: schemas.CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Create a new case"""
    from ..services.case_management import CaseManagementService, CaseType, CasePriority
    
    service = CaseManagementService(db)
    
    try:
        case = service.create_manual_case(
            case_type=CaseType(case_data.case_type),
            title=case_data.title,
            description=case_data.description,
            priority=CasePriority(case_data.priority),
            created_by=current_user.username,
            assigned_to=case_data.assigned_to,
            customer_ref=case_data.customer_ref
        )
        return case
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bulk/assign")
def bulk_assign_cases(
    bulk_data: schemas.BulkCaseAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Bulk assign multiple cases"""
    from ..services.case_management import CaseManagementService
    
    service = CaseManagementService(db)
    results = {"success": 0, "failed": 0, "errors": []}
    
    for case_id in bulk_data.case_ids:
        try:
            case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
            if not case:
                results["failed"] += 1
                results["errors"].append({"case_id": case_id, "error": "Case not found"})
                continue
            
            service.assign_case(
                case_id=case_id,
                assigned_to=bulk_data.assigned_to,
                assigned_by=current_user.username,
                reason=bulk_data.reason or "Bulk assignment"
            )
            results["success"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"case_id": case_id, "error": str(e)})
    
    return results

@router.post("/bulk/escalate")
def bulk_escalate_cases(
    bulk_data: schemas.BulkCaseAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Bulk escalate multiple cases"""
    from ..services.case_management import CaseManagementService
    
    service = CaseManagementService(db)
    results = {"success": 0, "failed": 0, "errors": []}
    
    for case_id in bulk_data.case_ids:
        try:
            case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
            if not case:
                results["failed"] += 1
                results["errors"].append({"case_id": case_id, "error": "Case not found"})
                continue
            
            service.escalate_case(
                case_id=case_id,
                escalated_by=current_user.username,
                reason=bulk_data.reason or "Bulk escalation"
            )
            results["success"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"case_id": case_id, "error": str(e)})
    
    return results

@router.post("/bulk/close")
def bulk_close_cases(
    bulk_data: schemas.BulkCaseAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Bulk close multiple cases"""
    results = {"success": 0, "failed": 0, "errors": []}
    
    for case_id in bulk_data.case_ids:
        try:
            case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
            if not case:
                results["failed"] += 1
                results["errors"].append({"case_id": case_id, "error": "Case not found"})
                continue
            
            case.status = "resolved"
            case.resolved_at = datetime.utcnow()
            case.resolved_by = current_user.username
            case.resolution_notes = bulk_data.reason or "Bulk closure"
            case.resolution_type = "manual"
            
            # Add history
            history = CaseHistory(
                id=str(uuid4()),
                case_id=case_id,
                action="resolved",
                description=f"Case resolved by {current_user.username}",
                performed_by=current_user.username,
                event_data={"resolution_type": "manual"},
                created_at=datetime.utcnow()
            )
            db.add(history)
            db.commit()
            
            results["success"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"case_id": case_id, "error": str(e)})
    
    return results

@router.put("/{case_id}/assign", response_model=schemas.CaseAssignmentResponse)
def assign_case(
    case_id: str,
    assignment_data: schemas.CaseAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Assign a case to a user"""
    from ..services.case_management import CaseManagementService
    
    service = CaseManagementService(db)
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        assignment = service.assign_case(
            case_id=case_id,
            assigned_to=assignment_data.assigned_to,
            assigned_by=current_user.username,
            reason=assignment_data.reason
        )
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{case_id}/status", response_model=schemas.CaseResponse)
def update_case_status(
    case_id: str,
    status_data: schemas.CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Update case status"""
    from ..services.case_management import CaseManagementService, CaseStatus
    
    service = CaseManagementService(db)
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        status = CaseStatus(status_data.status)
        updated_case = service.update_case_status(
            case_id=case_id,
            status=status,
            updated_by=current_user.username,
            notes=status_data.resolution_notes
        )
        
        # Additional fields
        if status_data.status == "resolved":
            updated_case.resolved_at = datetime.utcnow()
            updated_case.resolved_by = current_user.username
            updated_case.resolution_notes = status_data.resolution_notes
            updated_case.resolution_type = status_data.resolution_type or "manual"
        elif status_data.status == "escalated":
            updated_case.escalated_at = datetime.utcnow()
            updated_case.escalated_by = current_user.username
            updated_case.escalation_reason = status_data.escalation_reason
        
        db.commit()
        db.refresh(updated_case)
        return updated_case
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{case_id}/notes", response_model=schemas.CaseNoteResponse)
def add_case_note(
    case_id: str,
    note_data: schemas.CaseNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Add a note to a case"""
    from ..services.case_management import CaseManagementService
    
    service = CaseManagementService(db)
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    try:
        note = service.add_case_note(
            case_id=case_id,
            author=current_user.username,
            content=note_data.content,
            note_type=note_data.note_type or "general"
        )
        return note
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{case_id}/risk-assessment")
def get_case_risk_assessment(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get risk assessment for a case"""
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Calculate risk score based on multiple factors
    risk_score = 0
    risk_factors = []
    
    # Priority-based risk
    priority_scores = {"low": 20, "medium": 40, "high": 60, "critical": 90}
    priority_score = priority_scores.get(case.priority, 40)
    risk_score += priority_score * 0.3
    risk_factors.append({"factor": "Priority", "score": priority_score, "weight": 0.3})
    
    # SLA-based risk
    if case.due_date and case.status in ['pending', 'under_review', 'escalated']:
        hours_remaining = (case.due_date - datetime.utcnow()).total_seconds() / 3600
        if hours_remaining < 0:
            sla_score = 100
            risk_factors.append({"factor": "SLA Breached", "score": 100, "weight": 0.3})
        elif hours_remaining < 24:
            sla_score = 70
            risk_factors.append({"factor": "SLA Warning", "score": 70, "weight": 0.3})
        else:
            sla_score = 20
            risk_factors.append({"factor": "SLA OK", "score": 20, "weight": 0.3})
        risk_score += sla_score * 0.3
    else:
        risk_factors.append({"factor": "SLA", "score": 0, "weight": 0.3})
    
    # Escalation-based risk
    if case.status == "escalated":
        escalation_score = 80
        risk_factors.append({"factor": "Escalated", "score": 80, "weight": 0.2})
        risk_score += escalation_score * 0.2
    else:
        risk_factors.append({"factor": "Escalation", "score": 0, "weight": 0.2})
    
    # Case type-based risk
    type_scores = {"screening_match": 70, "manual_review": 40, "customer_request": 20, "regulatory_inquiry": 90}
    type_score = type_scores.get(case.case_type, 40)
    risk_factors.append({"factor": "Case Type", "score": type_score, "weight": 0.2})
    risk_score += type_score * 0.2
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "critical"
    elif risk_score >= 50:
        risk_level = "high"
    elif risk_score >= 30:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return {
        "case_id": case_id,
        "overall_risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "assessed_at": datetime.utcnow().isoformat()
    }

@router.get("/{case_id}/related")
def get_related_cases(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get cases related to this case (same customer, similar patterns)"""
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Find cases with same customer reference
    related = []
    if case.customer_ref:
        same_customer_cases = db.query(Case).filter(
            Case.customer_ref == case.customer_ref,
            Case.id != case_id,
            Case.org_id == current_user.org_id
        ).order_by(Case.created_at.desc()).limit(10).all()
        
        for rc in same_customer_cases:
            related.append({
                "id": rc.id,
                "title": rc.title,
                "status": rc.status,
                "priority": rc.priority,
                "case_type": rc.case_type,
                "created_at": rc.created_at.isoformat(),
                "relationship": "same_customer"
            })
    
    # Find cases with similar title keywords
    if case.title:
        keywords = case.title.lower().split()
        if len(keywords) > 2:
            # Simple keyword matching (could be enhanced with full-text search)
            similar_cases = db.query(Case).filter(
                Case.id != case_id,
                Case.org_id == current_user.org_id,
                Case.title.ilike(f"%{keywords[0]}%")
            ).order_by(Case.created_at.desc()).limit(5).all()
            
            for sc in similar_cases:
                if not any(r["id"] == sc.id for r in related):
                    related.append({
                        "id": sc.id,
                        "title": sc.title,
                        "status": sc.status,
                        "priority": sc.priority,
                        "case_type": sc.case_type,
                        "created_at": sc.created_at.isoformat(),
                        "relationship": "similar_title"
                    })
    
    return {
        "case_id": case_id,
        "related_cases": related,
        "total_related": len(related)
    }

@router.post("/{case_id}/workflow/assign")
def assign_workflow(
    case_id: str,
    workflow_data: schemas.WorkflowAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Assign a workflow to a case"""
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow = db.query(Workflow).filter(Workflow.id == workflow_data.workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    existing_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if existing_instance:
        raise HTTPException(status_code=400, detail="Case already has an active workflow")
    
    workflow_instance = WorkflowInstance(
        id=str(uuid4()),
        case_id=case_id,
        workflow_id=workflow.id,
        status="pending",
        current_step=0,
        step_data={},
        started_at=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    
    db.add(workflow_instance)
    db.commit()
    
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="workflow_assigned",
        description=f"Workflow '{workflow.name}' assigned to case",
        performed_by=current_user.username,
        event_data={"workflow_id": workflow.id, "workflow_name": workflow.name},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return {"message": "Workflow assigned successfully", "workflow_instance_id": workflow_instance.id}

@router.get("/{case_id}/workflow")
def get_case_workflow(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get workflow progress for a case"""
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if not workflow_instance:
        return {"has_workflow": False}
    
    workflow = db.query(Workflow).filter(Workflow.id == workflow_instance.workflow_id).first()
    
    return {
        "has_workflow": True,
        "workflow_instance": {
            "id": workflow_instance.id,
            "status": workflow_instance.status,
            "current_step": workflow_instance.current_step,
            "started_at": workflow_instance.started_at.isoformat() if workflow_instance.started_at else None,
            "completed_at": workflow_instance.completed_at.isoformat() if workflow_instance.completed_at else None
        },
        "workflow": {
            "id": workflow.id if workflow else None,
            "name": workflow.name if workflow else None,
            "description": workflow.description if workflow else None
        }
    }

@router.put("/{case_id}/workflow/step/{step_id}/complete")
def complete_workflow_step(
    case_id: str,
    step_id: str,
    completion_data: schemas.WorkflowStepCompletion,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Complete a workflow step"""
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    workflow_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    if not workflow_instance:
        raise HTTPException(status_code=404, detail="Workflow instance not found")
    
    if not workflow_instance.step_data:
        workflow_instance.step_data = {}
    
    workflow_instance.step_data[step_id] = {
        "completed": True,
        "completed_at": datetime.utcnow().isoformat(),
        "completed_by": current_user.username,
        "completion_notes": completion_data.completion_notes,
        "step_data": completion_data.step_data
    }
    
    workflow_instance.current_step += 1
    
    db.commit()
    
    history = CaseHistory(
        id=str(uuid4()),
        case_id=case_id,
        action="workflow_step_completed",
        description=f"Workflow step completed",
        performed_by=current_user.username,
        event_data={"step_id": step_id},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return {"message": "Workflow step completed successfully"}
