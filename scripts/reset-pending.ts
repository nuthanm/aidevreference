#!/usr/bin/env npx tsx
/**
 * Reset data/catalog.pending.json to the empty staging template.
 * Run after catalog:seed-db when all entries are already in baseCatalog and the DB.
 */
import { clearPendingCatalogEntries } from "../src/lib/catalog-sync";

async function main() {
  await clearPendingCatalogEntries();
  console.log("Reset data/catalog.pending.json to empty staging template.");
  console.log("Commit this change if you want the repo to match.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
