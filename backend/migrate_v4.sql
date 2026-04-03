-- Migration v4: Aligning types with JSONB for consistency across models
-- This resolves potential DatatypeMismatch errors when using ARRAY(String) with SQLAlchemy and Postgres.

-- 1. Convert ARRAY columns to JSONB in screening_results
ALTER TABLE screening_results ALTER COLUMN top_match_datasets TYPE JSONB USING to_jsonb(top_match_datasets);
ALTER TABLE screening_results ALTER COLUMN top_match_topics TYPE JSONB USING to_jsonb(top_match_topics);

-- 2. Convert ARRAY columns to JSONB in os_entities
ALTER TABLE os_entities ALTER COLUMN datasets TYPE JSONB USING to_jsonb(datasets);
ALTER TABLE os_entities ALTER COLUMN topics TYPE JSONB USING to_jsonb(topics);
ALTER TABLE os_entities ALTER COLUMN referents TYPE JSONB USING to_jsonb(referents);

-- 3. Convert ARRAY columns to JSONB in os_profiles
ALTER TABLE os_profiles ALTER COLUMN topics TYPE JSONB USING to_jsonb(topics);
ALTER TABLE os_profiles ALTER COLUMN datasets TYPE JSONB USING to_jsonb(datasets);
ALTER TABLE os_profiles ALTER COLUMN names TYPE JSONB USING to_jsonb(names);
ALTER TABLE os_profiles ALTER COLUMN birth_dates TYPE JSONB USING to_jsonb(birth_dates);
ALTER TABLE os_profiles ALTER COLUMN nationalities TYPE JSONB USING to_jsonb(nationalities);
ALTER TABLE os_profiles ALTER COLUMN countries TYPE JSONB USING to_jsonb(countries);
ALTER TABLE os_profiles ALTER COLUMN id_numbers TYPE JSONB USING to_jsonb(id_numbers);
ALTER TABLE os_profiles ALTER COLUMN positions TYPE JSONB USING to_jsonb(positions);

-- 4. Ensure metadata_json in notifications is JSONB (already was in some cases, ensuring here)
ALTER TABLE notifications ALTER COLUMN metadata_json TYPE JSONB USING metadata_json::JSONB;

-- 5. Enterprise Features: Convert ARRAY columns to JSONB
-- Roles table
ALTER TABLE roles ALTER COLUMN permissions TYPE JSONB USING to_jsonb(permissions);

-- Webhooks table
ALTER TABLE webhooks ALTER COLUMN events TYPE JSONB USING to_jsonb(events);

-- Notification Templates
ALTER TABLE notification_templates ALTER COLUMN channels TYPE JSONB USING to_jsonb(channels);
