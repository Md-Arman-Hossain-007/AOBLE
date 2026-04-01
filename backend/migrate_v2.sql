-- Migration v2: OpenSanctions Schema Implementation

-- TABLE 1: os_sources
CREATE TABLE IF NOT EXISTS os_sources (
    identifier          TEXT PRIMARY KEY,
    title               TEXT NOT NULL,
    publisher           TEXT,
    publisher_country   TEXT,
    source_url          TEXT,
    frequency           TEXT,
    entity_count        INTEGER,
    type                TEXT
);

CREATE INDEX IF NOT EXISTS idx_sources_country ON os_sources (publisher_country);
CREATE INDEX IF NOT EXISTS idx_sources_type    ON os_sources (type);

-- TABLE 2: os_entities
CREATE TABLE IF NOT EXISTS os_entities (
    id              TEXT PRIMARY KEY,
    schema          TEXT NOT NULL,
    caption         TEXT,
    datasets        TEXT[], -- Stored as text array if supported, else handles differently in SQL
    topics          TEXT[],
    properties      JSONB NOT NULL,
    referents       TEXT[],
    first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_entities_schema   ON os_entities (schema);
CREATE INDEX IF NOT EXISTS idx_entities_topics   ON os_entities USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_entities_datasets ON os_entities USING GIN (datasets);
CREATE INDEX IF NOT EXISTS idx_entities_active   ON os_entities (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_entities_props    ON os_entities USING GIN (properties jsonb_path_ops);

-- TABLE 3: os_entity_names
CREATE TABLE IF NOT EXISTS os_entity_names (
    id          SERIAL PRIMARY KEY,
    entity_id   TEXT NOT NULL REFERENCES os_entities(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    lang        TEXT
);

CREATE INDEX IF NOT EXISTS idx_names_entity   ON os_entity_names (entity_id);
CREATE INDEX IF NOT EXISTS idx_names_prefix   ON os_entity_names (name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_names_lower    ON os_entity_names (lower(name));

-- TABLE 4: os_profiles
CREATE TABLE IF NOT EXISTS os_profiles (
    id              TEXT PRIMARY KEY,
    schema          TEXT NOT NULL,
    caption         TEXT,
    topics          TEXT[],
    datasets        TEXT[],
    names           TEXT[],
    birth_dates     TEXT[],
    nationalities   TEXT[],
    countries       TEXT[],
    id_numbers      TEXT[],
    positions       TEXT[],
    full_profile    JSONB NOT NULL,
    first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_profiles_schema      ON os_profiles (schema);
CREATE INDEX IF NOT EXISTS idx_profiles_topics      ON os_profiles USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_profiles_datasets    ON os_profiles USING GIN (datasets);
CREATE INDEX IF NOT EXISTS idx_profiles_names       ON os_profiles USING GIN (names);
CREATE INDEX IF NOT EXISTS idx_profiles_nations     ON os_profiles USING GIN (nationalities);
CREATE INDEX IF NOT EXISTS idx_profiles_caption     ON os_profiles (lower(caption));
CREATE INDEX IF NOT EXISTS idx_profiles_active      ON os_profiles (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_full        ON os_profiles USING GIN (full_profile jsonb_path_ops);

-- TABLE 5: os_import_runs
CREATE TABLE IF NOT EXISTS os_import_runs (
    run_id              SERIAL PRIMARY KEY,
    imported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dataset_version     TEXT,
    file_imported       TEXT,
    total_processed     INTEGER,
    added               INTEGER,
    updated             INTEGER,
    removed             INTEGER,
    skipped             INTEGER,
    duration_seconds    INTEGER,
    error               TEXT
);

-- TABLE 6: screening_results
CREATE TABLE IF NOT EXISTS screening_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_ref        TEXT NOT NULL,
    customer_name       TEXT NOT NULL,
    schema_type         TEXT NOT NULL DEFAULT 'Person',
    query_payload       JSONB NOT NULL,
    match_count         INTEGER NOT NULL DEFAULT 0,
    top_score           FLOAT,
    top_match_id        TEXT,
    top_match_caption   TEXT,
    top_match_datasets  TEXT[],
    top_match_topics    TEXT[],
    all_matches         JSONB,
    risk_level          TEXT NOT NULL DEFAULT 'LOW',
    auto_decision       TEXT NOT NULL DEFAULT 'clear',
    status              TEXT NOT NULL DEFAULT 'pending',
    final_decision      TEXT,
    reviewed_by         TEXT,
    reviewed_at         TIMESTAMPTZ,
    notes               TEXT,
    screened_by         TEXT,
    screening_reason    TEXT,
    ip_address          TEXT
);

CREATE INDEX IF NOT EXISTS idx_screen_customer    ON screening_results (customer_ref);
CREATE INDEX IF NOT EXISTS idx_screen_at          ON screening_results (screened_at DESC);
CREATE INDEX IF NOT EXISTS idx_screen_risk        ON screening_results (risk_level);
CREATE INDEX IF NOT EXISTS idx_screen_status      ON screening_results (status);
CREATE INDEX IF NOT EXISTS idx_screen_top_score   ON screening_results (top_score DESC);
CREATE INDEX IF NOT EXISTS idx_screen_top_match   ON screening_results (top_match_id);
CREATE INDEX IF NOT EXISTS idx_screen_decision    ON screening_results (final_decision);
