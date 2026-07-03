import { randomBytes } from "node:crypto";
import type { FeedbackInput } from "@/lib/validators";
import { getSqlClient } from "@/lib/subscribers";

export type FeedbackRequestRecord = {
  id: string;
  name: string;
  email: string;
  tool: FeedbackInput["tool"];
  type: string;
  message: string;
  resolveToken: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
};

const FEEDBACK_REQUESTS_TABLE = "feedback_requests";

declare global {
  var __aidevrefFeedbackRequestsTableReady: boolean | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function createToken(size = 24) {
  return randomBytes(size).toString("hex");
}

async function ensureFeedbackRequestsTable() {
  if (globalThis.__aidevrefFeedbackRequestsTableReady) {
    return;
  }

  const sql = getSqlClient();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${FEEDBACK_REQUESTS_TABLE} (
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
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS feedback_requests_resolve_token_idx ON ${FEEDBACK_REQUESTS_TABLE} (resolve_token);`,
  );
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS feedback_requests_email_idx ON ${FEEDBACK_REQUESTS_TABLE} (email);`,
  );

  globalThis.__aidevrefFeedbackRequestsTableReady = true;
}

type FeedbackRequestRow = {
  id: string;
  name: string;
  email: string;
  tool: string;
  type: string;
  message: string;
  resolve_token: string;
  resolved: boolean;
  created_at: string | Date;
  resolved_at: string | Date | null;
};

function toIsoString(value: unknown) {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function fromRow(row: FeedbackRequestRow): FeedbackRequestRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    tool: row.tool as FeedbackInput["tool"],
    type: row.type,
    message: row.message,
    resolveToken: row.resolve_token,
    resolved: Boolean(row.resolved),
    createdAt: toIsoString(row.created_at) || nowIso(),
    resolvedAt: toIsoString(row.resolved_at),
  };
}

export async function createFeedbackRequest(input: FeedbackInput): Promise<FeedbackRequestRecord> {
  await ensureFeedbackRequestsTable();
  const sql = getSqlClient();
  const record: FeedbackRequestRecord = {
    id: createToken(12),
    name: input.name,
    email: input.email.toLowerCase(),
    tool: input.tool,
    type: input.type,
    message: input.message,
    resolveToken: createToken(),
    resolved: false,
    createdAt: nowIso(),
  };

  await sql`
    INSERT INTO feedback_requests (
      id,
      name,
      email,
      tool,
      type,
      message,
      resolve_token,
      resolved,
      created_at,
      resolved_at,
      updated_at
    )
    VALUES (
      ${record.id},
      ${record.name},
      ${record.email},
      ${record.tool},
      ${record.type},
      ${record.message},
      ${record.resolveToken},
      FALSE,
      ${record.createdAt},
      NULL,
      NOW()
    )
  `;

  return record;
}

export async function getFeedbackRequestByResolveToken(token: string) {
  await ensureFeedbackRequestsTable();
  const sql = getSqlClient();
  const rows = await sql<FeedbackRequestRow[]>`
    SELECT
      id,
      name,
      email,
      tool,
      type,
      message,
      resolve_token,
      resolved,
      created_at,
      resolved_at
    FROM feedback_requests
    WHERE resolve_token = ${token}
    LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getOpenFeedbackRequestByEmail(email: string) {
  await ensureFeedbackRequestsTable();
  const sql = getSqlClient();
  const safeEmail = email.toLowerCase();
  const rows = await sql<FeedbackRequestRow[]>`
    SELECT
      id,
      name,
      email,
      tool,
      type,
      message,
      resolve_token,
      resolved,
      created_at,
      resolved_at
    FROM feedback_requests
    WHERE email = ${safeEmail}
      AND resolved = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function createBackfillFeedbackRequest(input: {
  name: string;
  email: string;
  tool: FeedbackInput["tool"];
  type: string;
  message: string;
}): Promise<FeedbackRequestRecord> {
  await ensureFeedbackRequestsTable();
  const sql = getSqlClient();
  const createdAt = nowIso();
  const record: FeedbackRequestRecord = {
    id: createToken(12),
    name: input.name,
    email: input.email.toLowerCase(),
    tool: input.tool,
    type: input.type,
    message: input.message,
    resolveToken: createToken(),
    resolved: false,
    createdAt,
  };

  await sql`
    INSERT INTO feedback_requests (
      id,
      name,
      email,
      tool,
      type,
      message,
      resolve_token,
      resolved,
      created_at,
      resolved_at,
      updated_at
    )
    VALUES (
      ${record.id},
      ${record.name},
      ${record.email},
      ${record.tool},
      ${record.type},
      ${record.message},
      ${record.resolveToken},
      FALSE,
      ${createdAt},
      NULL,
      NOW()
    )
  `;

  return record;
}

export async function markFeedbackRequestResolved(record: FeedbackRequestRecord) {
  await ensureFeedbackRequestsTable();
  const sql = getSqlClient();
  const resolvedAt = nowIso();

  await sql`
    UPDATE feedback_requests
    SET
      resolved = TRUE,
      resolved_at = ${resolvedAt},
      updated_at = NOW()
    WHERE id = ${record.id}
      AND resolved = FALSE
  `;

  return {
    ...record,
    resolved: true,
    resolvedAt,
  };
}
