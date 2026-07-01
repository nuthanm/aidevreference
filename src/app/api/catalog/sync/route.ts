import { NextRequest, NextResponse } from "next/server";
import { applyPendingEntriesToCatalog, clearPendingCatalogEntries } from "@/lib/catalog-sync";
import { baseCatalog, collectCatalogValidationWarnings } from "@/lib/catalog";
import { getCatalogSnapshotStored, upsertCatalogSnapshotStored } from "@/lib/catalog-store";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const adminKey = process.env.ADMIN_BROADCAST_KEY?.trim();
  if (!adminKey) {
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("x-admin-key") === adminKey;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await getCatalogSnapshotStored();
    const current = snapshot?.catalog?.tools ? snapshot.catalog : baseCatalog;

    const applied = await applyPendingEntriesToCatalog(current);
    if (applied.insertedTotal === 0) {
      return NextResponse.json({
        ok: true,
        updated: false,
        inserted: applied.inserted,
        insertedTotal: 0,
        message: "No new pending catalog entries found.",
      });
    }

    const nextCatalog = {
      ...applied.catalog,
      generatedAt: new Date().toISOString(),
      sourceFeeds: ["database-snapshot"],
    };

    const saved = await upsertCatalogSnapshotStored(nextCatalog, true);
    await clearPendingCatalogEntries();

    const warnings = collectCatalogValidationWarnings(nextCatalog);

    return NextResponse.json({
      ok: true,
      updated: true,
      inserted: applied.inserted,
      insertedTotal: applied.insertedTotal,
      snapshotVersion: saved?.version || null,
      snapshotUpdatedAt: saved?.updatedAt || null,
      diagnostics: {
        validationWarnings: warnings,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to sync catalog entries" }, { status: 500 });
  }
}