import type { Catalog } from "@/lib/catalog";

export type CatalogUpdateRow = {
  key: string;
  tool: "claude" | "cursor" | "copilot";
  kind: "command" | "skill" | "agent" | "hook";
  title: string;
  details: string;
};

export type ReleaseLogEntry = CatalogUpdateRow & {
  addedAt: string;
};

const SEEN_KEY = "aidevref-catalog-seen-keys-v1";
const SNAPSHOT_KEY = "aidevref-catalog-keys-snapshot-v1";
const RELEASE_LOG_KEY = "aidevref-catalog-release-log-v1";
const MAX_LOG_ENTRIES = 100;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function extractCatalogRows(tools: Catalog["tools"]): CatalogUpdateRow[] {
  const rows: CatalogUpdateRow[] = [];

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = tools[tool];

    for (const group of conf.groups) {
      for (const entry of group.entries) {
        rows.push({
          key: `${tool}|command|${group.id}|${entry.cmd}|${entry.name}`,
          tool,
          kind: "command",
          title: `${entry.cmd} ${entry.name}`.trim(),
          details: entry.desc || "Command entry",
        });
      }
    }

    for (const skill of conf.skills || []) {
      rows.push({
        key: `${tool}|skill|${skill.cmd}|${skill.name}`,
        tool,
        kind: "skill",
        title: `${skill.cmd} ${skill.name}`.trim(),
        details: skill.desc || "Skill entry",
      });
    }

    for (const agent of conf.agents || []) {
      rows.push({
        key: `${tool}|agent|${agent.name}`,
        tool,
        kind: "agent",
        title: agent.name,
        details: agent.desc || "Agent entry",
      });
    }

    for (const hook of conf.hooks || []) {
      rows.push({
        key: `${tool}|hook|${hook.cmd}|${hook.name}`,
        tool,
        kind: "hook",
        title: `${hook.cmd} ${hook.name}`.trim(),
        details: hook.desc || "Hook entry",
      });
    }
  }

  return rows;
}

export type CatalogUpdatesState = {
  badgeCount: number;
  releaseLog: ReleaseLogEntry[];
  unseenEntries: ReleaseLogEntry[];
};

export function syncCatalogUpdates(tools: Catalog["tools"]): CatalogUpdatesState {
  const rows = extractCatalogRows(tools);
  const currentKeys = rows.map((row) => row.key);

  const snapshotKeys = readJson<string[]>(SNAPSHOT_KEY, []);
  const seenKeys = new Set(readJson<string[]>(SEEN_KEY, []));
  let releaseLog = readJson<ReleaseLogEntry[]>(RELEASE_LOG_KEY, []);

  if (snapshotKeys.length === 0) {
    writeJson(SNAPSHOT_KEY, currentKeys);
    return { badgeCount: 0, releaseLog, unseenEntries: [] };
  }

  const snapshotSet = new Set(snapshotKeys);
  const newlyAdded = rows.filter((row) => !snapshotSet.has(row.key));

  if (newlyAdded.length > 0) {
    const now = new Date().toISOString();
    const existing = new Set(releaseLog.map((entry) => entry.key));

    for (const row of newlyAdded) {
      if (existing.has(row.key)) continue;
      releaseLog.unshift({ ...row, addedAt: now });
      existing.add(row.key);
    }

    releaseLog = releaseLog.slice(0, MAX_LOG_ENTRIES);
    writeJson(RELEASE_LOG_KEY, releaseLog);
    writeJson(SNAPSHOT_KEY, currentKeys);
  } else if (currentKeys.length !== snapshotKeys.length) {
    writeJson(SNAPSHOT_KEY, currentKeys);
  }

  const unseenEntries = releaseLog.filter((entry) => !seenKeys.has(entry.key));

  return {
    badgeCount: unseenEntries.length,
    releaseLog,
    unseenEntries,
  };
}

export function markCatalogUpdatesReviewed(keys: string[]) {
  const seenKeys = new Set(readJson<string[]>(SEEN_KEY, []));
  for (const key of keys) {
    seenKeys.add(key);
  }
  writeJson(SEEN_KEY, [...seenKeys]);
}

export function markAllUnseenReviewed(unseenKeys: string[]) {
  markCatalogUpdatesReviewed(unseenKeys);
}
