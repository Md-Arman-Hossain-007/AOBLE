#!/usr/bin/env python3
"""
Seed script for Enterprise Case Management Module
Creates realistic compliance cases with full workflow, notes, and history.
"""
import sys
import os
import datetime
import random
import uuid

# Add the backend path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models import models

# Configuration
TARGET_USERNAME = "Arman"  # Change this to your test username

def get_or_create_user(db):
    """Get existing user or create one if needed"""
    user = db.query(models.User).filter(models.User.username == TARGET_USERNAME).first()
    if not user:
        print(f"❌ User '{TARGET_USERNAME}' not found in database.")
        print("Available users:")
        users = db.query(models.User).all()
        for u in users:
            print(f"  - {u.username} ({u.email})")
        sys.exit(1)
    return user

def get_org_id(db, user):
    """Get organization ID for the user"""
    return user.org_id

def seed_workflows(db, created_by):
    """Create workflow templates"""
    print("\n📋 Seeding workflow templates...")
    
    existing = db.query(models.Workflow).count()
    if existing > 0:
        print(f"  Found {existing} workflows, skipping...")
        return db.query(models.Workflow).all()
    
    workflows = [
        models.Workflow(
            id=str(uuid.uuid4()),
            name="Standard Screening Review",
            description="Standard workflow for screening match cases",
            steps=[
                {"step_name": "Initial Review", "step_type": "review", "order": 0},
                {"step_name": "Enhanced Due Diligence", "step_type": "investigation", "order": 1},
                {"step_name": "Supervisor Approval", "step_type": "approval", "order": 2},
                {"step_name": "Final Decision", "step_type": "decision", "order": 3}
            ],
            auto_assign=True,
            escalation_rules=[
                {"condition": "priority == critical", "action": "notify_supervisor"}
            ],
            is_active=True,
            created_by=created_by,
            created_at=datetime.datetime.utcnow()
        ),
        models.Workflow(
            id=str(uuid.uuid4()),
            name="High-Risk Case Investigation",
            description="Extended workflow for high-risk and critical cases",
            steps=[
                {"step_name": "Initial Assessment", "step_type": "review", "order": 0},
                {"step_name": "Evidence Collection", "step_type": "investigation", "order": 1},
                {"step_name": "Risk Analysis", "step_type": "analysis", "order": 2},
                {"step_name": "Compliance Review", "step_type": "review", "order": 3},
                {"step_name": "Management Approval", "step_type": "approval", "order": 4},
                {"step_name": "Final Disposition", "step_type": "decision", "order": 5}
            ],
            auto_assign=False,
            escalation_rules=[],
            is_active=True,
            created_by=created_by,
            created_at=datetime.datetime.utcnow()
        ),
        models.Workflow(
            id=str(uuid.uuid4()),
            name="Regulatory Inquiry Response",
            description="Workflow for handling regulatory inquiries",
            steps=[
                {"step_name": "Intake & Triage", "step_type": "review", "order": 0},
                {"step_name": "Document Collection", "step_type": "investigation", "order": 1},
                {"step_name": "Legal Review", "step_type": "review", "order": 2},
                {"step_name": "Response Drafting", "step_type": "investigation", "order": 3},
                {"step_name": "Executive Approval", "step_type": "approval", "order": 4}
            ],
            auto_assign=True,
            escalation_rules=[],
            is_active=True,
            created_by=created_by,
            created_at=datetime.datetime.utcnow()
        )
    ]
    
    for workflow in workflows:
        db.add(workflow)
    
    db.commit()
    print(f"  ✅ Created {len(workflows)} workflow templates")
    return workflows

