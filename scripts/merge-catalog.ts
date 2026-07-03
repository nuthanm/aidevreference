#!/usr/bin/env npx tsx
/**
 * Merge catalog.pending.json into baseCatalog, validate entries,
 * and report duplicate detection before sync.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { baseCatalog } from "../src/lib/catalog";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pendingPath = path.join(root, "data", "catalog.pending.json");

function mergeUniqueBy<T>(base: T[], incoming: T[], keyFn: (item: T) => string) {
  const seen = new Set(base.map((item) => keyFn(item)));
  let inserted = 0;
  for (const item of incoming) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    base.push(item);
    seen.add(key);
    inserted += 1;
  }
  return inserted;
}

function mergeGroups(
  base: { id: string; label: string; entries: { cmd: string; name: string }[] }[],
  incoming: { id: string; label?: string; entries: { cmd: string; name: string }[] }[],
) {
  const groupMap = new Map(base.map((g) => [g.id, g]));
  let inserted = 0;

  for (const incomingGroup of incoming) {
    if (!incomingGroup.id || !Array.isArray(incomingGroup.entries)) continue;

    const found = groupMap.get(incomingGroup.id);
    if (!found) {
      base.push({
        id: incomingGroup.id,
        label: incomingGroup.label || incomingGroup.id,
        entries: [...incomingGroup.entries],
      });
      inserted += incomingGroup.entries.length;
      groupMap.set(incomingGroup.id, base[base.length - 1]);
      continue;
    }

    if (incomingGroup.label?.trim()) {
      found.label = incomingGroup.label;
    }
    inserted += mergeUniqueBy(
      found.entries,
      incomingGroup.entries,
      (entry) => `${entry.cmd}|${entry.name}`,
    );
  }

  return inserted;
}

function applyPendingTool(target: Record<string, unknown>, pending: Record<string, unknown> | undefined) {
  if (!pending) return { commands: 0, skills: 0, agents: 0, hooks: 0 };

  const counts = { commands: 0, skills: 0, agents: 0, hooks: 0 };

  if (Array.isArray(pending.groups) && pending.groups.length) {
    counts.commands = mergeGroups(
      target.groups as Parameters<typeof mergeGroups>[0],
      pending.groups as Parameters<typeof mergeGroups>[1],
    );
  }

  if (Array.isArray(pending.skills) && pending.skills.length) {
    if (!target.skills) target.skills = [];
    counts.skills = mergeUniqueBy(
      target.skills as { cmd: string; name: string }[],
      pending.skills as { cmd: string; name: string }[],
      (skill) => `${skill.cmd}|${skill.name}`,
    );
  }

  if (Array.isArray(pending.agents) && pending.agents.length) {
    if (!target.agents) target.agents = [];
    counts.agents = mergeUniqueBy(
      target.agents as { name: string }[],
      pending.agents as { name: string }[],
      (agent) => agent.name,
    );
  }

  if (Array.isArray(pending.hooks) && pending.hooks.length) {
    if (!target.hooks) target.hooks = [];
    counts.hooks = mergeUniqueBy(
      target.hooks as { cmd: string; name: string }[],
      pending.hooks as { cmd: string; name: string }[],
      (hook) => `${hook.cmd}|${hook.name}`,
    );
  }

  return counts;
}

function collectValidationWarnings(catalog: typeof baseCatalog) {
  const warnings: string[] = [];
  const tools = ["claude", "cursor", "copilot"] as const;

  for (const tool of tools) {
    const conf = catalog.tools[tool];
    if (!conf) {
      warnings.push(`tools.${tool} is missing`);
      continue;
    }

    if (!conf.maker?.trim()) warnings.push(`tools.${tool}.maker is missing`);
    if (!conf.subtitle?.trim()) warnings.push(`tools.${tool}.subtitle is missing`);
    if (!Array.isArray(conf.officialDocs) || conf.officialDocs.length === 0) {
      warnings.push(`tools.${tool}.officialDocs is missing or empty`);
    }

    if (!Array.isArray(conf.groups) || conf.groups.length === 0) {
      warnings.push(`tools.${tool}.groups is missing or empty`);
      continue;
    }

    conf.groups.forEach((group, groupIndex) => {
      const groupLabel = group.id || `group-${groupIndex}`;
      if (!group.id?.trim()) warnings.push(`tools.${tool}.groups[${groupIndex}].id is missing`);
      if (!group.label?.trim()) warnings.push(`tools.${tool}.groups[${groupIndex}].label is missing`);
      if (!Array.isArray(group.entries) || group.entries.length === 0) {
        warnings.push(`tools.${tool}.groups.${groupLabel}.entries is missing or empty`);
        return;
      }

      group.entries.forEach((entry, entryIndex) => {
        if (!entry.cmd?.trim()) {
          warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].cmd is missing`);
        }
        if (!entry.name?.trim()) {
          warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].name is missing`);
        }
        if (!entry.desc?.trim()) {
          warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].desc is missing`);
        }
        if (!entry.ex?.trim()) {
          warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].ex is missing`);
        }
      });
    });
  }

  return warnings;
}

function findDuplicates(catalog: typeof baseCatalog) {
  const duplicates: { tool: string; type: string; key: string; groups?: string[] }[] = [];

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = catalog.tools[tool];

    const commandKeys = new Map<string, string>();
    for (const group of conf.groups) {
      for (const entry of group.entries) {
        const key = `${entry.cmd}|${entry.name}`;
        if (commandKeys.has(key)) {
          duplicates.push({ tool, type: "command", key, groups: [commandKeys.get(key)!, group.id] });
        } else {
          commandKeys.set(key, group.id);
        }
      }
    }

    for (const type of ["skills", "agents", "hooks"] as const) {
      const items = conf[type] || [];
      const keys = new Set<string>();
      for (const item of items) {
        const key = type === "agents" ? (item as { name: string }).name : `${(item as { cmd: string; name: string }).cmd}|${(item as { cmd: string; name: string }).name}`;
        if (keys.has(key)) {
          duplicates.push({ tool, type, key });
        } else {
          keys.add(key);
        }
      }
    }
  }

  return duplicates;
}

function countCatalog(catalog: typeof baseCatalog) {
  const summary: Record<string, { commands: number; skills: number; agents: number; hooks: number; total: number }> = {};
  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = catalog.tools[tool];
    const commands = conf.groups.reduce((sum, g) => sum + g.entries.length, 0);
    const skills = conf.skills?.length || 0;
    const agents = conf.agents?.length || 0;
    const hooks = conf.hooks?.length || 0;
    summary[tool] = { commands, skills, agents, hooks, total: commands + skills + agents + hooks };
  }
  return summary;
}

const writeBack = process.argv.includes("--write");
const pending = JSON.parse(readFileSync(pendingPath, "utf8")) as {
  tools?: Partial<Record<"claude" | "cursor" | "copilot", Record<string, unknown>>>;
};
const merged = JSON.parse(JSON.stringify(baseCatalog)) as typeof baseCatalog;

const inserted: Record<string, ReturnType<typeof applyPendingTool>> = {};
for (const tool of ["claude", "cursor", "copilot"] as const) {
  inserted[tool] = applyPendingTool(
    merged.tools[tool] as unknown as Record<string, unknown>,
    pending.tools?.[tool],
  );
}

const warnings = collectValidationWarnings(merged);
const duplicates = findDuplicates(merged);
const summary = countCatalog(merged);

console.log("=== Catalog Merge Report ===\n");
console.log("Inserted from pending:");
for (const tool of ["claude", "cursor", "copilot"] as const) {
  const c = inserted[tool];
  console.log(`  ${tool}: ${c.commands} commands, ${c.skills} skills, ${c.agents} agents, ${c.hooks} hooks`);
}

console.log("\nFinal catalog totals:");
for (const tool of ["claude", "cursor", "copilot"] as const) {
  const s = summary[tool];
  console.log(`  ${tool}: ${s.commands} commands, ${s.skills} skills, ${s.agents} agents, ${s.hooks} hooks (${s.total} total)`);
}

console.log(`\nValidation warnings: ${warnings.length}`);
warnings.forEach((w) => console.log(`  - ${w}`));

console.log(`\nDuplicates found: ${duplicates.length}`);
duplicates.forEach((d) => console.log(`  - ${d.tool} ${d.type}: ${d.key}${d.groups ? ` in groups ${d.groups.join(", ")}` : ""}`));

if (duplicates.length) {
  process.exit(1);
}

if (writeBack) {
  const exportPath = path.join(root, "data", "catalog.merged.json");
  writeFileSync(exportPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`\nWrote merged catalog to ${exportPath}`);
}

console.log("\nMerge validation passed.");
