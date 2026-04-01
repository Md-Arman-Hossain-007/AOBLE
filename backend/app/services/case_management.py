from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from enum import Enum
from dataclasses import dataclass
from uuid import uuid4

from ..models.models import (
    ScreeningResult, User, Organization, Case, CaseAssignment, 
    CaseNote, CaseHistory, Workflow, WorkflowStep, WorkflowInstance,
    ComplianceSettings, Notification
)
from ..core.security import audit_logger, check_permission

class CaseStatus(Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"

class CasePriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CaseType(Enum):
    SCREENING_MATCH = "screening_match"
    MANUAL_REVIEW = "manual_review"
    CUSTOMER_REQUEST = "customer_request"
    REGULATORY_INQUIRY = "regulatory_inquiry"

class WorkflowStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class CaseAssignmentRule:
    rule_name: str
    conditions: Dict[str, Any]
    assignee_type: str  # "user", "role", "round_robin"
    assignee_value: str  # username, role name, or "round_robin"

@dataclass
class CaseWorkflow:
    workflow_id: str
    name: str
    steps: List[Dict[str, Any]]
    auto_assign: bool
    escalation_rules: List[Dict[str, Any]]

class CaseManagementService:
    """Advanced case management and workflow system"""
    
    def __init__(self, db: Session):
        self.db = db
        self.assignment_rules = []
        self.workflow_templates = {}
    
    def create_case_from_screening(
        self, 
        screening_result_id: str,
        assigned_to: Optional[str] = None,
        priority: CasePriority = CasePriority.MEDIUM
    ) -> Case:
        """Create a case from a screening result"""
        
        screening = self.db.query(ScreeningResult).filter(
            ScreeningResult.id == screening_result_id
        ).first()
        
        if not screening:
            raise ValueError("Screening result not found")
        
        # Determine case type based on risk level
        case_type = CaseType.SCREENING_MATCH
        if screening.risk_level == "HIGH":
            priority = CasePriority.CRITICAL
        elif screening.risk_level == "MEDIUM":
            priority = CasePriority.HIGH
        
        # Create case
        case = Case(
            id=str(uuid4()),
            case_type=case_type.value,
            title=f"Screening Match: {screening.customer_name}",
            description=f"High-risk match detected for {screening.customer_name}",
            status=CaseStatus.PENDING.value,
            priority=priority.value,
            screening_result_id=screening_result_id,
            created_by=screening.screened_by,
            created_at=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=3),
            org_id=self._get_user_org_id(screening.screened_by)
        )
        
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        
        # Auto-assign if specified
        if assigned_to:
            self.assign_case(case.id, assigned_to)
        else:
            self.auto_assign_case(case.id)
        
        # Create workflow instance
        self._create_case_workflow(case.id, case_type)
        
        # Create notification
        self._create_case_notification(case.id, "Case created from screening")
        
        audit_logger.log_action(
            screening.screened_by, "case_created", "case_management", 
            {"case_id": case.id, "screening_id": screening_result_id}, 
            True
        )
        
        return case
    
    def create_manual_case(
        self,
        case_type: CaseType,
        title: str,
        description: str,
        priority: CasePriority,
        created_by: str,
        assigned_to: Optional[str] = None,
        customer_ref: Optional[str] = None
    ) -> Case:
        """Create a manual case"""
        
        case = Case(
            id=str(uuid4()),
            case_type=case_type.value,
            title=title,
            description=description,
            status=CaseStatus.PENDING.value,
            priority=priority.value,
            created_by=created_by,
            created_at=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=7),
            org_id=self._get_user_org_id(created_by),
            customer_ref=customer_ref
        )
        
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        
        # Assign case
        if assigned_to:
            self.assign_case(case.id, assigned_to)
        else:
            self.auto_assign_case(case.id)
        
        # Create workflow instance
        self._create_case_workflow(case.id, case_type)
        
        audit_logger.log_action(
            created_by, "manual_case_created", "case_management", 
            {"case_id": case.id, "case_type": case_type.value}, 
            True
        )
        
        return case
    
    def assign_case(
        self, 
        case_id: str, 
        assigned_to: str,
        assigned_by: Optional[str] = None,
        reason: Optional[str] = None
    ) -> CaseAssignment:
        """Assign a case to a user"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        user = self.db.query(User).filter(User.username == assigned_to).first()
        if not user:
            raise ValueError("User not found")
        
        # Check if user belongs to same organization
        if user.org_id != case.org_id:
            raise ValueError("User not in same organization")
        
        # Create assignment
        assignment = CaseAssignment(
            id=str(uuid4()),
            case_id=case_id,
            assigned_to=assigned_to,
            assigned_by=assigned_by or "system",
            assigned_at=datetime.utcnow(),
            reason=reason or "Manual assignment",
            status="active"
        )
        
        # Update case status
        case.status = CaseStatus.UNDER_REVIEW.value
        case.assigned_to = assigned_to
        
        self.db.add(assignment)
        self.db.commit()
        
        # Add case history
        self._add_case_history(
            case_id, 
            "assigned", 
            f"Case assigned to {assigned_to}",
            assigned_by or "system"
        )
        
        # Create notification
        self._create_case_notification(case_id, f"Assigned to {assigned_to}")
        
        audit_logger.log_action(
            assigned_by or "system", "case_assigned", "case_management", 
            {"case_id": case_id, "assigned_to": assigned_to}, 
            True
        )
        
        return assignment
    
    def auto_assign_case(self, case_id: str) -> Optional[CaseAssignment]:
        """Auto-assign case based on rules"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return None
        
        # Apply assignment rules
        for rule in self.assignment_rules:
            if self._matches_assignment_rule(case, rule):
                return self.assign_case(case_id, rule.assignee_value, "system", "Auto-assignment")
        
        # Fallback: assign to user with least active cases
        least_busy_user = self._get_least_busy_user(case.org_id)
        if least_busy_user:
            return self.assign_case(case_id, least_busy_user, "system", "Load balancing")
        
        return None
    
    def update_case_status(
        self, 
        case_id: str, 
        status: CaseStatus,
        updated_by: str,
        notes: Optional[str] = None
    ) -> Case:
        """Update case status"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        old_status = case.status
        case.status = status.value
        case.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        # Add case history
        self._add_case_history(
            case_id,
            "status_changed",
            f"Status changed from {old_status} to {status.value}",
            updated_by,
            {"old_status": old_status, "new_status": status.value}
        )
        
        # Create notification if escalated
        if status == CaseStatus.ESCALATED:
            self._escalate_case(case_id, updated_by, notes)
        
        audit_logger.log_action(
            updated_by, "case_status_updated", "case_management", 
            {"case_id": case_id, "old_status": old_status, "new_status": status.value}, 
            True
        )
        
        return case
    
    def add_case_note(
        self, 
        case_id: str, 
        author: str, 
        content: str,
        note_type: str = "general"
    ) -> CaseNote:
        """Add a note to a case"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        note = CaseNote(
            id=str(uuid4()),
            case_id=case_id,
            author=author,
            content=content,
            note_type=note_type,
            created_at=datetime.utcnow()
        )
        
        self.db.add(note)
        self.db.commit()
        
        # Add case history
        self._add_case_history(
            case_id,
            "note_added",
            f"Note added by {author}",
            author,
            {"note_id": note.id, "note_type": note_type}
        )
        
        audit_logger.log_action(
            author, "case_note_added", "case_management", 
            {"case_id": case_id, "note_id": note.id}, 
            True
        )
        
        return note
    
    def get_case_details(self, case_id: str) -> Dict[str, Any]:
        """Get comprehensive case details"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        # Get assignments
        assignments = self.db.query(CaseAssignment).filter(
            CaseAssignment.case_id == case_id
        ).all()
        
        # Get notes
        notes = self.db.query(CaseNote).filter(
            CaseNote.case_id == case_id
        ).order_by(CaseNote.created_at.desc()).all()
        
        # Get history
        history = self.db.query(CaseHistory).filter(
            CaseHistory.case_id == case_id
        ).order_by(CaseHistory.created_at.desc()).all()
        
        # Get workflow instance
        workflow_instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.case_id == case_id
        ).first()
        
        return {
            "case": case,
            "assignments": assignments,
            "notes": notes,
            "history": history,
            "workflow_instance": workflow_instance,
            "related_screening": self._get_related_screening(case.screening_result_id)
        }
    
    def get_user_cases(
        self, 
        user_id: str, 
        status_filter: Optional[List[CaseStatus]] = None,
        priority_filter: Optional[List[CasePriority]] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Case]:
        """Get cases assigned to a user"""
        
        query = self.db.query(Case).filter(
            Case.assigned_to == user_id
        )
        
        if status_filter:
            query = query.filter(Case.status.in_([s.value for s in status_filter]))
        
        if priority_filter:
            query = query.filter(Case.priority.in_([p.value for p in priority_filter]))
        
        return query.order_by(Case.created_at.desc()).offset(offset).limit(limit).all()
    
    def get_organization_cases(
        self, 
        org_id: str,
        status_filter: Optional[List[CaseStatus]] = None,
        case_type_filter: Optional[List[CaseType]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Case]:
        """Get all cases for an organization"""
        
        query = self.db.query(Case).filter(Case.org_id == org_id)
        
        if status_filter:
            query = query.filter(Case.status.in_([s.value for s in status_filter]))
        
        if case_type_filter:
            query = query.filter(Case.case_type.in_([ct.value for ct in case_type_filter]))
        
        return query.order_by(Case.created_at.desc()).offset(offset).limit(limit).all()
    
    def escalate_case(
        self, 
        case_id: str, 
        escalated_by: str, 
        reason: str,
        escalate_to: Optional[str] = None
    ) -> Case:
        """Escalate a case to higher authority"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        # Update case status
        case.status = CaseStatus.ESCALATED.value
        case.escalated_at = datetime.utcnow()
        case.escalated_by = escalated_by
        case.escalation_reason = reason
        
        self.db.commit()
        
        # Add case history
        self._add_case_history(
            case_id,
            "escalated",
            f"Case escalated by {escalated_by}: {reason}",
            escalated_by,
            {"escalated_to": escalate_to}
        )
        
        # Create notification for escalation
        self._create_escalation_notification(case_id, escalated_by, reason, escalate_to)
        
        audit_logger.log_action(
            escalated_by, "case_escalated", "case_management", 
            {"case_id": case_id, "reason": reason}, 
            True
        )
        
        return case
    
    def resolve_case(
        self, 
        case_id: str, 
        resolved_by: str,
        resolution_notes: str,
        resolution_type: str = "manual"
    ) -> Case:
        """Resolve a case"""
        
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        # Update case
        case.status = CaseStatus.RESOLVED.value
        case.resolved_at = datetime.utcnow()
        case.resolved_by = resolved_by
        case.resolution_notes = resolution_notes
        case.resolution_type = resolution_type
        
        self.db.commit()
        
        # Add case history
        self._add_case_history(
            case_id,
            "resolved",
            f"Case resolved by {resolved_by}: {resolution_notes}",
            resolved_by,
            {"resolution_type": resolution_type}
        )
        
        # Complete workflow instance
        self._complete_case_workflow(case_id, resolved_by)
        
        # Create notification
        self._create_case_notification(case_id, "Case resolved")
        
        audit_logger.log_action(
            resolved_by, "case_resolved", "case_management", 
            {"case_id": case_id, "resolution_type": resolution_type}, 
            True
        )
        
        return case
    
    def add_assignment_rule(self, rule: CaseAssignmentRule):
        """Add an assignment rule"""
        self.assignment_rules.append(rule)
    
    def create_workflow_template(self, workflow: CaseWorkflow):
        """Create a workflow template"""
        self.workflow_templates[workflow.workflow_id] = workflow
    
    def get_case_analytics(
        self, 
        org_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get case management analytics"""
        
        start_date = start_date or (datetime.utcnow() - timedelta(days=30))
        end_date = end_date or datetime.utcnow()
        
        # Get cases in date range
        cases = self.db.query(Case).filter(
            Case.org_id == org_id,
            Case.created_at >= start_date,
            Case.created_at <= end_date
        ).all()
        
        # Calculate metrics
        total_cases = len(cases)
        resolved_cases = len([c for c in cases if c.status == CaseStatus.RESOLVED.value])
        pending_cases = len([c for c in cases if c.status in [CaseStatus.PENDING.value, CaseStatus.UNDER_REVIEW.value]])
        escalated_cases = len([c for c in cases if c.status == CaseStatus.ESCALATED.value])
        
        # Average resolution time
        resolution_times = []
        for case in cases:
            if case.resolved_at and case.created_at:
                time_diff = case.resolved_at - case.created_at
                resolution_times.append(time_diff.total_seconds() / 3600)  # hours
        
        avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
        
        # Case distribution by type and priority
        case_types = {}
        priorities = {}
        
        for case in cases:
            case_types[case.case_type] = case_types.get(case.case_type, 0) + 1
            priorities[case.priority] = priorities.get(case.priority, 0) + 1
        
        return {
            "total_cases": total_cases,
            "resolved_cases": resolved_cases,
            "pending_cases": pending_cases,
            "escalated_cases": escalated_cases,
            "resolution_rate": (resolved_cases / total_cases * 100) if total_cases > 0 else 0,
            "average_resolution_time": avg_resolution_time,
            "case_types": case_types,
            "priorities": priorities,
            "escalation_rate": (escalated_cases / total_cases * 100) if total_cases > 0 else 0
        }
    
    # Helper methods
    
    def _get_user_org_id(self, username: str) -> str:
        """Get user's organization ID"""
        user = self.db.query(User).filter(User.username == username).first()
        return user.org_id if user else None
    
    def _matches_assignment_rule(self, case: Case, rule: CaseAssignmentRule) -> bool:
        """Check if case matches assignment rule"""
        # Implementation would check case properties against rule conditions
        return True  # Simplified for now
    
    def _get_least_busy_user(self, org_id: str) -> Optional[str]:
        """Get user with least active cases"""
        active_cases = self.db.query(
            Case.assigned_to,
            func.count(Case.id).label('case_count')
        ).filter(
            Case.org_id == org_id,
            Case.status.in_([CaseStatus.PENDING.value, CaseStatus.UNDER_REVIEW.value])
        ).group_by(Case.assigned_to).all()
        
        if not active_cases:
            # Get any user from organization
            user = self.db.query(User).filter(User.org_id == org_id).first()
            return user.username if user else None
        
        # Return user with minimum case count
        least_busy = min(active_cases, key=lambda x: x.case_count)
        return least_busy.assigned_to
    
    def _add_case_history(
        self, 
        case_id: str, 
        action: str, 
        description: str, 
        performed_by: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Add entry to case history"""
        history = CaseHistory(
            id=str(uuid4()),
            case_id=case_id,
            action=action,
            description=description,
            performed_by=performed_by,
            metadata=metadata or {},
            created_at=datetime.utcnow()
        )
        self.db.add(history)
        self.db.commit()
    
    def _create_case_workflow(self, case_id: str, case_type: CaseType):
        """Create workflow instance for case"""
        # Get workflow template for case type
        workflow_template = self.workflow_templates.get(f"workflow_{case_type.value}")
        if not workflow_template:
            return
        
        # Create workflow instance
        workflow_instance = WorkflowInstance(
            id=str(uuid4()),
            case_id=case_id,
            workflow_id=workflow_template.workflow_id,
            status=WorkflowStatus.PENDING.value,
            current_step=0,
            created_at=datetime.utcnow()
        )
        
        self.db.add(workflow_instance)
        self.db.commit()
    
    def _complete_case_workflow(self, case_id: str, completed_by: str):
        """Complete case workflow"""
        workflow_instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.case_id == case_id
        ).first()
        
        if workflow_instance:
            workflow_instance.status = WorkflowStatus.COMPLETED.value
            workflow_instance.completed_at = datetime.utcnow()
            workflow_instance.completed_by = completed_by
            self.db.commit()
    
    def _create_case_notification(self, case_id: str, message: str):
        """Create notification for case event"""
        # Implementation would create notification in database
        pass
    
    def _create_escalation_notification(self, case_id: str, escalated_by: str, reason: str, escalate_to: Optional[str]):
        """Create notification for case escalation"""
        # Implementation would create escalation notification
        pass
    
    def _get_related_screening(self, screening_result_id: Optional[str]) -> Optional[ScreeningResult]:
        """Get related screening result"""
        if not screening_result_id:
            return None
        
        return self.db.query(ScreeningResult).filter(
            ScreeningResult.id == screening_result_id
        ).first()

# Workflow engine
class WorkflowEngine:
    """Advanced workflow engine for case management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.workflow_steps = {}
    
    def register_step(self, step_name: str, step_function):
        """Register a workflow step"""
        self.workflow_steps[step_name] = step_function
    
    async def execute_workflow(self, workflow_instance_id: str):
        """Execute workflow steps"""
        workflow_instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == workflow_instance_id
        ).first()
        
        if not workflow_instance:
            return False
        
        workflow_template = self.db.query(Workflow).filter(
            Workflow.id == workflow_instance.workflow_id
        ).first()
        
        if not workflow_template:
            return False
        
        # Execute steps
        for step in workflow_template.steps:
            step_function = self.workflow_steps.get(step.step_type)
            if step_function:
                try:
                    result = await step_function(workflow_instance.case_id, step.parameters)
                    self._log_workflow_step(workflow_instance_id, step.step_name, "completed", result)
                except Exception as e:
                    self._log_workflow_step(workflow_instance_id, step.step_name, "failed", str(e))
                    return False
        
        # Complete workflow
        workflow_instance.status = WorkflowStatus.COMPLETED.value
        workflow_instance.completed_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def _log_workflow_step(self, workflow_instance_id: str, step_name: str, status: str, result: Any):
        """Log workflow step execution"""
        # Implementation would log step execution
        pass

# Usage example:
"""
# Initialize case management service
case_service = CaseManagementService(db)

# Create assignment rules
rule1 = CaseAssignmentRule(
    rule_name="High Priority Assignment",
    conditions={"priority": "critical"},
    assignee_type="role",
    assignee_value="supervisor"
)
case_service.add_assignment_rule(rule1)

# Create workflow template
workflow = CaseWorkflow(
    workflow_id="workflow_screening_match",
    name="Screening Match Workflow",
    steps=[
        {"step_name": "Initial Review", "step_type": "review", "parameters": {}},
        {"step_name": "Manual Verification", "step_type": "verification", "parameters": {}},
        {"step_name": "Decision", "step_type": "decision", "parameters": {}}
    ],
    auto_assign=True,
    escalation_rules=[]
)
case_service.create_workflow_template(workflow)

# Create case from screening
case = case_service.create_case_from_screening(
    screening_result_id="scr-123",
    priority=CasePriority.CRITICAL
)

# Get case analytics
analytics = case_service.get_case_analytics(org_id="org-123")

# Update case status
case_service.update_case_status(
    case_id=case.id,
    status=CaseStatus.ESCALATED,
    updated_by="user123",
    notes="Requires supervisor review"
)
"""