"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./release-notes-table.module.css";

type ToolKey = "claude" | "cursor" | "copilot";
type UpdateKind = "command" | "skill" | "agent" | "hook";

type CatalogEntry = {
  key: string;
  tool: ToolKey;
  kind: UpdateKind;
  title: string;
  details: string;
};

type CatalogShape = {
  tools: {
    claude: {
      groups: Array<{ id: string; label?: string; entries: Array<{ cmd: string; name: string; desc?: string }> }>;
      skills?: Array<{ cmd: string; name: string; desc?: string }>;
      agents?: Array<{ name: string; desc?: string }>;
      hooks?: Array<{ cmd: string; name: string; desc?: string }>;
    };
    cursor: {
      groups: Array<{ id: string; label?: string; entries: Array<{ cmd: string; name: string; desc?: string }> }>;
      skills?: Array<{ cmd: string; name: string; desc?: string }>;
      agents?: Array<{ name: string; desc?: string }>;
      hooks?: Array<{ cmd: string; name: string; desc?: string }>;
    };
    copilot: {
      groups: Array<{ id: string; label?: string; entries: Array<{ cmd: string; name: string; desc?: string }> }>;
      skills?: Array<{ cmd: string; name: string; desc?: string }>;
      agents?: Array<{ name: string; desc?: string }>;
      hooks?: Array<{ cmd: string; name: string; desc?: string }>;
    };
  };
};

const PAGE_SIZE = 12;
const SEEN_KEY = "aidevref-catalog-seen-keys-v1";

function normalize(text?: string) {
  return (text || "").trim();
}

function flattenCatalogUpdates(catalog: CatalogShape): CatalogEntry[] {
  const out: CatalogEntry[] = [];

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = catalog.tools[tool];

    for (const group of conf.groups || []) {
      for (const entry of group.entries || []) {
        out.push({
          key: `${tool}|command|${group.id}|${entry.cmd}|${entry.name}`,
          tool,
          kind: "command",
          title: `${entry.cmd} ${entry.name}`.trim(),
          details: normalize(entry.desc) || "Command entry",
        });
      }
    }

    for (const skill of conf.skills || []) {
      out.push({
        key: `${tool}|skill|${skill.cmd}|${skill.name}`,
        tool,
        kind: "skill",
        title: `${skill.cmd} ${skill.name}`.trim(),
        details: normalize(skill.desc) || "Skill entry",
      });
    }

    for (const agent of conf.agents || []) {
      out.push({
        key: `${tool}|agent|${agent.name}`,
        tool,
        kind: "agent",
        title: agent.name,
        details: normalize(agent.desc) || "Agent entry",
      });
    }

    for (const hook of conf.hooks || []) {
      out.push({
        key: `${tool}|hook|${hook.cmd}|${hook.name}`,
        tool,
        kind: "hook",
        title: `${hook.cmd} ${hook.name}`.trim(),
        details: normalize(hook.desc) || "Hook entry",
      });
    }
  }

  return out;
}

export function ReleaseNotesTable() {
  const [allUpdates, setAllUpdates] = useState<CatalogEntry[]>([]);
  const [newUpdates, setNewUpdates] = useState<CatalogEntry[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) {
          setAllUpdates([]);
          setNewUpdates([]);
          return;
        }

        const catalog = (await res.json()) as CatalogShape;
        if (!catalog?.tools) {
          setAllUpdates([]);
          setNewUpdates([]);
          return;
        }

        const updates = flattenCatalogUpdates(catalog);
        const currentKeys = updates.map((item) => item.key);

        let seenKeys = new Set<string>();
        try {
          const raw = localStorage.getItem(SEEN_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as string[];
            seenKeys = new Set(Array.isArray(parsed) ? parsed : []);
          }
        } catch {
          seenKeys = new Set<string>();
        }

        const unseen = updates.filter((item) => !seenKeys.has(item.key));

        if (!seenKeys.size) {
          localStorage.setItem(SEEN_KEY, JSON.stringify(currentKeys));
          setNewUpdates([]);
        } else {
          setNewUpdates(unseen);
          localStorage.setItem(SEEN_KEY, JSON.stringify(currentKeys));
        }

        setAllUpdates(updates);
      } catch {
        setAllUpdates([]);
        setNewUpdates([]);
      }
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil(newUpdates.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return newUpdates.slice(start, start + PAGE_SIZE);
  }, [newUpdates, page]);

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Catalog Updates</h1>
            <p className={styles.subtitle}>Only newly added catalog items are listed here. No release history.</p>
          </div>
          <div className={styles.badge}>{newUpdates.length} new</div>
        </div>

        <div className={styles.metaSummary}>
          Total catalog items: {allUpdates.length}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Updated/Inserted Item</th>
                <th>Tool</th>
                <th>Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length ? visibleRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.title}</td>
                  <td><span className={styles.metaRow}>{row.tool.toUpperCase()}</span></td>
                  <td>{row.kind}</td>
                  <td>{row.details}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    No new catalog updates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
