"""
Enterprise Dashboard Data Seeder
Populates the database with realistic data for dashboard analytics
"""

import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal, engine
from app.models.models import (
    Organization, User, Screening, ScreeningResult, MonitoredEntity,
    Case, Notification, ComplianceSettings, Subscription, BulkJob,
    WhitelistedEntity, MonitoringAlert, AuditLog
)
from app.core.security import get_password_hash
import hashlib
import json

def generate_uuid():
    return str(uuid.uuid4())

def random_date(days_back=365):
    """Generate random date within the last N days"""
    return datetime.utcnow() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )

def seed_organizations(db: Session):
    """Seed organizations"""
    print("Seeding organizations...")
    
    existing = db.query(Organization).count()
    if existing > 0:
        print(f"  Found {existing} organizations, skipping...")
        return db.query(Organization).all()
    
    orgs = [
        Organization(
            id=generate_uuid(),
            name="Cellbunq Financial Services",
            created_at=datetime.utcnow() - timedelta(days=365),
            is_active=True
        ),
        Organization(
            id=generate_uuid(),
            name="Global Compliance Solutions",
            created_at=datetime.utcnow() - timedelta(days=180),
            is_active=True
        ),
        Organization(
            id=generate_uuid(),
            name="Acme Corp AML Division",
            created_at=datetime.utcnow() - timedelta(days=90),
            is_active=True
        )
    ]
    
    for org in orgs:
        db.add(org)
    
    db.commit()
    print(f"  Created {len(orgs)} organizations")
    return orgs

def seed_users(db: Session, orgs: list):
    """Seed users"""
    print("Seeding users...")
    
    existing = db.query(User).count()
    if existing > 3:
        print(f"  Found {existing} users, skipping...")
        return db.query(User).all()
    
    first_org = orgs[0]
    
    users_data = [
        {"username": "admin", "email": "admin@cellbunq.com", "full_name": "System Administrator", "role": "Admin"},
        {"username": "compliance_officer", "email": "compliance@cellbunq.com", "full_name": "Sarah Johnson", "role": "Compliance Officer"},
        {"username": "analyst_1", "email": "analyst1@cellbunq.com", "full_name": "Michael Chen", "role": "Analyst"},
        {"username": "analyst_2", "email": "analyst2@cellbunq.com", "full_name": "Emily Davis", "role": "Analyst"},
        {"username": "reviewer", "email": "reviewer@cellbunq.com", "full_name": "David Wilson", "role": "Supervisor"},
    ]
    
    users = []
    for i, data in enumerate(users_data):
        user = User(
            username=data["username"],
            email=data["email"],
            full_name=data["full_name"],
            role=data["role"],
            password_hash=get_password_hash("password123"),
            api_key=hashlib.sha256(f"{data['username']}_api_key".encode()).hexdigest(),
            org_id=first_org.id,
            is_active=True,
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"  Created {len(users)} users")
    return users

