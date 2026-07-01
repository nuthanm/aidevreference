CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ NULL,
  confirm_token TEXT NULL,
  confirm_expires_at TIMESTAMPTZ NULL,
  unsubscribe_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token_idx
  ON subscribers (confirm_token)
  WHERE confirm_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx
  ON subscribers (unsubscribe_token);
