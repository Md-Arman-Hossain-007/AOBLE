-- Migration V3: Bulk Screening Enhancements
-- Adds batch tracking to results and detailed status to bulk jobs

-- 1. Update screening_results table
ALTER TABLE screening_results ADD COLUMN IF NOT EXISTS batch_id VARCHAR;
CREATE INDEX IF NOT EXISTS idx_screening_results_batch_id ON screening_results(batch_id);

-- 2. Update bulk_jobs table
ALTER TABLE bulk_jobs ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE bulk_jobs ADD COLUMN IF NOT EXISTS results_summary JSONB;
ALTER TABLE bulk_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- 3. Ensure JSONB is used for results_summary if it was previously JSON
-- (PostgreSQL specific check, usually handles conversion well if type matches)
-- If current type is JSON, we might need:
-- ALTER TABLE bulk_jobs ALTER COLUMN results_summary TYPE JSONB USING results_summary::JSONB;