def seed_screenings(db: Session, users: list):
    """Seed historical screenings (v1)"""
    print("Seeding screenings (v1)...")
    
    existing = db.query(Screening).count()
    if existing > 50:
        print(f"  Found {existing} screenings, skipping...")
        return
    
    first_names = ["John", "Jane", "Robert", "Maria", "Ahmed", "Wei", "Vladimir", "Ivan", "Sergei", "Olga"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    companies = ["Global Trade Inc", "Offshore Holdings Ltd", "Pacific Ventures", "Mediterranean Trading",
                "Alpine Investments", "Nordic Finance", "Caribbean Holdings", "Emerald Capital"]
    statuses = ["Clear", "Review", "Match", "Cleared"]
    
    for i in range(200):
        is_entity = random.random() > 0.7
        status = random.choice(statuses)
        match_count = 0 if status == "Clear" else random.randint(1, 8)
        
        screening = Screening(
            id=generate_uuid(),
            first_name=random.choice(first_names) if not is_entity else None,
            last_name=random.choice(last_names) if not is_entity else None,
            company_name=random.choice(companies) if is_entity else None,
            date_of_birth=f"{random.randint(1950, 2000)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            timestamp=random_date(180),
            status=status,
            match_count=match_count,
            user_id=random.choice(users).username,
            results=[
                {
                    "match_id": f"Q{random.randint(1000, 99999)}",
                    "caption": f"{random.choice(first_names)} {random.choice(last_names)}",
                    "score": random.randint(60, 100),
                    "match_type": random.choice(["pep", "sanction", "adverse_media"])
                }
                for _ in range(match_count)
            ] if match_count > 0 else []
        )
        db.add(screening)
    
    db.commit()
    print(f"  Created 200 screenings")

def seed_screening_results_sql(db: Session, users: list):
    """Seed screening results (v2) using raw SQL for proper array handling"""
    print("Seeding screening results (v2) using raw SQL...")
    
    existing = db.execute(text('SELECT COUNT(*) FROM screening_results')).scalar()
    if existing > 100:
        print(f"  Found {existing} screening results, skipping...")
        return
    
    first_names = ["John", "Jane", "Robert", "Maria", "Ahmed", "Wei", "Vladimir", "Ivan", "Sergei", "Olga"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    companies = ["Global Trade Inc", "Offshore Holdings Ltd", "Pacific Ventures", "Mediterranean Trading",
                "Alpine Investments", "Nordic Finance", "Caribbean Holdings", "Emerald Capital"]
    
    schema_types = ["Person", "Person", "Person", "Person", "Company", "Organization"]
    risk_levels = ["LOW", "LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH"]
    auto_decisions = ["clear", "clear", "clear", "review", "review"]
    statuses = ["pending", "pending", "reviewed", "resolved", "escalated"]
    match_topics_options = [
        ["pep: heads of companies"], ["sanction: eu consolidated"], ["adverse_media: crime"],
        ["sanction: ofac sdn"], ["pep: parliament"], ["adverse_media: litigation"]
    ]
    datasets_options = [["eu_fsf", "wd_peps"], ["ofac_sdn"], ["us_debar"],
                       ["un_sc_sanctions"], ["uk_hmt_sanctions"], ["interpol"]]
    
    # Get user org_id for the first org
    first_user = users[0]
    
    for i in range(500):
        schema_type = random.choice(schema_types)
        risk_level = random.choice(risk_levels)
        auto_decision = random.choice(auto_decisions)
        status = random.choice(statuses)
        
        name = f"{random.choice(first_names)} {random.choice(last_names)}" if schema_type == "Person" else random.choice(companies)
        match_count = 0 if auto_decision == "clear" else random.randint(1, 6)
        top_score = random.randint(60, 100) if match_count > 0 else random.randint(10, 40)
        
        screened_at = random_date(180)
        reviewed_by = random.choice(users).username if status in ["reviewed", "resolved"] else None
        reviewed_at = screened_at + timedelta(hours=random.randint(1, 48)) if reviewed_by else None
        
        # Prepare array values - use NULL for empty arrays
        if match_count > 0:
            top_match_datasets = "{" + ",".join([f'"{d}"' for d in random.choice(datasets_options)]) + "}"
            top_match_topics = "{" + ",".join([f'"{t}"' for t in random.choice(match_topics_options)]) + "}"
        else:
            top_match_datasets = None
            top_match_topics = None
        
        # Build all_matches JSON
        all_matches = [
            {
                "id": f"Q{random.randint(1000, 99999)}",
                "caption": f"{random.choice(first_names)} {random.choice(last_names)}",
                "score": random.randint(60, 100),
            }
            for _ in range(match_count)
        ]
        
        screened_by = random.choice(users).username
        
        # Insert using raw SQL
        sql = text("""
            INSERT INTO screening_results 
            (id, screened_at, customer_ref, customer_name, schema_type, query_payload,
             match_count, top_score, top_match_id, top_match_caption, top_match_datasets,
             top_match_topics, all_matches, risk_level, auto_decision, status,
             reviewed_by, reviewed_at, screened_by, screening_reason, duration_ms)
            VALUES 
            (:id, :screened_at, :customer_ref, :customer_name, :schema_type, :query_payload,
             :match_count, :top_score, :top_match_id, :top_match_caption, :top_match_datasets,
             :top_match_topics, :all_matches, :risk_level, :auto_decision, :status,
             :reviewed_by, :reviewed_at, :screened_by, :screening_reason, :duration_ms)
        """)
        
        db.execute(sql, {
            'id': str(uuid.uuid4()),
            'screened_at': screened_at,
            'customer_ref': f"REF-{random.randint(100000, 999999)}",
            'customer_name': name,
            'schema_type': schema_type,
            'query_payload': json.dumps({"name": name, "schema": schema_type}),
            'match_count': match_count,
            'top_score': float(top_score),
            'top_match_id': f"Q{random.randint(1000, 99999)}" if match_count > 0 else None,
            'top_match_caption': f"{random.choice(first_names)} {random.choice(last_names)}" if match_count > 0 else None,
            'top_match_datasets': top_match_datasets,
            'top_match_topics': top_match_topics,
            'all_matches': json.dumps(all_matches),
            'risk_level': risk_level,
            'auto_decision': auto_decision,
            'status': status,
            'reviewed_by': reviewed_by,
            'reviewed_at': reviewed_at,
            'screened_by': screened_by,
            'screening_reason': random.choice(["customer_onboarding", "periodic_review", "transaction", "alert"]),
            'duration_ms': random.randint(200, 2000)
        })
    
    db.commit()
    print(f"  Created 500 screening results")

def seed_monitored_entities(db: Session, users: list):
    """Seed monitored entities"""
    print("Seeding monitored entities...")
    
    existing = db.query(MonitoredEntity).count()
    if existing > 50:
        print(f"  Found {existing} monitored entities, skipping...")
        return
    
    first_names = ["Vladimir", "Ivan", "Sergei", "Olga", "Mohammed", "Ahmed"]
    last_names = ["Ivanov", "Petrov", "Sokolov", "Kuznetsov", "Aliev", "Hassan"]
    companies = ["Offshore Holdings Ltd", "Mediterranean Trading", "Caribbean Holdings", 
                 "Diamond Holdings", "Imperial Finance", "Phoenix Group LLC"]
    risk_levels = ["LOW", "MEDIUM", "HIGH", "HIGH", "MEDIUM", "LOW"]
    entity_statuses = ["active", "active", "active", "active", "paused", "inactive"]
    
    entities = []
    for i in range(100):
        is_entity = random.random() > 0.6
        name = random.choice(companies) if is_entity else f"{random.choice(first_names)} {random.choice(last_names)}"
        
        entity = MonitoredEntity(
            id=str(uuid.uuid4()),
            user_id=random.choice(users).username,
            customer_ref=f"MON-{random.randint(1000, 9999)}",
            entity_id=f"Q{random.randint(1000, 99999)}",
            query_name=name,
            query_details={"name": name, "schema": "Company" if is_entity else "Person"},
            last_risk_level=random.choice(risk_levels),
            last_screened_at=random_date(30),
            status=random.choice(entity_statuses),
            created_at=random_date(180)
        )
        db.add(entity)
        entities.append(entity)
    
    db.commit()
    print(f"  Created {len(entities)} monitored entities")

def seed_cases(db: Session, users: list):
    """Seed compliance cases"""
    print("Seeding cases...")
    
    existing = db.query(Case).count()
    if existing > 50:
        print(f"  Found {existing} cases, skipping...")
        return
    
    org = db.query(Organization).first()
    if not org:
        print("  No organization found, skipping...")
        return
    
    org_id = org.id
    case_titles = [
        "High-risk match requires manual review",
        "False positive investigation",
        "Periodic review triggered",
        "Customer due diligence update required",
        "Suspicious activity report preparation"
    ]
    
    statuses = ["pending", "under_review", "escalated", "resolved", "closed"]
    priorities = ["low", "medium", "high", "critical"]
    
    cases = []
    for i in range(75):
        status = random.choice(statuses)
        created_at = random_date(90)
        
        case = Case(
            id=generate_uuid(),
            case_type=random.choice(["screening_match", "manual_review", "customer_request", "alert"]),
            title=random.choice(case_titles),
            description=f"Case description for case {i+1}. This case requires immediate attention.",
            status=status,
            priority=random.choice(priorities),
            assigned_to=random.choice(users).username if random.random() > 0.3 else None,
            created_by=random.choice(users).username,
            due_date=created_at + timedelta(days=random.randint(1, 14)),
            resolved_at=created_at + timedelta(hours=random.randint(4, 72)) if status in ["resolved", "closed"] else None,
            resolved_by=random.choice(users).username if status == "resolved" else None,
            org_id=org_id,
            created_at=created_at
        )
        db.add(case)
        cases.append(case)
    
    db.commit()
    print(f"  Created {len(cases)} cases")

def seed_notifications(db: Session, users: list):
    """Seed notifications"""
    print("Seeding notifications...")
    
    existing = db.query(Notification).count()
    if existing > 100:
        print(f"  Found {existing} notifications, skipping...")
        return
    
    titles = [
        "New screening match detected",
        "Case assigned to you",
        "Screening completed - Review required",
        "Monitoring alert triggered",
        "Case escalated",
        "Periodic review due"
    ]
    
    messages = [
        "A high-priority match was found during screening. Immediate review required.",
        "A new case has been assigned to your queue for review.",
        "The screening has completed. Results require your attention.",
        "A monitored entity has triggered an alert. Check the monitoring dashboard.",
        "Case has been escalated to your department.",
        "Periodic review is due. Please complete the review."
    ]
    
    types = ["screening", "case", "screening", "monitoring", "case", "screening"]
    priorities = ["low", "normal", "normal", "high", "high", "normal"]
    
    notifications = []
    for i in range(100):
        notif = Notification(
            id=generate_uuid(),
            user_id=random.choice(users).username,
            title=random.choice(titles),
            message=random.choice(messages),
            type=random.choice(types),
            priority=random.choice(priorities),
            is_read=random.random() > 0.3,
            created_at=random_date(30)
        )
        db.add(notif)
        notifications.append(notif)
    
    db.commit()
    print(f"  Created {len(notifications)} notifications")

def seed_monitoring_alerts(db: Session):
    """Seed monitoring alerts using raw SQL to match actual table schema"""
    print("Seeding monitoring alerts...")
    
    # Check existing count with correct column name
    existing = db.execute(text('SELECT COUNT(*) FROM monitoring_alerts')).scalar()
    if existing > 50:
        print(f"  Found {existing} monitoring alerts, skipping...")
        return
    
    entities = db.query(MonitoredEntity).limit(50).all()
    if not entities:
        print("  No monitored entities found, skipping...")
        return
    
    # Insert using raw SQL with correct column names
    for entity in entities[:50]:
        for _ in range(random.randint(1, 3)):
            sql = text("""
                INSERT INTO monitoring_alerts 
                (alert_id, monitoring_id, timestamp, alert_type, previous_status, 
                 current_status, new_matches_count, message, notified)
                VALUES 
                (:alert_id, :monitoring_id, :timestamp, :alert_type, :previous_status,
                 :current_status, :new_matches_count, :message, :notified)
            """)
            
            db.execute(sql, {
                'alert_id': str(uuid.uuid4()),
                'monitoring_id': entity.id,
                'timestamp': random_date(30),
                'alert_type': random.choice(['risk_change', 'new_match', 'status_update']),
                'previous_status': random.choice(['LOW', 'MEDIUM', 'HIGH']),
                'current_status': random.choice(['LOW', 'MEDIUM', 'HIGH']),
                'new_matches_count': random.randint(0, 5),
                'message': 'Automated monitoring alert triggered',
                'notified': random.choice([True, False])
            })
    
    db.commit()
    print(f"  Created monitoring alerts")

def seed_bulk_jobs(db: Session, users: list):
    """Seed bulk screening jobs"""
    print("Seeding bulk jobs...")
    
    existing = db.query(BulkJob).count()
    if existing > 20:
        print(f"  Found {existing} bulk jobs, skipping...")
        return
    
    statuses = ["pending", "processing", "completed", "completed", "completed", "failed"]
    filenames = [
        "customer_batch_2024.csv",
        "vendor_screening_q1.csv",
        "employee_verification.csv",
        "partner_due_diligence.csv"
    ]
    
    jobs = []
    for i in range(30):
        status = random.choice(statuses)
        total = random.randint(100, 5000)
        processed = total if status == "completed" else random.randint(0, total) if status == "processing" else 0
        
        job = BulkJob(
            id=generate_uuid(),
            user_id=random.choice(users).username,
            filename=random.choice(filenames),
            total_rows=total,
            processed_rows=processed,
            status=status,
            results_summary={
                "high_risk": random.randint(0, int(total * 0.05)),
                "medium_risk": random.randint(0, int(total * 0.1)),
                "low_risk": random.randint(0, int(total * 0.15)),
                "clear": random.randint(0, int(total * 0.7))
            } if status == "completed" else None,
            created_at=random_date(60),
            completed_at=random_date(30) if status == "completed" else None
        )
        db.add(job)
        jobs.append(job)
    
    db.commit()
    print(f"  Created {len(jobs)} bulk jobs")

def seed_audit_logs(db: Session, users: list):
    """Seed audit logs"""
    print("Seeding audit logs...")
    
    existing = db.query(AuditLog).count()
    if existing > 200:
        print(f"  Found {existing} audit logs, skipping...")
        return
    
    actions = [
        "screening.created", "screening.completed", "case.created", "case.assigned",
        "case.resolved", "user.login", "report.generated", "settings.updated"
    ]
    
    logs = []
    for i in range(300):
        action = random.choice(actions)
        user = random.choice(users) if random.random() > 0.1 else None
        
        log = AuditLog(
            id=generate_uuid(),
            user_id=user.username if user else None,
            action=action,
            resource="screening" if "screening" in action else "case" if "case" in action else "user",
            success=True,
            details={
                "ip_address": f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
            },
            timestamp=random_date(60)
        )
        db.add(log)
        logs.append(log)
    
    db.commit()
    print(f"  Created {len(logs)} audit logs")

def seed_compliance_settings(db: Session, orgs: list):
    """Seed compliance settings"""
    print("Seeding compliance settings...")
    
    for org in orgs:
        existing = db.query(ComplianceSettings).filter(ComplianceSettings.org_id == org.id).first()
        if existing:
            continue
        
        settings = ComplianceSettings(
            org_id=org.id,
            fuzzy_threshold=80,
            enable_pep=True,
            enable_sanctions=True,
            enable_adverse_media=True,
            auto_clear_threshold=50
        )
        db.add(settings)
    
    db.commit()
    print(f"  Updated compliance settings for {len(orgs)} organizations")

def seed_subscriptions(db: Session, orgs: list):
    """Seed subscriptions"""
    print("Seeding subscriptions...")
    
    for org in orgs:
        existing = db.query(Subscription).filter(Subscription.org_id == org.id).first()
        if existing:
            continue
        
        subscription = Subscription(
            id=generate_uuid(),
            org_id=org.id,
            plan="enterprise",
            status="active",
            billing_cycle="monthly",
            seats_used=random.randint(3, 8),
            seats_limit=10,
            screenings_used=random.randint(1000, 5000),
            screenings_limit=5000,
            next_billing_date=datetime.utcnow() + timedelta(days=random.randint(1, 30))
        )
        db.add(subscription)
    
    db.commit()
    print(f"  Updated subscriptions for {len(orgs)} organizations")

def run_seed():
    """Run all seed functions"""
    print("=" * 50)
    print("Starting Enterprise Dashboard Data Seeder")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Seed data in order
        orgs = seed_organizations(db)
        users = seed_users(db, orgs)
        seed_screenings(db, users)
        seed_screening_results_sql(db, users)
        seed_monitored_entities(db, users)
        seed_cases(db, users)
        seed_notifications(db, users)
        # Skip monitoring_alerts due to schema mismatch
        print("Skipping monitoring_alerts (schema mismatch)")
        seed_bulk_jobs(db, users)
        seed_audit_logs(db, users)
        seed_compliance_settings(db, orgs)
        seed_subscriptions(db, orgs)
        
        print("=" * 50)
        print("Data seeding completed successfully!")
        print("=" * 50)
        
        # Print summary
        print("\nData Summary:")
        print(f"  Organizations: {db.query(Organization).count()}")
        print(f"  Users: {db.query(User).count()}")
        print(f"  Screenings (v1): {db.query(Screening).count()}")
        print(f"  Screening Results (v2): {db.execute(text('SELECT COUNT(*) FROM screening_results')).scalar()}")
        print(f"  Monitored Entities: {db.query(MonitoredEntity).count()}")
        print(f"  Cases: {db.query(Case).count()}")
        print(f"  Notifications: {db.query(Notification).count()}")
        print(f"  Monitoring Alerts: {db.execute(text('SELECT COUNT(*) FROM monitoring_alerts')).scalar()}")
        print(f"  Bulk Jobs: {db.query(BulkJob).count()}")
        print(f"  Audit Logs: {db.query(AuditLog).count()}")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
