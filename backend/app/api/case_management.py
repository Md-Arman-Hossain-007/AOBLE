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

router = APIRouter(prefix="/api/compliance/cases", tags=["Case Management"])

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

@router.get("/", response_model=List[schemas.CaseResponse])
def get_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    case_type: Optional[str] = Query(None, description="Filter by case type"),
    assigned_to: Optional[str] = Query(None, description="Filter by assignee"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get cases with advanced filtering"""
    
    query = db.query(Case).filter(Case.org_id == current_user.org_id)
    
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
    
    cases = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=schemas.CaseDetailResponse)
def get_case_details(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor", "Analyst"]))
):
    """Get detailed case information including history, notes, and workflow"""
    
    case = db.query(Case).filter(Case.id == case_id, Case.org_id == current_user.org_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get assignments
    assignments = db.query(CaseAssignment).filter(CaseAssignment.case_id == case_id).all()
    
    # Get notes
    notes = db.query(CaseNote).filter(CaseNote.case_id == case_id).order_by(CaseNote.created_at.desc()).all()
    
    # Get history
    history = db.query(CaseHistory).filter(CaseHistory.case_id == case_id).order_by(CaseHistory.created_at.desc()).all()
    
    # Get workflow instance
    workflow_instance = db.query(WorkflowInstance).filter(WorkflowInstance.case_id == case_id).first()
    
    # Get related screening result
    screening_result = None
    if case.screening_result_id:
        screening_result = db.query(ScreeningResult).filter(ScreeningResult.id == case.screening_result_id).first()
    
    return {
        "case": case,
        "assignments": assignments,
        "notes": notes,
        "history": history,
        "workflow_instance": workflow_instance,
        "related_screening": screening_result
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
        metadata={"assigned_to": assignment_data.assigned_to},
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
        metadata={
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
        metadata={"note_id": note.id, "note_type": note.note_type},
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
        metadata={
            "step_id": step_id,
            "step_name": step.step_name,
            "completion_notes": completion_data.completion_notes
        },
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return {"message": "Workflow step completed successfully"}

@router.get("/analytics", response_model=Dict[str, Any])
def get_case_analytics(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get case management analytics"""
    
    org_id = current_user.org_id
    
    # Parse dates
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        start_dt = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    else:
        end_dt = datetime.utcnow()
    
    # Get cases in date range
    cases = db.query(Case).filter(
        Case.org_id == org_id,
        Case.created_at >= start_dt,
        Case.created_at <= end_dt
    ).all()
    
    # Calculate metrics
    total_cases = len(cases)
    resolved_cases = len([c for c in cases if c.status == "resolved"])
    pending_cases = len([c for c in cases if c.status in ["pending", "under_review"]])
    escalated_cases = len([c for c in cases if c.status == "escalated"])
    
    # Average resolution time
    resolution_times = []
    for case in cases:
        if case.resolved_at and case.created_at:
            time_diff = case.resolved_at - case.created_at
            resolution_times.append(time_diff.total_seconds() / 3600)  # hours
    
    avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    
    # Case distribution
    case_types = {}
    priorities = {}
    statuses = {}
    
    for case in cases:
        case_types[case.case_type] = case_types.get(case.case_type, 0) + 1
        priorities[case.priority] = priorities.get(case.priority, 0) + 1
        statuses[case.status] = statuses.get(case.status, 0) + 1
    
    # Resolution rate by case type
    resolution_rates = {}
    for case_type in set(c.case_type for c in cases):
        type_cases = [c for c in cases if c.case_type == case_type]
        type_resolved = len([c for c in type_cases if c.status == "resolved"])
        resolution_rates[case_type] = (type_resolved / len(type_cases) * 100) if type_cases else 0
    
    # Workload distribution
    workload = {}
    for case in cases:
        if case.assigned_to:
            workload[case.assigned_to] = workload.get(case.assigned_to, 0) + 1
    
    return {
        "period": {
            "start_date": start_dt.strftime("%Y-%m-%d"),
            "end_date": end_dt.strftime("%Y-%m-%d")
        },
        "metrics": {
            "total_cases": total_cases,
            "resolved_cases": resolved_cases,
            "pending_cases": pending_cases,
            "escalated_cases": escalated_cases,
            "resolution_rate": (resolved_cases / total_cases * 100) if total_cases > 0 else 0,
            "avg_resolution_time": round(avg_resolution_time, 1),
            "escalation_rate": (escalated_cases / total_cases * 100) if total_cases > 0 else 0
        },
        "distributions": {
            "case_types": case_types,
            "priorities": priorities,
            "statuses": statuses,
            "resolution_rates_by_type": resolution_rates,
            "workload_by_assignee": workload
        }
    }

@router.get("/workflows", response_model=List[schemas.WorkflowResponse])
def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Compliance Officer", "Admin", "Supervisor"]))
):
    """Get available workflows"""
    
    workflows = db.query(Workflow).filter(Workflow.is_active == True).all()
    return workflows

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
        metadata={"workflow_id": workflow.id, "workflow_name": workflow.name},
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    
    return {"message": "Workflow assigned successfully"}