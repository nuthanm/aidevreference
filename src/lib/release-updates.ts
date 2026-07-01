import type { Catalog } from "@/lib/catalog";

export type FeedToolKey = "claude" | "cursor" | "copilot";

export type FeedSummary = {
  totalNewEntries: number;
  byTool: Record<FeedToolKey, number>;
  signature: string;
  notes: string[];
  entries: Array<{
    id: string;
    source: "feed";
    type: "new" | "change" | "fix";
    title: string;
    text: string;
  }>;
};

function stableSignature(parts: string[]) {
  return parts.sort().join("||");
}

export function summarizeFeedUpdates(base: Catalog, merged: Catalog): FeedSummary {
  const tools: FeedToolKey[] = ["claude", "cursor", "copilot"];
  const byTool: Record<FeedToolKey, number> = {
    claude: 0,
    cursor: 0,
    copilot: 0,
  };

  const signatureParts: string[] = [];
  const notes: string[] = [];
  const entries: FeedSummary["entries"] = [];
  let totalNewEntries = 0;

  for (const tool of tools) {
    const baseCommandKeys = new Set(
      base.tools[tool].groups.flatMap((g) => g.entries.map((e) => `${e.cmd}|${e.name}`)),
    );
    const mergedCommandEntries = merged.tools[tool].groups.flatMap((g) => g.entries);

    const newCommandEntries = mergedCommandEntries.filter(
      (e) => !baseCommandKeys.has(`${e.cmd}|${e.name}`),
    );

    const skillsDelta = Math.max(
      0,
      (merged.tools[tool].skills?.length || 0) - (base.tools[tool].skills?.length || 0),
    );
    const agentsDelta = Math.max(
      0,
      (merged.tools[tool].agents?.length || 0) - (base.tools[tool].agents?.length || 0),
    );
    const hooksDelta = Math.max(
      0,
      (merged.tools[tool].hooks?.length || 0) - (base.tools[tool].hooks?.length || 0),
    );

    const toolCount = newCommandEntries.length + skillsDelta + agentsDelta + hooksDelta;
    byTool[tool] = toolCount;
    totalNewEntries += toolCount;

    if (toolCount > 0) {
      const titleTool = tool[0].toUpperCase() + tool.slice(1);
      const newCommandNames = newCommandEntries.slice(0, 3).map((entry) => entry.name).join(", ");
      const detail = [
        newCommandEntries.length ? `${newCommandEntries.length} commands` : "",
        skillsDelta ? `${skillsDelta} skills` : "",
        agentsDelta ? `${agentsDelta} agents` : "",
        hooksDelta ? `${hooksDelta} hooks` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      notes.push(`${titleTool}: ${detail}`);
      entries.push({
        id: `feed-${tool}-${toolCount}`,
        source: "feed",
        type: "change",
        title: `${titleTool} feed update`,
        text: newCommandNames
          ? `${detail}. Highlights: ${newCommandNames}.`
          : `${detail}.`,
      });

      signatureParts.push(
        ...newCommandEntries.map((entry) => `${tool}|cmd|${entry.cmd}|${entry.name}`),
      );

      if (skillsDelta > 0) signatureParts.push(`${tool}|skills|${merged.tools[tool].skills?.length || 0}`);
      if (agentsDelta > 0) signatureParts.push(`${tool}|agents|${merged.tools[tool].agents?.length || 0}`);
      if (hooksDelta > 0) signatureParts.push(`${tool}|hooks|${merged.tools[tool].hooks?.length || 0}`);
    }
  }

  if (!entries.length) {
    entries.push({
      id: "feed-none",
      source: "feed",
      type: "fix",
      title: "Feed status",
      text: "No new feed entries detected compared with base catalog.",
    });
  }

  return {
    totalNewEntries,
    byTool,
    signature: stableSignature(signatureParts),
    notes: notes.length ? notes : ["No new feed entries detected."],
    entries,
  };
}