def seed_cases(db, user, org_id, workflows):
    """Create comprehensive case data"""
    print("\n📊 Seeding compliance cases...")
    
    existing = db.query(models.Case).filter(models.Case.created_by == TARGET_USERNAME).count()
    if existing > 0:
        print(f"  Found {existing} existing cases for {TARGET_USERNAME}")
        print("  Deleting existing cases and re-seeding...")
        # Delete existing
        case_ids = [c.id for c in db.query(models.Case).filter(models.Case.created_by == TARGET_USERNAME).all()]
        for case_id in case_ids:
            db.query(models.CaseNote).filter(models.CaseNote.case_id == case_id).delete()
            db.query(models.CaseHistory).filter(models.CaseHistory.case_id == case_id).delete()
            db.query(models.CaseAssignment).filter(models.CaseAssignment.case_id == case_id).delete()
            db.query(models.WorkflowInstance).filter(models.WorkflowInstance.case_id == case_id).delete()
        db.query(models.Case).filter(models.Case.created_by == TARGET_USERNAME).delete()
        db.commit()
        print("  🗑️  Deleted existing cases")
    
    # Case templates with realistic data
    case_templates = [
        {
            "title": "Sanctions Match: Vladimir Putin - OFAC SDN List",
            "description": "Potential match on OFAC SDN list for Vladimir Putin. Screening returned 3 matches with scores above 85%. Requires enhanced due diligence to confirm if this is the sanctioned individual or a false positive due to common name.",
            "case_type": "screening_match",
            "priority": "critical",
            "status": "under_review",
            "customer_ref": "CUST-2024-001",
            "due_date_offset": 2,  # 2 days from now (urgent)
            "workflow_idx": 1
        },
        {
            "title": "PEP Match: Maria Santos - Brazilian Politician",
            "description": "Customer flagged as Politically Exposed Person (PEP) during onboarding. Match found on World-Check database. Customer is claiming this is a different person with same name. Need to verify date of birth and nationality.",
            "case_type": "screening_match",
            "priority": "high",
            "status": "under_review",
            "customer_ref": "CUST-2024-045",
            "due_date_offset": 5,
            "workflow_idx": 0
        },
        {
            "title": "Adverse Media: John Smith - Fraud Allegations",
            "description": "Customer mentioned in adverse media regarding fraud allegations in UK newspaper. Articles dated 2023-2024. Need to assess reputational risk and determine if enhanced monitoring is required.",
            "case_type": "manual_review",
            "priority": "high",
            "status": "pending",
            "customer_ref": "CUST-2024-078",
            "due_date_offset": 7,
            "workflow_idx": 0
        },
        {
            "title": "Regulatory Inquiry: FinCEN SAR Request",
            "description": "Received formal inquiry from FinCEN requesting SAR filing history for Q4 2024. Need to compile all relevant SARs and supporting documentation. Deadline: 15 business days.",
            "case_type": "regulatory_inquiry",
            "priority": "critical",
            "status": "under_review",
            "customer_ref": "REG-2024-003",
            "due_date_offset": 10,
            "workflow_idx": 2
        },
        {
            "title": "Customer Request: Enhanced Due Diligence Report",
            "description": "Customer requesting copy of their EDD report for audit purposes. Need to compile all screening results, risk assessments, and supporting documentation while ensuring no sensitive internal notes are included.",
            "case_type": "customer_request",
            "priority": "medium",
            "status": "pending",
            "customer_ref": "CUST-2024-112",
            "due_date_offset": 14,
            "workflow_idx": 0
        },
        {
            "title": "Sanctions Match: Ahmed Al-Rashid - UAE National",
            "description": "Potential match on EU sanctions list. Customer provided passport showing different date of birth than sanctioned individual. Requires verification of identity documents and possible escalation to sanctions compliance team.",
            "case_type": "screening_match",
            "priority": "high",
            "status": "escalated",
            "customer_ref": "CUST-2024-156",
            "due_date_offset": -2,  # Already breached
            "workflow_idx": 1
        },
        {
            "title": "Periodic Review: Quarterly High-Risk Customer Review",
            "description": "Scheduled quarterly review of high-risk customer portfolio. Need to re-screen all customers, update risk ratings, and review transaction patterns for any suspicious activity.",
            "case_type": "manual_review",
            "priority": "medium",
            "status": "pending",
            "customer_ref": "PORTFOLIO-Q1-2024",
            "due_date_offset": 21,
            "workflow_idx": 0
        },
        {
            "title": "PEP Match: Li Wei - Chinese Government Official",
            "description": "New customer onboarding flagged potential PEP match. Customer is a mid-level government official in China. Risk assessment indicates medium risk due to position and country risk factors.",
            "case_type": "screening_match",
            "priority": "medium",
            "status": "resolved",
            "customer_ref": "CUST-2024-189",
            "due_date_offset": 0,
            "resolution_notes": "False positive confirmed. Customer is a different person with same name. DOB and passport number verified against official documents. EDD completed and approved by supervisor.",
            "resolution_type": "manual",
            "workflow_idx": 0
        },
        {
            "title": "Adverse Media: Sarah Johnson - Money Laundering Investigation",
            "description": "Customer named in FBI press release regarding money laundering investigation. Multiple news sources confirming involvement. Immediate account freeze recommended pending legal review.",
            "case_type": "manual_review",
            "priority": "critical",
            "status": "escalated",
            "customer_ref": "CUST-2024-201",
            "due_date_offset": -5,
            "workflow_idx": 1
        },
        {
            "title": "Customer Request: Account Reopening After Sanctions Clearance",
            "description": "Former customer requesting account reopening after successful sanctions clearance. Previous account was frozen due to sanctions match that has since been resolved. Need to re-run all screening and EDD before approval.",
            "case_type": "customer_request",
            "priority": "low",
            "status": "resolved",
            "customer_ref": "CUST-2023-445",
            "due_date_offset": 0,
            "resolution_notes": "Customer cleared after comprehensive re-screening. All sanctions and PEP checks returned negative. Account reopened with standard monitoring.",
            "resolution_type": "manual",
            "workflow_idx": 0
        },
        {
            "title": "Sanctions Match: Ivan Petrov - Russian National",
            "description": "Match found on UK HMT sanctions list. Customer has provided documentation showing they are not the sanctioned individual. Requires thorough investigation and possible legal opinion before clearance.",
            "case_type": "screening_match",
            "priority": "high",
            "status": "under_review",
            "customer_ref": "CUST-2024-223",
            "due_date_offset": 4,
            "workflow_idx": 0
        },
        {
            "title": "Regulatory Inquiry: GDPR Data Subject Access Request",
            "description": "Customer submitted GDPR DSAR requesting all personal data held. Need to compile customer information, screening results, case notes, and transaction history. 30-day response deadline.",
            "case_type": "regulatory_inquiry",
            "priority": "high",
            "status": "pending",
            "customer_ref": "DSAR-2024-015",
            "due_date_offset": 25,
            "workflow_idx": 2
        },
        {
            "title": "PEP Match: Carlos Rodriguez - Former Minister",
            "description": "Ongoing monitoring alert for former government official. Customer's political position changed (no longer in office) but still within cooling-off period. Risk rating needs reassessment.",
            "case_type": "screening_match",
            "priority": "medium",
            "status": "under_review",
            "customer_ref": "CUST-2023-567",
            "due_date_offset": 8,
            "workflow_idx": 0
        },
        {
            "title": "Bulk Screening Alert: 15 Matches from Daily Batch",
            "description": "Automated daily screening batch returned 15 potential matches across customer portfolio. Matches include 3 sanctions, 8 PEP, and 4 adverse media hits. Prioritization and assignment required.",
            "case_type": "screening_match",
            "priority": "high",
            "status": "pending",
            "customer_ref": "BATCH-2024-04-09",
            "due_date_offset": 3,
            "workflow_idx": 0
        },
        {
            "title": "Customer Request: Risk Rating Appeal",
            "description": "Customer appealing their high-risk rating, claiming it's affecting their business relationships. Requesting downgrade to medium risk based on improved compliance record and additional documentation provided.",
            "case_type": "customer_request",
            "priority": "low",
            "status": "resolved",
            "customer_ref": "CUST-2024-098",
            "due_date_offset": 0,
            "resolution_notes": "Risk rating maintained after review. Customer's business activities and jurisdiction still warrant high-risk classification. Customer notified with detailed explanation.",
            "resolution_type": "manual",
            "workflow_idx": 0
        }
    ]
    
    # Get other users for assignment
    other_users = db.query(models.User).filter(
        models.User.username != TARGET_USERNAME,
        models.User.org_id == org_id
    ).all()
    
    assignees = [TARGET_USERNAME] + [u.username for u in other_users[:3]]
    
    cases = []
    for i, template in enumerate(case_templates):
        # Calculate dates
        now = datetime.datetime.utcnow()
        created_days_ago = random.randint(1, 30)
        created_at = now - datetime.timedelta(days=created_days_ago)
        due_date = now + datetime.timedelta(days=template["due_date_offset"])
        
        # Randomly assign some cases
        assigned_to = None
        if template["status"] in ["under_review", "escalated"]:
            assigned_to = random.choice(assignees)
        elif random.random() > 0.5:
            assigned_to = random.choice(assignees)
        
        # Create case
        case = models.Case(
            id=str(uuid.uuid4()),
            case_type=template["case_type"],
            title=template["title"],
            description=template["description"],
            status=template["status"],
            priority=template["priority"],
            assigned_to=assigned_to,
            created_by=TARGET_USERNAME,
            created_at=created_at,
            updated_at=created_at,
            due_date=due_date if template["status"] != "resolved" else None,
            resolved_at=now - datetime.timedelta(days=random.randint(1, 10)) if template["status"] == "resolved" else None,
            resolved_by=TARGET_USERNAME if template["status"] == "resolved" else None,
            resolution_notes=template.get("resolution_notes"),
            resolution_type=template.get("resolution_type"),
            escalated_at=now - datetime.timedelta(days=random.randint(1, 5)) if template["status"] == "escalated" else None,
            escalated_by=TARGET_USERNAME if template["status"] == "escalated" else None,
            escalation_reason="Escalated due to high priority and complexity" if template["status"] == "escalated" else None,
            org_id=org_id,
            customer_ref=template["customer_ref"]
        )
        
        db.add(case)
        cases.append(case)
        db.flush()  # Get the case ID
        
        # Create workflow instance if specified
        if "workflow_idx" in template and template["workflow_idx"] is not None:
            workflow = workflows[template["workflow_idx"]]
            workflow_instance = models.WorkflowInstance(
                id=str(uuid.uuid4()),
                case_id=case.id,
                workflow_id=workflow.id,
                status="in_progress" if template["status"] in ["pending", "under_review"] else "completed" if template["status"] == "resolved" else "pending",
                current_step=random.randint(0, len(workflow.steps) - 1),
                step_data={},
                started_at=created_at,
                completed_at=case.resolved_at if case.resolved_at else None,
                completed_by=case.resolved_by
            )
            db.add(workflow_instance)
        
        # Create case assignments
        if assigned_to:
            assignment = models.CaseAssignment(
                id=str(uuid.uuid4()),
                case_id=case.id,
                assigned_to=assigned_to,
                assigned_by=TARGET_USERNAME,
                assigned_at=created_at,
                reason="Assigned based on workload and expertise",
                status="active"
            )
            db.add(assignment)
        
        # Create case history
        history_entries = [
            models.CaseHistory(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action="created",
                description=f"Case created by {TARGET_USERNAME}",
                performed_by=TARGET_USERNAME,
                event_data={"case_type": template["case_type"], "priority": template["priority"]},
                created_at=created_at
            )
        ]
        
        if assigned_to:
            history_entries.append(models.CaseHistory(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action="assigned",
                description=f"Case assigned to {assigned_to}",
                performed_by=TARGET_USERNAME,
                event_data={"assigned_to": assigned_to},
                created_at=created_at + datetime.timedelta(minutes=5)
            ))
        
        if template["status"] == "escalated":
            history_entries.append(models.CaseHistory(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action="escalated",
                description=f"Case escalated by {TARGET_USERNAME}",
                performed_by=TARGET_USERNAME,
                event_data={"reason": "High priority case requiring supervisor attention"},
                created_at=created_at + datetime.timedelta(days=random.randint(1, 3))
            ))
        
        if template["status"] == "resolved":
            history_entries.append(models.CaseHistory(
                id=str(uuid.uuid4()),
                case_id=case.id,
                action="resolved",
                description=f"Case resolved by {TARGET_USERNAME}",
                performed_by=TARGET_USERNAME,
                event_data={"resolution_type": template.get("resolution_type", "manual")},
                created_at=case.resolved_at or now
            ))
        
        for history in history_entries:
            db.add(history)
        
        # Create case notes
        num_notes = random.randint(1, 4)
        note_templates = [
            "Initial review completed. Screening results show multiple potential matches requiring further investigation.",
            "Contacted customer for additional documentation. Awaiting response with passport and proof of address.",
            "Reviewed sanctions list details. Match appears to be false positive based on DOB discrepancy.",
            "Escalated to sanctions compliance team for expert opinion on match validity.",
            "Enhanced due diligence completed. All documentation verified and authenticated.",
            "Supervisor review pending. Case file compiled and ready for approval.",
            "Legal team consulted regarding regulatory requirements for this case type.",
            "Customer provided additional context explaining the name similarity. Awaiting verification.",
            "Risk assessment updated based on new information. Medium risk rating confirmed.",
            "Final disposition: False positive. Customer cleared and monitoring reduced to standard level."
        ]
        
        for j in range(num_notes):
            note_date = created_at + datetime.timedelta(days=random.randint(0, min(created_days_ago, 20)))
            note = models.CaseNote(
                id=str(uuid.uuid4()),
                case_id=case.id,
                author=random.choice(assignees),
                content=random.choice(note_templates),
                note_type=random.choice(["general", "investigation", "resolution"]),
                created_at=note_date
            )
            db.add(note)
        
        if (i + 1) % 5 == 0:
            print(f"  ✅ Created {i + 1} cases...")
    
    db.commit()
    print(f"  ✅ Created {len(cases)} compliance cases")
    print(f"  ✅ Created case assignments, notes, and history")
    return cases

