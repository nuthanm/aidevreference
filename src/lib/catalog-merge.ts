import type {
  AgentEntry,
  Catalog,
  CommandEntry,
  Group,
  HookEntry,
  SkillEntry,
  ToolCatalog,
} from "@/lib/catalog";

function mergeUniqueBy<T>(base: T[], incoming: T[], keyFn: (item: T) => string) {
  const seen = new Set(base.map((item) => keyFn(item)));
  for (const item of incoming) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    base.push(item);
    seen.add(key);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function commandEntryKey(entry: CommandEntry) {
  return entry.cmd.trim();
}

function mergeCommandEntries(seedEntries: CommandEntry[], targetEntries: CommandEntry[]) {
  const seedKeys = new Set(seedEntries.map(commandEntryKey));
  const merged = clone(seedEntries);
  for (const entry of targetEntries) {
    if (!seedKeys.has(commandEntryKey(entry))) {
      merged.push(clone(entry));
    }
  }
  return merged;
}

function mergeGroups(seedGroups: Group[], targetGroups: Group[]) {
  const targetById = new Map(targetGroups.map((group) => [group.id, group]));
  const merged: Group[] = [];

  for (const seedGroup of seedGroups) {
    const targetGroup = targetById.get(seedGroup.id);
    merged.push({
      id: seedGroup.id,
      label: seedGroup.label || targetGroup?.label || seedGroup.id,
      entries: mergeCommandEntries(seedGroup.entries, targetGroup?.entries ?? []),
    });
    targetById.delete(seedGroup.id);
  }

  for (const remaining of targetById.values()) {
    merged.push(clone(remaining));
  }

  return merged;
}

function mergeSeedEntries<T>(seedItems: T[], targetItems: T[], keyFn: (item: T) => string) {
  const seedKeys = new Set(seedItems.map(keyFn));
  const merged = clone(seedItems);
  for (const item of targetItems) {
    if (!seedKeys.has(keyFn(item))) {
      merged.push(clone(item));
    }
  }
  return merged;
}

function mergeSeedTool(target: ToolCatalog, seed: ToolCatalog) {
  if (seed.maker?.trim()) {
    target.maker = seed.maker;
  }

  if (seed.subtitle?.trim()) {
    target.subtitle = seed.subtitle;
  }

  if (seed.officialDocs?.length) {
    const docs = new Set(target.officialDocs || []);
    for (const doc of seed.officialDocs) docs.add(doc);
    target.officialDocs = Array.from(docs);
  }

  if (seed.groups?.length) {
    target.groups = mergeGroups(seed.groups, target.groups ?? []);
  }

  if (seed.skills?.length) {
    target.skills = mergeSeedEntries<SkillEntry>(
      seed.skills,
      target.skills ?? [],
      (skill) => skill.cmd.trim(),
    );
  }

  if (seed.agents?.length) {
    target.agents = mergeSeedEntries<AgentEntry>(
      seed.agents,
      target.agents ?? [],
      (agent) => agent.name.trim(),
    );
  }

  if (seed.hooks?.length) {
    target.hooks = mergeSeedEntries<HookEntry>(
      seed.hooks,
      target.hooks ?? [],
      (hook) => hook.cmd.trim(),
    );
  }

  if (seed.keyboardShortcuts?.length) {
    if (!target.keyboardShortcuts) target.keyboardShortcuts = [];
    mergeUniqueBy(target.keyboardShortcuts, seed.keyboardShortcuts, (shortcut) => shortcut.id);
  }
}

/** Fill newer seed sections into one tool catalog (client-side API merge). */
export function mergeToolCatalogWithSeed(target: ToolCatalog, seed: ToolCatalog): ToolCatalog {
  const next: ToolCatalog = clone(target);
  mergeSeedTool(next, seed);
  return next;
}

/** Fill newer seed sections into a stored catalog snapshot. Seed wins for curated entries; feed-only rows are kept. */
export function mergeCatalogWithSeed(target: Catalog, seed: Catalog): Catalog {
  const next: Catalog = clone(target);
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
