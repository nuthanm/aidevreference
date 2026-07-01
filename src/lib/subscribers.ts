import { randomBytes } from "node:crypto";
import postgres, { type Sql } from "postgres";

export type SubscriberRecord = {
  email: string;
  confirmed: boolean;
  createdAt: string;
  confirmedAt?: string;
  confirmToken?: string;
  confirmExpiresAt?: string;
  unsubscribeToken: string;
};

const CONFIRM_TOKEN_HOURS = 48;
const SUBSCRIBERS_TABLE = "subscribers";
const BROADCAST_STATE_TABLE = "release_broadcast_state";
const BROADCAST_STATE_ID = "release-feed";

declare global {
  var __aidevrefSql: Sql | undefined;
  var __aidevrefSubscribersTableReady: boolean | undefined;
  var __aidevrefBroadcastStateTableReady: boolean | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function createToken(size = 24) {
  return randomBytes(size).toString("hex");
}

function getSqlClient() {
  const connection = process.env.DATABASE_URL?.trim();
  if (!connection) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__aidevrefSql) {
    globalThis.__aidevrefSql = postgres(connection, {
      ssl: "require",
      max: 1,
      prepare: false,
    });
  }

  return globalThis.__aidevrefSql;
}

async function ensureSubscribersTable() {
  if (globalThis.__aidevrefSubscribersTableReady) {
    return;
  }

  const sql = getSqlClient();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${SUBSCRIBERS_TABLE} (
      email TEXT PRIMARY KEY,
      confirmed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ NULL,
      confirm_token TEXT NULL,
      confirm_expires_at TIMESTAMPTZ NULL,
      unsubscribe_token TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token_idx ON ${SUBSCRIBERS_TABLE} (confirm_token) WHERE confirm_token IS NOT NULL;`,
  );
  await sql.unsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_idx ON ${SUBSCRIBERS_TABLE} (unsubscribe_token);`,
  );

  globalThis.__aidevrefSubscribersTableReady = true;
}