def print_summary(db, user):
    """Print comprehensive summary of seeded data"""
    print("\n" + "="*70)
    print("📊 COMPLIANCE & CASE MANAGEMENT - SEED SUMMARY")
    print("="*70)
    
    org_id = user.org_id
    
    # Case counts by status
    status_counts = {}
    for status in ["pending", "under_review", "escalated", "resolved"]:
        count = db.query(models.Case).filter(
            models.Case.org_id == org_id,
            models.Case.status == status
        ).count()
        status_counts[status] = count
    
    # Case counts by priority
    priority_counts = {}
    for priority in ["low", "medium", "high", "critical"]:
        count = db.query(models.Case).filter(
            models.Case.org_id == org_id,
            models.Case.priority == priority
        ).count()
        priority_counts[priority] = count
    
    # Case counts by type
    type_counts = {}
    for case_type in ["screening_match", "manual_review", "customer_request", "regulatory_inquiry"]:
        count = db.query(models.Case).filter(
            models.Case.org_id == org_id,
            models.Case.case_type == case_type
        ).count()
        type_counts[case_type] = count
    
    print(f"\n👤 User: {user.username} ({user.email})")
    print(f"🏢 Organization ID: {org_id}")
    
    print(f"\n📋 Cases by Status:")
    print(f"   Pending:      {status_counts.get('pending', 0)}")
    print(f"   Under Review: {status_counts.get('under_review', 0)}")
    print(f"   Escalated:    {status_counts.get('escalated', 0)}")
    print(f"   Resolved:     {status_counts.get('resolved', 0)}")
    print(f"   Total:        {sum(status_counts.values())}")
    
    print(f"\n🎯 Cases by Priority:")
    print(f"   Critical: {priority_counts.get('critical', 0)}")
    print(f"   High:     {priority_counts.get('high', 0)}")
    print(f"   Medium:   {priority_counts.get('medium', 0)}")
    print(f"   Low:      {priority_counts.get('low', 0)}")
    
    print(f"\n📝 Cases by Type:")
    print(f"   Screening Match:    {type_counts.get('screening_match', 0)}")
    print(f"   Manual Review:      {type_counts.get('manual_review', 0)}")
    print(f"   Customer Request:   {type_counts.get('customer_request', 0)}")
    print(f"   Regulatory Inquiry: {type_counts.get('regulatory_inquiry', 0)}")
    
    # SLA Status
    now = datetime.datetime.utcnow()
    sla_breached = db.query(models.Case).filter(
        models.Case.org_id == org_id,
        models.Case.due_date < now,
        models.Case.status.in_(['pending', 'under_review', 'escalated'])
    ).count()
    
    sla_warning = db.query(models.Case).filter(
        models.Case.org_id == org_id,
        models.Case.due_date >= now,
        models.Case.due_date <= now + datetime.timedelta(hours=24),
        models.Case.status.in_(['pending', 'under_review', 'escalated'])
    ).count()
    
    print(f"\n⏰ SLA Status:")
    print(f"   Breached:  {sla_breached}")
    print(f"   Warning:   {sla_warning}")
    print(f"   OK:        {sum(status_counts.values()) - sla_breached - sla_warning}")
    
    # Total counts
    total_notes = db.query(models.CaseNote).join(models.Case).filter(
        models.Case.org_id == org_id
    ).count()
    
    total_history = db.query(models.CaseHistory).join(models.Case).filter(
        models.Case.org_id == org_id
    ).count()
    
    total_assignments = db.query(models.CaseAssignment).join(models.Case).filter(
        models.Case.org_id == org_id
    ).count()
    
    total_workflows = db.query(models.WorkflowInstance).join(models.Case).filter(
        models.Case.org_id == org_id
    ).count()
    
    print(f"\n📈 Additional Data:")
    print(f"   Notes:        {total_notes}")
    print(f"   History:      {total_history}")
    print(f"   Assignments:  {total_assignments}")
    print(f"   Workflows:    {total_workflows}")
    
    print("\n" + "="*70)
    print("✅ SEEDING COMPLETE!")
    print("="*70)
    print("\n🌐 Next Steps:")
    print("   1. Navigate to: http://localhost:3000/cases")
    print("   2. View all cases in the compliance inbox")
    print("   3. Test filters: Status, Priority, SLA")
    print("   4. Try bulk operations: Select cases and assign/escalate")
    print("   5. Click on a case to view details, notes, and workflow")
    print("   6. Check risk assessments and related cases")
    print("\n💡 Features to Explore:")
    print("   • SLA tracking with color-coded badges")
    print("   • Risk assessment engine")
    print("   • Workflow progress tracking")
    print("   • Investigation notes timeline")
    print("   • Audit history")
    print("   • Bulk case operations")
    print("="*70 + "\n")

def main():
    print("="*70)
    print("🚀 COMPLIANCE & CASE MANAGEMENT SEED SCRIPT")
    print("="*70)
    
    db = SessionLocal()
    try:
        # Get user
        print(f"\n👤 Looking for user: {TARGET_USERNAME}")
        user = get_or_create_user(db)
        print(f"   ✅ Found user: {user.username}")
        
        # Get org
        org_id = get_org_id(db, user)
        print(f"   ✅ Organization ID: {org_id}")
        
        # Seed workflows
        workflows = seed_workflows(db, TARGET_USERNAME)
        
        # Seed cases
        cases = seed_cases(db, user, org_id, workflows)
        
        # Print summary
        print_summary(db, user)
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
