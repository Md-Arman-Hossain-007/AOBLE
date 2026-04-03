from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from ..db.session import Base
import datetime
import uuid
import os

def generate_uuid():
    return str(uuid.uuid4())

# Use JSON for SQLite compatibility
USE_SQLITE = os.getenv("USE_SQLITE", "true").lower() == "true"

if USE_SQLITE:
    JSONB = JSON
    ARRAY = JSON
    PGUUID = String
else:
    from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY

# Multi-Tenant Models

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    users = relationship("User", back_populates="organization")
    compliance_settings = relationship("ComplianceSettings", back_populates="organization", uselist=False)
    subscription = relationship("Subscription", back_populates="organization", uselist=False)

class User(Base):
    __tablename__ = "users"
    
    username = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    api_key = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    role = Column(String, default="Compliance Officer")
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    
    organization = relationship("Organization", back_populates="users")

class Screening(Base):
    __tablename__ = "screenings"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String)  # Clear, Review, Match
    results = Column(JSON)   # Detailed matches
    match_count = Column(Integer, default=0)
    user_id = Column(String, ForeignKey("users.username"))

class SanctionsEntity(Base):
    __tablename__ = "sanctions_entities"
    
    id = Column(String, primary_key=True, index=True)  # Using OpenSanctions ID e.g. Q7747
    schema = Column(String, index=True)    # Person, Company, etc.
    primary_name = Column(String, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    entity_type = Column(String, index=True) # individual, entity
    topics = Column(JSON, nullable=True)     # e.g. ["pep", "sanction"]
    datasets = Column(JSON, nullable=True)   # e.g. ["wd_peps", "eu_fsf"]
    is_target = Column(Boolean, default=False, index=True)
    first_seen = Column(String, nullable=True)
    last_seen = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True) # Storing full nested data
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    aliases = relationship("SanctionsAlias", back_populates="entity", cascade="all, delete-orphan")
    countries = relationship("SanctionsCountry", back_populates="entity", cascade="all, delete-orphan")
    listings = relationship("SanctionsListing", back_populates="entity", cascade="all, delete-orphan")

class SanctionsAlias(Base):
    __tablename__ = "sanctions_aliases"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, ForeignKey("sanctions_entities.id"), index=True)
    alias_name = Column(String, index=True, nullable=False)
    language = Column(String, nullable=True)
    
    entity = relationship("SanctionsEntity", back_populates="aliases")

class SanctionsCountry(Base):
    __tablename__ = "sanctions_countries"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, ForeignKey("sanctions_entities.id"), index=True)
    country_code = Column(String(3), index=True) # ISO alpha-3
    
    entity = relationship("SanctionsEntity", back_populates="countries")

class SanctionsListing(Base):
    __tablename__ = "sanctions_sanctions"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, ForeignKey("sanctions_entities.id"), index=True)
    dataset = Column(String, index=True)
    authority = Column(String)
    program = Column(String)
    source_url = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    
    entity = relationship("SanctionsEntity", back_populates="listings")

class WebSearchResult(Base):
    __tablename__ = "web_search_results"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    query = Column(String, index=True)
    entity_id = Column(String, ForeignKey("sanctions_entities.id"), nullable=True, index=True)
    results_json = Column(JSON) # Cached SERP results
    provider = Column(String) # Google, Bing, SerpAPI
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScreeningAuditLog(Base):
    __tablename__ = "screening_audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"), index=True)
    query_name = Column(String, nullable=False)
    query_params = Column(JSON) # e.g. {"country": "RU", "dob": "..."}
    match_count = Column(Integer, default=0)
    results_summary = Column(JSON) # Top match IDs and scores
    dataset_version = Column(String) # For transparency
    search_context = Column(Text, nullable=True) # Extra info for compliance
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ComplianceSettings(Base):
    __tablename__ = "compliance_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, ForeignKey("organizations.id"), unique=True)
    fuzzy_threshold = Column(Integer, default=80)
    enable_pep = Column(Boolean, default=True)
    enable_sanctions = Column(Boolean, default=True)
    enable_adverse_media = Column(Boolean, default=True)
    auto_clear_threshold = Column(Integer, default=50) # Scores below this are marked Clear automatically
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    organization = relationship("Organization", back_populates="compliance_settings")

