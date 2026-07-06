import type { Catalog, ToolCatalog } from "@/lib/catalog";

function mergeUniqueBy<T>(base: T[], incoming: T[], keyFn: (item: T) => string) {
  const seen = new Set(base.map((item) => keyFn(item)));
  for (const item of incoming) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    base.push(item);
    seen.add(key);
  }
}

function mergeSeedTool(target: ToolCatalog, seed: ToolCatalog) {
  if (seed.subtitle?.trim()) {
    target.subtitle = seed.subtitle;
  }

  if (seed.officialDocs?.length) {
    const docs = new Set(target.officialDocs || []);
    for (const doc of seed.officialDocs) docs.add(doc);
    target.officialDocs = Array.from(docs);
  }

  if (seed.keyboardShortcuts?.length) {
    if (!target.keyboardShortcuts) target.keyboardShortcuts = [];
    mergeUniqueBy(target.keyboardShortcuts, seed.keyboardShortcuts, (shortcut) => shortcut.id);
  }
}

/** Fill newer seed sections into one tool catalog (client-side API merge). */
export function mergeToolCatalogWithSeed(target: ToolCatalog, seed: ToolCatalog): ToolCatalog {
  const next: ToolCatalog = JSON.parse(JSON.stringify(target));
  mergeSeedTool(next, seed);
  return next;
}

/** Fill newer seed sections into a stored catalog snapshot (e.g. keyboard shortcuts). */
export function mergeCatalogWithSeed(target: Catalog, seed: Catalog): Catalog {
  const next: Catalog = JSON.parse(JSON.stringify(target));
  const tools = ["claude", "cursor", "copilot"] as const;

  for (const tool of tools) {
    const targetTool = next.tools[tool];
    const seedTool = seed.tools[tool];
    if (targetTool && seedTool) {
      mergeSeedTool(targetTool, seedTool);
    }
  }

  return next;
}
