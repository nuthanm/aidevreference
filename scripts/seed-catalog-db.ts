#!/usr/bin/env npx tsx
/**
 * Seed the active catalog snapshot in PostgreSQL from baseCatalog.
 * Use for first-time production setup when pending entries are already merged.
 */
import { baseCatalog, collectCatalogValidationWarnings } from "../src/lib/catalog";
import { getCatalogSnapshotStored, upsertCatalogSnapshotStored } from "../src/lib/catalog-store";

async function main() {
  const warnings = collectCatalogValidationWarnings(baseCatalog);
  if (warnings.length) {
    console.error("Validation failed:");
    warnings.forEach((w) => console.error(`  - ${w}`));
    process.exit(1);
  }

  const existing = await getCatalogSnapshotStored();
  const catalog = {
    ...baseCatalog,
    generatedAt: new Date().toISOString(),
    sourceFeeds: ["database-snapshot"],
  };

  const saved = await upsertCatalogSnapshotStored(catalog, Boolean(existing));
  console.log("Catalog seeded to database.");
  console.log("  version:", saved?.version ?? "unknown");
  console.log("  updatedAt:", saved?.updatedAt ?? "unknown");

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = catalog.tools[tool];
    const commands = conf.groups.reduce((sum, g) => sum + g.entries.length, 0);
    console.log(
      `  ${tool}: ${commands} commands, ${conf.skills?.length ?? 0} skills, ${conf.agents?.length ?? 0} agents, ${conf.hooks?.length ?? 0} hooks`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
