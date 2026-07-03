import postgres, { type Sql } from "postgres";
import type { Catalog } from "@/lib/catalog";

const CATALOG_SNAPSHOT_TABLE = "catalog_snapshots";
const ACTIVE_CATALOG_ID = "active";

declare global {
  var __aidevrefCatalogSql: Sql | undefined;
  var __aidevrefCatalogTableReady: boolean | undefined;
}

function getSqlClient() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not configured.");
  }

  let connection = raw;
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    connection = url.toString();
  } catch {
    // Use as-is.
  }

  if (!globalThis.__aidevrefCatalogSql) {
    globalThis.__aidevrefCatalogSql = postgres(connection, {
      ssl: "require",
      max: 1,
      prepare: false,
    });
  }

  return globalThis.__aidevrefCatalogSql;
}

async function ensureCatalogSnapshotTable() {
  if (globalThis.__aidevrefCatalogTableReady) {
    return;
  }

  const sql = getSqlClient();
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${CATALOG_SNAPSHOT_TABLE} (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      version BIGINT NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  globalThis.__aidevrefCatalogTableReady = true;
}

type SnapshotRow = {
  payload: Catalog;
  version: string | number;
  updated_at: string | Date;
};

export async function getCatalogSnapshotStored() {
  await ensureCatalogSnapshotTable();
  const sql = getSqlClient();

  const rows = await sql<SnapshotRow[]>`
    SELECT payload, version, updated_at
    FROM catalog_snapshots
    WHERE id = ${ACTIVE_CATALOG_ID}
    LIMIT 1
  `;

  if (!rows[0]) {
    return undefined;
  }

  return {
    catalog: rows[0].payload,
    version: Number(rows[0].version || 1),
    updatedAt: rows[0].updated_at instanceof Date ? rows[0].updated_at.toISOString() : String(rows[0].updated_at),
  };
}

export async function upsertCatalogSnapshotStored(catalog: Catalog, incrementVersion = true) {
  await ensureCatalogSnapshotTable();
  const sql = getSqlClient();

  await sql`
    INSERT INTO catalog_snapshots (id, payload, version, updated_at)
    VALUES (
      ${ACTIVE_CATALOG_ID},
      ${sql.json(catalog)},
      1,
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      payload = EXCLUDED.payload,
      version = CASE
        WHEN ${incrementVersion} THEN catalog_snapshots.version + 1
        ELSE catalog_snapshots.version
      END,
      updated_at = NOW()
  `;

  return getCatalogSnapshotStored();
}

export async function closeCatalogStore() {
  if (globalThis.__aidevrefCatalogSql) {
    await globalThis.__aidevrefCatalogSql.end({ timeout: 5 });
    globalThis.__aidevrefCatalogSql = undefined;
    globalThis.__aidevrefCatalogTableReady = undefined;
  }
}