PLAN_LIMITS = {
    "starter":      {"seats": 3,   "screenings": 500},
    "professional": {"seats": 10,  "screenings": 5000},
    "enterprise":   {"seats": 999, "screenings": 999999},
}

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), unique=True, index=True)
    plan = Column(String, default="starter")          # starter | professional | enterprise
    status = Column(String, default="trialing")       # trialing | active | cancelled | past_due
    billing_cycle = Column(String, default="monthly") # monthly | annual
    seats_used = Column(Integer, default=1)
    seats_limit = Column(Integer, default=3)
    screenings_used = Column(Integer, default=0)
    screenings_limit = Column(Integer, default=500)
    next_billing_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="subscription")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"), index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, index=True) # screening, monitoring, billing, system, security
    priority = Column(String, default="normal") # low, normal, high, urgent
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OSSource(Base):
    __tablename__ = "os_sources"

    identifier = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    publisher = Column(String, nullable=True)
    publisher_country = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    entity_count = Column(Integer, nullable=True)
    type = Column(String, nullable=True)

class OSEntity(Base):
    __tablename__ = "os_entities"

    id = Column(String, primary_key=True)
    schema = Column(String, nullable=False, index=True)
    caption = Column(String, nullable=True)
    datasets = Column(JSONB, nullable=True)
    topics = Column(JSONB, nullable=True)
    properties = Column(JSONB, nullable=False)
    referents = Column(JSONB, nullable=True)
    first_seen = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)

class OSEntityName(Base):
    __tablename__ = "os_entity_names"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, ForeignKey("os_entities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    lang = Column(String, nullable=True)

class OSProfile(Base):
    __tablename__ = "os_profiles"

    id = Column(String, primary_key=True)
    schema = Column(String, nullable=False, index=True)
    caption = Column(String, nullable=True)
    topics = Column(JSONB, nullable=True)
    datasets = Column(JSONB, nullable=True)
    names = Column(JSONB, nullable=True)
    birth_dates = Column(JSONB, nullable=True)
    nationalities = Column(JSONB, nullable=True)
    countries = Column(JSONB, nullable=True)
    id_numbers = Column(JSONB, nullable=True)
    positions = Column(JSONB, nullable=True)
    full_profile = Column(JSONB, nullable=False)
    first_seen = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)

class OSImportRun(Base):
    __tablename__ = "os_import_runs"

    run_id = Column(Integer, primary_key=True, autoincrement=True)
    imported_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    dataset_version = Column(String, nullable=True)
    file_imported = Column(String, nullable=True) # "sources", "entities", "nested"
    total_processed = Column(Integer, nullable=True)
    added = Column(Integer, nullable=True)
    updated = Column(Integer, nullable=True)
    removed = Column(Integer, nullable=True)
    skipped = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)

class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(PGUUID, primary_key=True, default=uuid.uuid4)
    screened_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    customer_ref = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    schema_type = Column(String, nullable=False, default='Person')
    query_payload = Column(JSONB, nullable=False)
    match_count = Column(Integer, nullable=False, default=0)
    top_score = Column(Float, nullable=True)
    top_match_id = Column(String, nullable=True)
    top_match_caption = Column(String, nullable=True)
    top_match_datasets = Column(JSONB, nullable=True)
    top_match_topics = Column(JSONB, nullable=True)
    all_matches = Column(JSONB, nullable=True)
    risk_level = Column(String, nullable=False, default='LOW')
    auto_decision = Column(String, nullable=False, default='clear')
    status = Column(String, nullable=False, default='pending')
    final_decision = Column(String, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    screened_by = Column(String, nullable=True)
    screening_reason = Column(String, nullable=True)
    batch_id = Column(String, nullable=True, index=True) # Linked bulk job
    duration_ms = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)