async function ensureBroadcastStateTable() {
  if (globalThis.__aidevrefBroadcastStateTableReady) {
    return;
  }

  const sql = getSqlClient();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${BROADCAST_STATE_TABLE} (
      id TEXT PRIMARY KEY,
      last_feed_signature TEXT NOT NULL,
      last_feed_total INTEGER NOT NULL DEFAULT 0,
      last_version TEXT NOT NULL,
      last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  globalThis.__aidevrefBroadcastStateTableReady = true;
}

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

type SubscriberRow = {
  email: string;
  confirmed: boolean;
  created_at: string | Date;
  confirmed_at: string | Date | null;
  confirm_token: string | null;
  confirm_expires_at: string | Date | null;
  unsubscribe_token: string;
};

type BroadcastStateRow = {
  last_feed_signature: string;
  last_feed_total: number;
  last_version: string;
  last_sent_at: string | Date;
};

export type BroadcastStateRecord = {
  lastFeedSignature: string;
  lastFeedTotal: number;
  lastVersion: string;
  lastSentAt: string;
};

function fromRow(row: SubscriberRow): SubscriberRecord {
  return {
    email: row.email,
    confirmed: Boolean(row.confirmed),
    createdAt: toIsoString(row.created_at) || nowIso(),
    confirmedAt: toIsoString(row.confirmed_at),
    confirmToken: row.confirm_token || undefined,
    confirmExpiresAt: toIsoString(row.confirm_expires_at),
    unsubscribeToken: row.unsubscribe_token,
  };
}

function broadcastStateFromRow(row: BroadcastStateRow): BroadcastStateRecord {
  return {
    lastFeedSignature: row.last_feed_signature,
    lastFeedTotal: Number(row.last_feed_total || 0),
    lastVersion: row.last_version,
    lastSentAt: toIsoString(row.last_sent_at) || nowIso(),
  };
}

function dedupeByEmail(records: SubscriberRecord[]) {
  const map = new Map<string, SubscriberRecord>();
  for (const record of records) {
    map.set(record.email, record);
  }
  return Array.from(map.values());
}

export async function readSubscribers(): Promise<SubscriberRecord[]> {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const rows = await sql<SubscriberRow[]>`
    SELECT
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token
    FROM subscribers
    ORDER BY created_at DESC
  `;
  return rows.map(fromRow);
}

export async function writeSubscribers(records: SubscriberRecord[]) {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const deduped = dedupeByEmail(records);

  await sql.begin(async (tx) => {
    await tx`DELETE FROM subscribers`;
    for (const record of deduped) {
      await tx`
        INSERT INTO subscribers (
          email,
          confirmed,
          created_at,
          confirmed_at,
          confirm_token,
          confirm_expires_at,
          unsubscribe_token,
          updated_at
        )
        VALUES (
          ${record.email},
          ${record.confirmed},
          ${record.createdAt},
          ${record.confirmedAt ?? null},
          ${record.confirmToken ?? null},
          ${record.confirmExpiresAt ?? null},
          ${record.unsubscribeToken},
          NOW()
        )
      `;
    }
  });
}

export async function getSubscriberByEmailStored(email: string) {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const safeEmail = email.toLowerCase();
  const rows = await sql<SubscriberRow[]>`
    SELECT
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token
    FROM subscribers
    WHERE email = ${safeEmail}
    LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getSubscriberByConfirmTokenStored(token: string) {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const rows = await sql<SubscriberRow[]>`
    SELECT
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token
    FROM subscribers
    WHERE confirm_token = ${token}
    LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getSubscriberByUnsubscribeTokenStored(token: string) {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const rows = await sql<SubscriberRow[]>`
    SELECT
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token
    FROM subscribers
    WHERE unsubscribe_token = ${token}
    LIMIT 1
  `;
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function upsertSubscriber(record: SubscriberRecord) {
  await ensureSubscribersTable();
  const sql = getSqlClient();

  await sql`
    INSERT INTO subscribers (
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token,
      updated_at
    )
    VALUES (
      ${record.email},
      ${record.confirmed},
      ${record.createdAt},
      ${record.confirmedAt ?? null},
      ${record.confirmToken ?? null},
      ${record.confirmExpiresAt ?? null},
      ${record.unsubscribeToken},
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      confirmed = EXCLUDED.confirmed,
      created_at = EXCLUDED.created_at,
      confirmed_at = EXCLUDED.confirmed_at,
      confirm_token = EXCLUDED.confirm_token,
      confirm_expires_at = EXCLUDED.confirm_expires_at,
      unsubscribe_token = EXCLUDED.unsubscribe_token,
      updated_at = NOW()
  `;
}

export async function deleteSubscriberByUnsubscribeToken(token: string) {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  await sql`DELETE FROM subscribers WHERE unsubscribe_token = ${token}`;
}

export async function readConfirmedSubscribers() {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const rows = await sql<SubscriberRow[]>`
    SELECT
      email,
      confirmed,
      created_at,
      confirmed_at,
      confirm_token,
      confirm_expires_at,
      unsubscribe_token
    FROM subscribers
    WHERE confirmed = TRUE
    ORDER BY created_at DESC
  `;
  return rows.map(fromRow);
}

export async function getSubscriberStats() {
  await ensureSubscribersTable();
  const sql = getSqlClient();
  const rows = await sql<{ total: string; confirmed: string }[]>`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE confirmed = TRUE)::text AS confirmed
    FROM subscribers
  `;
  const total = Number(rows[0]?.total || 0);
  const confirmed = Number(rows[0]?.confirmed || 0);
  return {
    confirmed,
    pending: total - confirmed,
    total,
  };
}

export async function getBroadcastStateStored() {
  await ensureBroadcastStateTable();
  const sql = getSqlClient();
  const rows = await sql<BroadcastStateRow[]>`
    SELECT
      last_feed_signature,
      last_feed_total,
      last_version,
      last_sent_at
    FROM release_broadcast_state
    WHERE id = ${BROADCAST_STATE_ID}
    LIMIT 1
  `;

  return rows[0] ? broadcastStateFromRow(rows[0]) : undefined;
}

export async function upsertBroadcastStateStored(input: {
  feedSignature: string;
  feedTotal: number;
  version: string;
}) {
  await ensureBroadcastStateTable();
  const sql = getSqlClient();

  await sql`
    INSERT INTO release_broadcast_state (
      id,
      last_feed_signature,
      last_feed_total,
      last_version,
      last_sent_at,
      updated_at
    )
    VALUES (
      ${BROADCAST_STATE_ID},
      ${input.feedSignature},
      ${input.feedTotal},
      ${input.version},
      NOW(),
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      last_feed_signature = EXCLUDED.last_feed_signature,
      last_feed_total = EXCLUDED.last_feed_total,
      last_version = EXCLUDED.last_version,
      last_sent_at = NOW(),
      updated_at = NOW()
  `;

  return getBroadcastStateStored();
}

export function getSubscriberByEmail(records: SubscriberRecord[], email: string) {
  const safeEmail = email.toLowerCase();
  return records.find((record) => record.email === safeEmail);
}

export function getSubscriberByConfirmToken(records: SubscriberRecord[], token: string) {
  return records.find((record) => record.confirmToken === token);
}

export function getSubscriberByUnsubscribeToken(records: SubscriberRecord[], token: string) {
  return records.find((record) => record.unsubscribeToken === token);
}

export function createPendingSubscriber(email: string): SubscriberRecord {
  const createdAt = nowIso();
  const expires = new Date(Date.now() + CONFIRM_TOKEN_HOURS * 60 * 60 * 1000).toISOString();
  return {
    email: email.toLowerCase(),
    confirmed: false,
    createdAt,
    confirmToken: createToken(),
    confirmExpiresAt: expires,
    unsubscribeToken: createToken(),
  };
}

export function refreshConfirmToken(record: SubscriberRecord): SubscriberRecord {
  const expires = new Date(Date.now() + CONFIRM_TOKEN_HOURS * 60 * 60 * 1000).toISOString();
  return {
    ...record,
    confirmToken: createToken(),
    confirmExpiresAt: expires,
  };
}

export function confirmSubscriber(record: SubscriberRecord): SubscriberRecord {
  return {
    ...record,
    confirmed: true,
    confirmedAt: nowIso(),
    confirmToken: undefined,
    confirmExpiresAt: undefined,
  };
}

export function isConfirmTokenExpired(record: SubscriberRecord) {
  if (!record.confirmExpiresAt) {
    return true;
  }
  const expiry = Date.parse(record.confirmExpiresAt);
  if (Number.isNaN(expiry)) {
    return true;
  }
  return Date.now() > expiry;
}
