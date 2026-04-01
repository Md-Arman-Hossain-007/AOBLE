-- Migration: Add Organizations and update Compliance Settings for multi-tenancy

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Insert a default organization (ignore if already exists)
INSERT INTO organizations (id, name)
VALUES ('default-org-0000-0000-0000-000000000001', 'Default Organization')
ON CONFLICT (id) DO NOTHING;

-- 3. Add org_id column to users (if not already there)
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id TEXT REFERENCES organizations(id);

-- 4. Link all existing users to the default organization
UPDATE users SET org_id = 'default-org-0000-0000-0000-000000000001' WHERE org_id IS NULL;

-- 5. Drop and recreate compliance_settings with org_id (clean schema)
DROP TABLE IF EXISTS compliance_settings;
CREATE TABLE compliance_settings (
    id SERIAL PRIMARY KEY,
    org_id TEXT UNIQUE REFERENCES organizations(id),
    fuzzy_threshold INTEGER DEFAULT 80,
    enable_pep BOOLEAN DEFAULT TRUE,
    enable_sanctions BOOLEAN DEFAULT TRUE,
    enable_adverse_media BOOLEAN DEFAULT TRUE,
    auto_clear_threshold INTEGER DEFAULT 50,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Seed default compliance settings for the default organization
INSERT INTO compliance_settings (org_id)
VALUES ('default-org-0000-0000-0000-000000000001')
ON CONFLICT (org_id) DO NOTHING;

-- 7. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    org_id TEXT UNIQUE REFERENCES organizations(id),
    plan TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'trialing',
    billing_cycle TEXT DEFAULT 'monthly',
    seats_used INTEGER DEFAULT 1,
    seats_limit INTEGER DEFAULT 3,
    screenings_used INTEGER DEFAULT 0,
    screenings_limit INTEGER DEFAULT 500,
    next_billing_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Seed default subscription for the default organization
INSERT INTO subscriptions (id, org_id, next_billing_date)
VALUES (
    'default-sub-0000-0000-0000-000000000001',
    'default-org-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP + INTERVAL '14 days'
)
ON CONFLICT (org_id) DO NOTHING;
 
 -- 9. Add 2FA columns to users
 ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE;
 ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
 
 -- 10. Create notifications table
 CREATE TABLE IF NOT EXISTS notifications (
     id TEXT PRIMARY KEY,
     user_id TEXT REFERENCES users(username),
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     type TEXT,
     priority TEXT DEFAULT 'normal',
     link TEXT,
     is_read BOOLEAN DEFAULT FALSE,
     metadata_json JSONB,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
 CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
 
 -- 11. Update sanctions_entities table
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS first_name TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS last_name TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS middle_name TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS gender TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS nationality TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS topics JSONB;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS datasets JSONB;
 
 -- 12. Update indices for sanctions_entities
 CREATE INDEX IF NOT EXISTS idx_sanctions_entities_topics ON sanctions_entities USING GIN (topics);
 CREATE INDEX IF NOT EXISTS idx_sanctions_entities_datasets ON sanctions_entities USING GIN (datasets);
 CREATE INDEX IF NOT EXISTS idx_sanctions_entities_names ON sanctions_entities (first_name, last_name);
 
 -- 13. Refined updates for sanctions_entities
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS is_target BOOLEAN DEFAULT FALSE;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS first_seen TEXT;
 ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS last_seen TEXT;
 
 -- 14. Additional indices
 CREATE INDEX IF NOT EXISTS idx_sanctions_entities_target ON sanctions_entities (is_target);
