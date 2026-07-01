import { createHash } from "node:crypto";
import { type Catalog } from "@/lib/catalog";
import { getMergedCatalog } from "@/lib/catalog-server";

export type CatalogBroadcastItem = {
  key: string;
  line: string;
};

function normalizeText(value: string | undefined) {
  return (value || "").trim();
}

function flattenCatalog(catalog: Catalog) {
  const items: CatalogBroadcastItem[] = [];

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = catalog.tools[tool];

    for (const group of conf.groups || []) {
      for (const entry of group.entries || []) {
        const key = `${tool}|command|${group.id}|${entry.cmd}|${entry.name}`;
        const suffix = normalizeText(entry.desc) ? ` - ${normalizeText(entry.desc)}` : "";
        const line = `${tool.toUpperCase()} command: ${entry.cmd} ${entry.name}${suffix}`;
        items.push({ key, line });
      }
    }

    for (const skill of conf.skills || []) {
      const key = `${tool}|skill|${skill.cmd}|${skill.name}`;
      const suffix = normalizeText(skill.desc) ? ` - ${normalizeText(skill.desc)}` : "";
      const line = `${tool.toUpperCase()} skill: ${skill.cmd} ${skill.name}${suffix}`;
      items.push({ key, line });
    }

    for (const agent of conf.agents || []) {
      const key = `${tool}|agent|${agent.name}`;
      const suffix = normalizeText(agent.desc) ? ` - ${normalizeText(agent.desc)}` : "";
      const line = `${tool.toUpperCase()} agent: ${agent.name}${suffix}`;
      items.push({ key, line });
    }

    for (const hook of conf.hooks || []) {
      const key = `${tool}|hook|${hook.cmd}|${hook.name}`;
      const suffix = normalizeText(hook.desc) ? ` - ${normalizeText(hook.desc)}` : "";
      const line = `${tool.toUpperCase()} hook: ${hook.cmd} ${hook.name}${suffix}`;
      items.push({ key, line });
    }
  }

  return items;
}

export async function buildCatalogBroadcastPayload(previousKeys: string[] = []) {
  const catalog = await getMergedCatalog();
  const items = flattenCatalog(catalog);
  const currentKeys = items.map((item) => item.key);
  const previousKeySet = new Set(previousKeys);

  const addedItems = items.filter((item) => !previousKeySet.has(item.key));
  const notes = addedItems.map((item) => item.line);

  const signature = createHash("sha256")
    .update(currentKeys.join("\n"))
    .digest("hex");

  const generatedDate = (catalog.generatedAt || new Date().toISOString()).slice(0, 10);
  const version = `catalog-${generatedDate}`;

  return {
    version,
    signature,
    totalKeys: currentKeys.length,
    currentKeys,
    notes,
  };
}