class WhitelistedEntity(Base):
    __tablename__ = "whitelisted_entities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    customer_ref = Column(String, nullable=False, index=True)
    entity_id = Column(String, nullable=False, index=True) # OpenSanctions ID
    entity_name = Column(String, nullable=True)
    reason = Column(String, nullable=True)
    added_by = Column(String, ForeignKey("users.username"))
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")

class BulkJob(Base):
    __tablename__ = "bulk_jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"))
    filename = Column(String)
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    status = Column(String, default="pending") # pending, processing, completed, failed
    error = Column(Text, nullable=True)
    results_summary = Column(JSONB, nullable=True) # {high_risk: X, medium_risk: Y, ...}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class MonitoredEntity(Base):
    __tablename__ = "monitored_entities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), index=True)
    customer_ref = Column(String(100), index=True)
    entity_id = Column(String(100), nullable=True)
    query_name = Column(String(255))
    query_details = Column(JSON)
    last_risk_level = Column(String(20))
    last_screened_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MonitoringAlert(Base):
    __tablename__ = "monitoring_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    monitored_entity_id = Column(String(36), ForeignKey("monitored_entities.id"))
    previous_risk = Column(String(20))
    new_risk = Column(String(20))
    change_type = Column(String(50))
    details = Column(JSON)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Enterprise Integration Models

class Webhook(Base):
    __tablename__ = "webhooks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True)
    url = Column(String, nullable=False)
    events = Column(JSONB, nullable=False) # e.g., ["screening.completed", "case.assigned"]
    headers = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_used = Column(DateTime, nullable=True)

class IntegrationConfig(Base):
    __tablename__ = "integration_configs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True)
    integration_type = Column(String, nullable=False) # salesforce, hubspot, slack, etc.
    config = Column(JSONB, nullable=False) # Stores API keys, endpoints, etc.
    is_active = Column(Boolean, default=False)
    last_sync = Column(DateTime, nullable=True)
    sync_status = Column(String, default="idle") # idle, syncing, error
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Enterprise Case Management Models

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_type = Column(String, nullable=False) # screening_match, manual_review, customer_request, etc.
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pending") # pending, under_review, escalated, resolved, closed
    priority = Column(String, default="medium") # low, medium, high, critical
    assigned_to = Column(String, ForeignKey("users.username"), nullable=True)
    created_by = Column(String, ForeignKey("users.username"), nullable=False)
    screening_result_id = Column(PGUUID, ForeignKey("screening_results.id"), nullable=True)
    customer_ref = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, ForeignKey("users.username"), nullable=True)
    resolution_notes = Column(Text)
    resolution_type = Column(String) # manual, automated, escalated
    escalated_at = Column(DateTime, nullable=True)
    escalated_by = Column(String, ForeignKey("users.username"), nullable=True)
    escalation_reason = Column(Text)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class CaseAssignment(Base):
    __tablename__ = "case_assignments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    assigned_to = Column(String, ForeignKey("users.username"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.username"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    reason = Column(Text)
    status = Column(String, default="active") # active, completed, cancelled
    completed_at = Column(DateTime, nullable=True)

class CaseNote(Base):
    __tablename__ = "case_notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    author = Column(String, ForeignKey("users.username"), nullable=False)
    content = Column(Text, nullable=False)
    note_type = Column(String, default="general") # general, resolution, escalation, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CaseHistory(Base):
    __tablename__ = "case_history"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    action = Column(String, nullable=False) # created, assigned, status_changed, note_added, escalated, resolved
    description = Column(Text, nullable=False)
    performed_by = Column(String, ForeignKey("users.username"), nullable=False)
    event_data = Column(JSONB, default={}) # Additional context about the action (renamed from metadata)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text)
    steps = Column(JSONB, nullable=False) # Array of workflow steps
    auto_assign = Column(Boolean, default=False)
    escalation_rules = Column(JSONB, default=[]) # Rules for automatic escalation
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.username"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    status = Column(String, default="pending") # pending, in_progress, completed, failed
    current_step = Column(Integer, default=0)
    step_data = Column(JSONB, default={}) # Data for current step
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String, ForeignKey("users.username"), nullable=True)

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    step_name = Column(String, nullable=False)
    step_type = Column(String, nullable=False) # review, verification, decision, notification
    parameters = Column(JSONB, default={}) # Step-specific parameters
    order = Column(Integer, nullable=False)
    required_approvals = Column(Integer, default=1)
    timeout_minutes = Column(Integer, default=1440) # 24 hours default

