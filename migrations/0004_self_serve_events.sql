CREATE TABLE IF NOT EXISTS self_serve_events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_self_serve_events_name_created
  ON self_serve_events (event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_self_serve_events_job_created
  ON self_serve_events (job_id, created_at);
