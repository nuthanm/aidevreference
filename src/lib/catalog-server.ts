import { getCatalogSnapshotStored } from "@/lib/catalog-store";
import { baseCatalog, collectCatalogValidationWarnings, type Catalog } from "@/lib/catalog";

export async function getMergedCatalog(): Promise<Catalog> {
  const fallback: Catalog = JSON.parse(JSON.stringify(baseCatalog));

  let merged: Catalog = fallback;
  merged.sourceFeeds = ["json-seed-cache"];

  try {
    const snapshot = await getCatalogSnapshotStored();
    if (snapshot?.catalog?.tools) {
      merged = JSON.parse(JSON.stringify(snapshot.catalog)) as Catalog;
      merged.sourceFeeds = ["database-snapshot"];
    }
  } catch {
    // Fallback to in-code base catalog when DB is unavailable.
  }

  if (!merged.generatedAt) {
    merged.generatedAt = new Date().toISOString();
  }

  if (process.env.NODE_ENV !== "production") {
    const warnings = collectCatalogValidationWarnings(merged);
    if (warnings.length) {
      console.warn("[catalog] completeness warnings:\n- " + warnings.join("\n- "));
    }
  }

  return merged;
}
