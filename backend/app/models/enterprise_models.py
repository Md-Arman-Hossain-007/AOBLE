from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from ..db.session import Base
import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

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

# Integration Models

class Webhook(Base):
    __tablename__ = "webhooks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), index=True)
    url = Column(String, nullable=False)
    events = Column(ARRAY(String), nullable=False) # e.g., ["screening.completed", "case.assigned"]
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

# Case Management Models

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
    screening_result_id = Column(String, ForeignKey("screening_results.id"), nullable=True)
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

# Analytics Models

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

# AI/ML Models

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
    screening_result_id = Column(String, ForeignKey("screening_results.id"), nullable=False)
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

# Security Models

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
    permissions = Column(ARRAY(String), default=[])
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Notification Models

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    event_type = Column(String, nullable=False) # screening_completed, case_assigned, etc.
    template_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    channels = Column(ARRAY(String), default=["email"]) # email, webhook, in_app
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

# Enhanced Existing Models

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