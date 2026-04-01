-- Migration: Enterprise Features Implementation
-- This migration adds enterprise-level features including multi-tenancy, case management, 
-- workflows, analytics, AI/ML, security, and notifications.

-- ========================================
-- MULTI-TENANT MODELS
-- ========================================

-- Organizations table (already exists in models, but ensure it's created)
CREATE TABLE IF NOT EXISTS organizations (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_orgs_active ON organizations (is_active);

-- Compliance Settings table
CREATE TABLE IF NOT EXISTS compliance_settings (
    id                      SERIAL PRIMARY KEY,
    org_id                  TEXT NOT NULL UNIQUE REFERENCES organizations(id),
    fuzzy_threshold         INTEGER DEFAULT 80,
    enable_pep              BOOLEAN DEFAULT TRUE,
    enable_sanctions        BOOLEAN DEFAULT TRUE,
    enable_adverse_media    BOOLEAN DEFAULT TRUE,
    auto_clear_threshold    INTEGER DEFAULT 50,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_org ON compliance_settings (org_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id                      TEXT PRIMARY KEY,
    org_id                  TEXT NOT NULL UNIQUE REFERENCES organizations(id),
    plan                    TEXT DEFAULT 'starter',
    status                  TEXT DEFAULT 'trialing',
    billing_cycle           TEXT DEFAULT 'monthly',
    seats_used              INTEGER DEFAULT 1,
    seats_limit             INTEGER DEFAULT 3,
    screenings_used         INTEGER DEFAULT 0,
    screenings_limit        INTEGER DEFAULT 500,
    next_billing_date       TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions (org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- ========================================
-- INTEGRATION MODELS
-- ========================================

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    url             TEXT NOT NULL,
    events          TEXT[] NOT NULL,
    headers         JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks (org_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks (is_active);

-- Integration Configs table
CREATE TABLE IF NOT EXISTS integration_configs (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    integration_type TEXT NOT NULL,
    config          JSONB NOT NULL,
    is_active       BOOLEAN DEFAULT FALSE,
    last_sync       TIMESTAMPTZ,
    sync_status     TEXT DEFAULT 'idle',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_configs_org ON integration_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_type ON integration_configs (integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_configs_status ON integration_configs (sync_status);

-- ========================================
-- CASE MANAGEMENT MODELS
-- ========================================

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id                      TEXT PRIMARY KEY,
    case_type               TEXT NOT NULL,
    title                   TEXT NOT NULL,
    description             TEXT,
    status                  TEXT DEFAULT 'pending',
    priority                TEXT DEFAULT 'medium',
    assigned_to             TEXT REFERENCES users(username),
    created_by              TEXT NOT NULL REFERENCES users(username),
    screening_result_id     TEXT REFERENCES screening_results(id),
    customer_ref            TEXT,
    due_date                TIMESTAMPTZ,
    resolved_at             TIMESTAMPTZ,
    resolved_by             TEXT REFERENCES users(username),
    resolution_notes        TEXT,
    resolution_type         TEXT,
    escalated_at            TIMESTAMPTZ,
    escalated_by            TEXT REFERENCES users(username),
    escalation_reason       TEXT,
    org_id                  TEXT NOT NULL REFERENCES organizations(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_org ON cases (org_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases (assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases (priority);
CREATE INDEX IF NOT EXISTS idx_cases_type ON cases (case_type);
CREATE INDEX IF NOT EXISTS idx_cases_screening_result ON cases (screening_result_id);

-- Case Assignments table
CREATE TABLE IF NOT EXISTS case_assignments (
    id              TEXT PRIMARY KEY,
    case_id         TEXT NOT NULL REFERENCES cases(id),
    assigned_to     TEXT NOT NULL REFERENCES users(username),
    assigned_by     TEXT NOT NULL REFERENCES users(username),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason          TEXT,
    status          TEXT DEFAULT 'active',
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_case_assignments_case ON case_assignments (case_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_assigned_to ON case_assignments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_case_assignments_status ON case_assignments (status);

-- Case Notes table
CREATE TABLE IF NOT EXISTS case_notes (
    id              TEXT PRIMARY KEY,
    case_id         TEXT NOT NULL REFERENCES cases(id),
    author          TEXT NOT NULL REFERENCES users(username),
    content         TEXT NOT NULL,
    note_type       TEXT DEFAULT 'general',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case ON case_notes (case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_author ON case_notes (author);
CREATE INDEX IF NOT EXISTS idx_case_notes_type ON case_notes (note_type);

-- Case History table
CREATE TABLE IF NOT EXISTS case_history (
    id              TEXT PRIMARY KEY,
    case_id         TEXT NOT NULL REFERENCES cases(id),
    action          TEXT NOT NULL,
    description     TEXT NOT NULL,
    performed_by    TEXT NOT NULL REFERENCES users(username),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_history_case ON case_history (case_id);
CREATE INDEX IF NOT EXISTS idx_case_history_action ON case_history (action);
CREATE INDEX IF NOT EXISTS idx_case_history_performed_by ON case_history (performed_by);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    steps           JSONB NOT NULL,
    auto_assign     BOOLEAN DEFAULT FALSE,
    escalation_rules JSONB DEFAULT '[]',
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      TEXT NOT NULL REFERENCES users(username),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows (is_active);

-- Workflow Instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
    id              TEXT PRIMARY KEY,
    case_id         TEXT NOT NULL REFERENCES cases(id),
    workflow_id     TEXT NOT NULL REFERENCES workflows(id),
    status          TEXT DEFAULT 'pending',
    current_step    INTEGER DEFAULT 0,
    step_data       JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    completed_by    TEXT REFERENCES users(username)
);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_case ON workflow_instances (case_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow ON workflow_instances (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances (status);

-- Workflow Steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id              TEXT PRIMARY KEY,
    workflow_id     TEXT NOT NULL REFERENCES workflows(id),
    step_name       TEXT NOT NULL,
    step_type       TEXT NOT NULL,
    parameters      JSONB DEFAULT '{}',
    order           INTEGER NOT NULL,
    required_approvals INTEGER DEFAULT 1,
    timeout_minutes INTEGER DEFAULT 1440
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_type ON workflow_steps (step_type);

-- ========================================
-- ANALYTICS MODELS
-- ========================================

-- Dashboard Widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    user_id         TEXT REFERENCES users(username),
    widget_type     TEXT NOT NULL,
    title           TEXT NOT NULL,
    config          JSONB NOT NULL,
    position        JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_org ON dashboard_widgets (org_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets (user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets (widget_type);

-- Report Templates table
CREATE TABLE IF NOT EXISTS report_templates (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    name            TEXT NOT NULL,
    description     TEXT,
    report_type     TEXT NOT NULL,
    template_config JSONB NOT NULL,
    schedule        JSONB,
    recipients      TEXT[] DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      TEXT NOT NULL REFERENCES users(username),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_org ON report_templates (org_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates (report_type);

-- Report Instances table
CREATE TABLE IF NOT EXISTS report_instances (
    id              TEXT PRIMARY KEY,
    template_id     TEXT NOT NULL REFERENCES report_templates(id),
    report_data     JSONB NOT NULL,
    file_url        TEXT,
    status          TEXT DEFAULT 'generating',
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by    TEXT REFERENCES users(username)
);

CREATE INDEX IF NOT EXISTS idx_report_instances_template ON report_instances (template_id);
CREATE INDEX IF NOT EXISTS idx_report_instances_status ON report_instances (status);

-- ========================================
-- AI/ML MODELS
-- ========================================

-- AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
    id              TEXT PRIMARY KEY,
    model_name      TEXT NOT NULL,
    model_type      TEXT NOT NULL,
    version         TEXT NOT NULL,
    accuracy        FLOAT,
    last_trained    TIMESTAMPTZ,
    training_data_size INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    config          JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models (model_type);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models (is_active);

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id              TEXT PRIMARY KEY,
    screening_result_id TEXT NOT NULL REFERENCES screening_results(id),
    feature         TEXT NOT NULL,
    confidence      FLOAT NOT NULL,
    explanation     TEXT NOT NULL,
    recommendations TEXT[] DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_result ON ai_insights (screening_result_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_feature ON ai_insights (feature);

-- AI Patterns table
CREATE TABLE IF NOT EXISTS ai_patterns (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    pattern_type    TEXT NOT NULL,
    pattern_data    JSONB NOT NULL,
    confidence      FLOAT NOT NULL,
    discovered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_org ON ai_patterns (org_id);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_patterns (pattern_type);

-- ========================================
-- SECURITY MODELS
-- ========================================

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id              TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(username),
    action          TEXT NOT NULL,
    resource        TEXT NOT NULL,
    success         BOOLEAN NOT NULL,
    details         JSONB DEFAULT '{}',
    ip_address      TEXT,
    user_agent      TEXT,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(username),
    session_token   TEXT NOT NULL UNIQUE,
    ip_address      TEXT,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions (is_active);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id              SERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id              SERIAL PRIMARY KEY,
    name            TEXT UNIQUE NOT NULL,
    description     TEXT,
    permissions     TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- NOTIFICATION MODELS
-- ========================================

-- Notification Templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES organizations(id),
    event_type      TEXT NOT NULL,
    template_name   TEXT NOT NULL,
    subject         TEXT NOT NULL,
    body            TEXT NOT NULL,
    channels        TEXT[] DEFAULT '{email}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_org ON notification_templates (org_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event ON notification_templates (event_type);

-- Notification Deliveries table
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id              TEXT PRIMARY KEY,
    notification_id TEXT NOT NULL REFERENCES notifications(id),
    channel         TEXT NOT NULL,
    status          TEXT DEFAULT 'pending',
    delivery_data   JSONB DEFAULT '{}',
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_channel ON notification_deliveries (channel);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries (status);

-- ========================================
-- ENHANCED USER MODEL
-- ========================================

-- Users Enhanced table
CREATE TABLE IF NOT EXISTS users_enhanced (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(username),
    last_login          TIMESTAMPTZ,
    login_count         INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    totp_enabled        BOOLEAN DEFAULT FALSE,
    totp_secret         TEXT,
    role                TEXT DEFAULT 'Analyst',
    department          TEXT,
    manager_id          TEXT REFERENCES users(username),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_enhanced_user ON users_enhanced (user_id);
CREATE INDEX IF NOT EXISTS idx_users_enhanced_role ON users_enhanced (role);
CREATE INDEX IF NOT EXISTS idx_users_enhanced_department ON users_enhanced (department);

-- ========================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ========================================

-- Performance indexes for enterprise features
CREATE INDEX IF NOT EXISTS idx_screening_results_org_id ON screening_results(org_id);
CREATE INDEX IF NOT EXISTS idx_cases_org_id ON cases(org_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_org_id ON integration_configs(org_id);

-- ========================================
-- TRIGGERS FOR UPDATED_AT FIELDS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at fields
DROP TRIGGER IF EXISTS update_compliance_settings_updated_at ON compliance_settings;
CREATE TRIGGER update_compliance_settings_updated_at 
    BEFORE UPDATE ON compliance_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_configs_updated_at ON integration_configs;
CREATE TRIGGER update_integration_configs_updated_at 
    BEFORE UPDATE ON integration_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at 
    BEFORE UPDATE ON dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_enhanced_updated_at ON users_enhanced;
CREATE TRIGGER update_users_enhanced_updated_at 
    BEFORE UPDATE ON users_enhanced 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA INSERTION
-- ========================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES 
    ('Viewer', 'Read-only access to dashboards and reports', '{view_dashboard,view_reports}'),
    ('Analyst', 'Can perform screenings and view cases', '{view_dashboard,view_reports,perform_screening,view_cases}'),
    ('Supervisor', 'Can manage cases and users', '{view_dashboard,view_reports,perform_screening,manage_cases,manage_users}'),
    ('Admin', 'Full administrative access', '{view_dashboard,view_reports,perform_screening,manage_cases,manage_users,manage_system}')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES 
    ('view_dashboard', 'View dashboard widgets and analytics'),
    ('view_reports', 'Access and generate reports'),
    ('perform_screening', 'Perform AML screenings'),
    ('view_cases', 'View case management'),
    ('manage_cases', 'Create, update, and resolve cases'),
    ('manage_users', 'Manage user accounts and permissions'),
    ('manage_system', 'System administration and configuration')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log the migration
INSERT INTO os_import_runs (dataset_version, file_imported, total_processed, added, updated, removed, skipped, duration_seconds, error) 
VALUES ('enterprise_v1', 'migrate_enterprise.sql', 0, 0, 0, 0, 0, 0, NULL);

-- Display completion message
SELECT 'Enterprise migration completed successfully' AS status;