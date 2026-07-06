const SITE_PREFIX = /^Site:\s*/i;
const COMMIT_PREFIX = /^Commit\s/;

export type ClassifiedBroadcastNotes = {
  siteItems: string[];
  catalogItems: string[];
  commitItems: string[];
};

export function classifyBroadcastNotes(notes: string[]): ClassifiedBroadcastNotes {
  const siteItems: string[] = [];
  const catalogItems: string[] = [];
  const commitItems: string[] = [];

  for (const note of notes) {
    const trimmed = note.trim();
    if (!trimmed) continue;

    if (COMMIT_PREFIX.test(trimmed)) {
      commitItems.push(trimmed);
      continue;
    }

    if (SITE_PREFIX.test(trimmed)) {
      siteItems.push(trimmed.replace(SITE_PREFIX, "").trim());
      continue;
    }

    catalogItems.push(trimmed);
  }

  return { siteItems, catalogItems, commitItems };
}

export function broadcastEmailSubtitle(notes: ClassifiedBroadcastNotes) {
  const parts: string[] = [];
  if (notes.siteItems.length) parts.push("site features");
  if (notes.catalogItems.length) parts.push("catalog updates");
  if (notes.commitItems.length) parts.push("recent pushes");

  if (!parts.length) {
    return "Catalog and references were refreshed.";
  }

  if (parts.length === 1) {
    return `New ${parts[0]}.`;
  }

  const last = parts.pop();
  return `New ${parts.join(", ")} and ${last}.`;
}
