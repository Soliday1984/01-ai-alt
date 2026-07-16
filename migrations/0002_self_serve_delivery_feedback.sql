ALTER TABLE self_serve_jobs ADD COLUMN first_downloaded_at TEXT;
ALTER TABLE self_serve_jobs ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE self_serve_jobs ADD COLUMN import_status TEXT;
ALTER TABLE self_serve_jobs ADD COLUMN import_feedback TEXT;
ALTER TABLE self_serve_jobs ADD COLUMN import_reported_at TEXT;
ALTER TABLE self_serve_jobs ADD COLUMN recovery_token_hash TEXT;
ALTER TABLE self_serve_jobs ADD COLUMN recovery_token_expires_at TEXT;

CREATE INDEX IF NOT EXISTS idx_self_serve_jobs_import_status
  ON self_serve_jobs (import_status);
