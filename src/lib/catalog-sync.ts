import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AgentEntry,
  Catalog,
  Group,
  HookEntry,
  KeyboardShortcutIde,
  SkillEntry,
  ToolCatalog,
} from "@/lib/catalog";

const PENDING_FILE = path.join(process.cwd(), "data", "catalog.pending.json");

type ToolKey = "claude" | "cursor" | "copilot";

type PendingTool = {
  groups?: Group[];
  skills?: SkillEntry[];
  agents?: AgentEntry[];
  hooks?: HookEntry[];
  keyboardShortcuts?: KeyboardShortcutIde[];
};

type PendingCatalog = {
  tools?: Partial<Record<ToolKey, PendingTool>>;
};

function mergeUniqueBy<T>(base: T[], incoming: T[], keyFn: (item: T) => string) {
  const seen = new Set(base.map((item) => keyFn(item)));
  for (const item of incoming) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    base.push(item);
    seen.add(key);
  }
}

function mergeGroups(base: Group[], incoming: Group[]) {
  const groupMap = new Map(base.map((g) => [g.id, g]));

  for (const incomingGroup of incoming) {
    if (!incomingGroup.id || !Array.isArray(incomingGroup.entries)) continue;

    const found = groupMap.get(incomingGroup.id);
    if (!found) {
      base.push({
        id: incomingGroup.id,
        label: incomingGroup.label || incomingGroup.id,
        entries: [...incomingGroup.entries],
      });
      continue;
    }

    if (incomingGroup.label?.trim()) {
      found.label = incomingGroup.label;
    }
    mergeUniqueBy(found.entries, incomingGroup.entries, (entry) => `${entry.cmd}|${entry.name}`);
  }
}

function applyPendingTool(target: ToolCatalog, pending: PendingTool | undefined) {
  if (!pending) return 0;

  const beforeCount = [
    target.groups.reduce((sum, group) => sum + group.entries.length, 0),
    target.skills?.length || 0,
    target.agents?.length || 0,
    target.hooks?.length || 0,
    target.keyboardShortcuts?.length || 0,
  ].reduce((sum, n) => sum + n, 0);

  if (Array.isArray(pending.groups) && pending.groups.length) {
    mergeGroups(target.groups, pending.groups);
  }

  if (Array.isArray(pending.skills) && pending.skills.length) {
    if (!target.skills) target.skills = [];
    mergeUniqueBy(target.skills, pending.skills, (skill) => `${skill.cmd}|${skill.name}`);
  }

  if (Array.isArray(pending.agents) && pending.agents.length) {
    if (!target.agents) target.agents = [];
    mergeUniqueBy(target.agents, pending.agents, (agent) => agent.name);
  }

  if (Array.isArray(pending.hooks) && pending.hooks.length) {
    if (!target.hooks) target.hooks = [];
    mergeUniqueBy(target.hooks, pending.hooks, (hook) => `${hook.cmd}|${hook.name}`);
  }

  if (Array.isArray(pending.keyboardShortcuts) && pending.keyboardShortcuts.length) {
    if (!target.keyboardShortcuts) target.keyboardShortcuts = [];
    mergeUniqueBy(target.keyboardShortcuts, pending.keyboardShortcuts, (shortcut) => shortcut.id);
  }

  const afterCount = [
    target.groups.reduce((sum, group) => sum + group.entries.length, 0),
    target.skills?.length || 0,
    target.agents?.length || 0,
    target.hooks?.length || 0,
    target.keyboardShortcuts?.length || 0,
  ].reduce((sum, n) => sum + n, 0);

  return Math.max(0, afterCount - beforeCount);
}

function emptyPending(): PendingCatalog {
  return {
    tools: {
      claude: { groups: [], skills: [], agents: [], hooks: [], keyboardShortcuts: [] },
      cursor: { groups: [], skills: [], agents: [], hooks: [], keyboardShortcuts: [] },
      copilot: { groups: [], skills: [], agents: [], hooks: [], keyboardShortcuts: [] },
    },
  };
}

export async function readPendingCatalogEntries(): Promise<PendingCatalog> {
  try {
    const raw = await fs.readFile(PENDING_FILE, "utf8");
    const parsed = JSON.parse(raw) as PendingCatalog;
    return parsed?.tools ? parsed : emptyPending();
  } catch {
    return emptyPending();
  }
}

export async function clearPendingCatalogEntries() {
  await fs.writeFile(PENDING_FILE, `${JSON.stringify(emptyPending(), null, 2)}\n`, "utf8");
}

export async function applyPendingEntriesToCatalog(base: Catalog) {
  const pending = await readPendingCatalogEntries();
  const next: Catalog = JSON.parse(JSON.stringify(base));

  const inserted = {
    claude: applyPendingTool(next.tools.claude, pending.tools?.claude),
    cursor: applyPendingTool(next.tools.cursor, pending.tools?.cursor),
    copilot: applyPendingTool(next.tools.copilot, pending.tools?.copilot),
  };

  const insertedTotal = inserted.claude + inserted.cursor + inserted.copilot;

  return {
    catalog: next,
    inserted,
    insertedTotal,
  };
}