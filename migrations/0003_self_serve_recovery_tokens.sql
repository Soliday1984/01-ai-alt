CREATE TABLE IF NOT EXISTS self_serve_job_recovery_tokens (
  job_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (job_id, token_hash)
);

CREATE INDEX IF NOT EXISTS idx_self_serve_job_recovery_tokens_lookup
  ON self_serve_job_recovery_tokens (job_id, expires_at);
