CREATE TABLE IF NOT EXISTS feedback_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  tool TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  resolve_token TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS feedback_requests_resolve_token_idx
  ON feedback_requests (resolve_token);

CREATE INDEX IF NOT EXISTS feedback_requests_email_idx
  ON feedback_requests (email);
