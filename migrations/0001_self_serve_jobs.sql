CREATE TABLE IF NOT EXISTS self_serve_jobs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  store_url TEXT,
  original_key TEXT NOT NULL,
  cleaned_key TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  checkout_session_id TEXT,
  processed_image_rows INTEGER NOT NULL DEFAULT 0,
  changed_rows INTEGER NOT NULL DEFAULT 0,
  issue_rows INTEGER NOT NULL DEFAULT 0,
  total_image_rows INTEGER NOT NULL DEFAULT 0,
  detected_products INTEGER NOT NULL DEFAULT 0,
  warnings_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_self_serve_jobs_email
  ON self_serve_jobs (email);

CREATE INDEX IF NOT EXISTS idx_self_serve_jobs_checkout_session
  ON self_serve_jobs (checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_self_serve_jobs_created_at
  ON self_serve_jobs (created_at);