# Enterprise Analytics Models

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.username"), nullable=True) # Null for org-wide widgets
    widget_type = Column(String, nullable=False) # chart, metric, table, etc.
    title = Column(String, nullable=False)
    config = Column(JSONB, nullable=False) # Widget configuration
    position = Column(JSONB, default={}) # x, y, width, height
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ReportTemplate(Base):
    __tablename__ = "report_templates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    report_type = Column(String, nullable=False) # screening_volume, user_activity, compliance, custom
    template_config = Column(JSONB, nullable=False) # Report configuration
    schedule = Column(JSONB, nullable=True) # Cron-like scheduling
    recipients = Column(ARRAY(String), default=[]) # Email recipients
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.username"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReportInstance(Base):
    __tablename__ = "report_instances"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, ForeignKey("report_templates.id"), nullable=False)
    report_data = Column(JSONB, nullable=False) # Generated report data
    file_url = Column(String, nullable=True) # Link to generated file
    status = Column(String, default="generating") # generating, completed, failed
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    generated_by = Column(String, ForeignKey("users.username"), nullable=True)

# Enterprise AI/ML Models

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False) # anomaly_detection, false_positive, risk_prediction
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    last_trained = Column(DateTime, nullable=True)
    training_data_size = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    config = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AIInsight(Base):
    __tablename__ = "ai_insights"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    screening_result_id = Column(PGUUID, ForeignKey("screening_results.id"), nullable=False)
    feature = Column(String, nullable=False) # anomaly_detection, false_positive_reduction, etc.
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    recommendations = Column(ARRAY(String), default=[])
    insight_metadata = Column(JSONB, default={}) # Additional metadata (renamed from metadata)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AIPattern(Base):
    __tablename__ = "ai_patterns"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    pattern_type = Column(String, nullable=False) # temporal, geographic, behavioral
    pattern_data = Column(JSONB, nullable=False)
    confidence = Column(Float, nullable=False)
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Enterprise Security Models

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"), nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    success = Column(Boolean, nullable=False)
    details = Column(JSONB, default={})
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"), nullable=False)
    session_token = Column(String, nullable=False, unique=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    permissions = Column(JSONB, default=[])
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Enterprise Notification Models

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    event_type = Column(String, nullable=False) # screening_completed, case_assigned, etc.
    template_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    channels = Column(JSONB, default=["email"]) # email, webhook, in_app
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class NotificationDelivery(Base):
    __tablename__ = "notification_deliveries"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    notification_id = Column(String, ForeignKey("notifications.id"), nullable=False)
    channel = Column(String, nullable=False) # email, webhook, in_app
    status = Column(String, default="pending") # pending, sent, failed, delivered
    delivery_data = Column(JSONB, default={}) # Channel-specific delivery info
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Enhanced User Model for Enterprise Features

class UserEnhanced(Base):
    __tablename__ = "users_enhanced"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.username"), nullable=False)
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.datetime.utcnow)
    totp_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    role = Column(String, default="Analyst") # Viewer, Analyst, Supervisor, Admin
    department = Column(String, nullable=True)
    manager_id = Column(String, ForeignKey("users.username"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Indexes for Performance
"""
CREATE INDEX idx_screening_results_org_id ON screening_results(org_id);
CREATE INDEX idx_cases_org_id ON cases(org_id);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_integration_configs_org_id ON integration_configs(org_id);
"""