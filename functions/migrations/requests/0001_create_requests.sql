CREATE TABLE requests (
  request_id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('inquiry', 'order')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE request_notifications (
  request_id TEXT NOT NULL REFERENCES requests(request_id),
  audience TEXT NOT NULL CHECK (audience IN ('owner', 'customer')),
  message_json TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT (unixepoch()),
  accepted_at INTEGER,
  provider_id TEXT,
  last_error TEXT,
  PRIMARY KEY (request_id, audience)
);

CREATE INDEX request_notifications_pending
  ON request_notifications (next_attempt_at)
  WHERE accepted_at IS NULL;
