"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bug,
  ChevronLeft,
  ChevronRight,
  Github,
  Home,
  LayoutGrid,
  Linkedin,
  Lightbulb,
  List,
  Menu,
  X,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ToolIcon } from "@/components/tool-icon";
import { FeedbackForm, NotifyForm } from "@/features/forms/forms";
import { useFooterTicker } from "@/hooks/use-footer-ticker";
import {
  markAllUnseenReviewed,
  syncCatalogUpdates,
  type ReleaseLogEntry,
} from "@/lib/catalog-updates-client";
import { baseCatalog, type Catalog, type Group, type ToolCatalog, type Badge } from "@/lib/catalog";
import type { AgentEntry, HookEntry, SkillEntry, CommandEntry } from "@/lib/catalog";

type RouteId =
  | "landing"
  | "claude"
  | "cursor"
  | "copilot"
  | "feedback"
  | "whats-new";

type SubscriberStats = {
  confirmed: number;
  pending: number;
  total: number;
};

type ReleaseDisplayMode = "new" | "empty";

type ReleaseDisplay = {
  entries: ReleaseLogEntry[];
  mode: ReleaseDisplayMode;
  unseenCount: number;
};

const PATH_TO_ROUTE: Record<string, RouteId> = {
  "/": "landing",
  "/claude": "claude",
  "/cursor": "cursor",
  "/copilot": "copilot",
  "/feedback": "feedback",
  "/whats-new": "whats-new",
};

const ROUTE_TO_PATH: Record<RouteId, string> = {
  landing: "/",
  claude: "/claude",
  cursor: "/cursor",
  copilot: "/copilot",
  feedback: "/feedback",
  "whats-new": "/whats-new",
};

type BadgeFilter = "all" | Badge;
type ViewMode = "tiles" | "list";
type LegendContext = "commands" | "skills" | "agents" | "hooks";

const BADGE_FILTERS: Array<{ value: BadgeFilter; label: string }> = [
  { value: "all", label: "All types" },
  { value: "chat", label: "Chat" },
  { value: "skill", label: "Skill" },
  { value: "ide", label: "IDE" },
  { value: "wf", label: "Workflow" },
];

const BADGE_LEGEND: Array<{ badge: Badge; label: string; hint: string }> = [
  { badge: "chat", label: "Chat", hint: "Conversation and context commands" },
  { badge: "skill", label: "Skill", hint: "Skill discovery and invocation" },
  { badge: "ide", label: "IDE", hint: "Editor, MCP, and tooling integrations" },
  { badge: "wf", label: "Workflow", hint: "Multi-step planning and review flows" },
];

const INVOCATION_LEGEND: Array<{ label: string; hint: string; className: string }> = [
  { label: "auto-invoked", hint: "Runs automatically when your request matches the trigger", className: "auto" },
  { label: "user-only", hint: "Must be invoked explicitly with the slash command", className: "manual" },
];

const AGENT_BADGE_LEGEND: Array<{ label: string; hint: string }> = [
  { label: "Read-only", hint: "Search and read files only — no edits or shell commands" },
  { label: "Full access", hint: "Can read, edit files, and run terminal commands" },
  { label: "Planning", hint: "Research subagent used during plan mode before coding" },
  { label: "Sonnet · Fast · Balanced", hint: "Model or speed profile shown after the access level" },
];

function badgeLabel(v?: string) {
  if (v === "skill") return "Skill";
  if (v === "wf") return "Workflow";
  if (v === "chat") return "Chat";
  if (v === "ide") return "IDE";
  return "";
}

function entryBadge(entry: CommandEntry): Badge | undefined {
  return entry.badge;
}

function commandUsage(cmd: string, ex: string, usage?: string) {
  if (usage) return usage;
  if (ex === cmd) return cmd;

  const cmdTrim = cmd.trim();
  const exTrim = ex.trim();
  if (exTrim.startsWith(cmdTrim)) {
    const tail = exTrim.slice(cmdTrim.length).trim();
    if (!tail) return cmdTrim;
    if (tail.startsWith("--")) {
      const [flag, ...rest] = tail.split(/\s+/);
      return rest.length ? `${cmdTrim} ${flag} <path>` : `${cmdTrim} ${flag}`;
    }
    return `${cmdTrim} <argument>`;
  }

  return cmdTrim;
}

function matchesBadgeFilter(entry: CommandEntry, filter: BadgeFilter) {
  if (filter === "all") return true;
  return entryBadge(entry) === filter;
}

function countCommands(tool: ToolCatalog) {
  return tool.groups.reduce((sum, group) => sum + group.entries.length, 0);
}

function countMeta(tool: ToolCatalog) {
  return {
    skills: Array.isArray(tool.skills) ? tool.skills.length : 0,
    agents: Array.isArray(tool.agents) ? tool.agents.length : 0,
    hooks: Array.isArray(tool.hooks) ? tool.hooks.length : 0,
  };
}

function formatMetaBreakdown(tool: ToolCatalog) {
  const meta = countMeta(tool);
  const parts: string[] = [];
  if (meta.skills) parts.push(`${meta.skills} skill${meta.skills === 1 ? "" : "s"}`);
  if (meta.agents) parts.push(`${meta.agents} agent${meta.agents === 1 ? "" : "s"}`);
  if (meta.hooks) parts.push(`${meta.hooks} hook${meta.hooks === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" · ") : "—";
}

const CONFIG_PATHS: Record<"claude" | "cursor" | "copilot", string> = {
  claude: ".claude/settings.json, .claude/skills/, .claude/agents/",
  cursor: ".cursor/rules, .cursor/skills/, .cursor/hooks.json",
  copilot: ".github/copilot-instructions.md, .github/prompts/",
};

function countToolEntries(tool: ToolCatalog) {
  const commands = countCommands(tool);
  const skills = Array.isArray(tool.skills) ? tool.skills.length : 0;
  const agents = Array.isArray(tool.agents) ? tool.agents.length : 0;
  const hooks = Array.isArray(tool.hooks) ? tool.hooks.length : 0;
  return commands + skills + agents + hooks;
}

function toCatalogTools() {
  return JSON.parse(JSON.stringify(baseCatalog.tools)) as Catalog["tools"];
}

const TOOL_ORDER = ["claude", "cursor", "copilot"] as const;
const TOOL_LABELS: Record<(typeof TOOL_ORDER)[number], string> = {
  claude: "Claude",
  cursor: "Cursor",
  copilot: "Copilot",
};

function formatReleaseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ReferenceShell() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Catalog["tools"]>(() => toCatalogTools());
  const [activeGroup, setActiveGroup] = useState({
    claude: "all",
    cursor: "all",
    copilot: "all",
  });
  const [badgeFilter, setBadgeFilter] = useState<Record<"claude" | "cursor" | "copilot", BadgeFilter>>({
    claude: "all",
    cursor: "all",
    copilot: "all",
  });
  const [viewMode, setViewMode] = useState<ViewMode>("tiles");
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null);
  const [releaseDisplay, setReleaseDisplay] = useState<ReleaseDisplay>({
    entries: [],
    mode: "empty",
    unseenCount: 0,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const ticker = useFooterTicker();
  const route = PATH_TO_ROUTE[pathname] || "landing";

  const activeTool = route === "claude" || route === "cursor" || route === "copilot" ? route : null;

  const searchSuggestions = useMemo(() => {
    const toolsToSearch = activeTool
      ? [activeTool]
      : (["claude", "cursor", "copilot"] as const);

    const q = search.trim().toLowerCase();
    if (!q) {
      return [] as Array<{
        key: string;
        cmd: string;
        name: string;
        category: string;
        tool: "claude" | "cursor" | "copilot";
        kind: "command" | "skill" | "agent" | "hook" | "prompt";
      }>;
    }

    const matches: Array<{
      key: string;
      cmd: string;
      name: string;
      category: string;
      tool: "claude" | "cursor" | "copilot";
      kind: "command" | "skill" | "agent" | "hook" | "prompt";
    }> = [];

    for (const tool of toolsToSearch) {
      const conf = data[tool];
      for (const g of conf.groups) {
        for (const e of g.entries) {
          const haystack = `${e.cmd} ${e.name} ${e.desc}`.toLowerCase();
          if (!haystack.includes(q)) continue;
          const kind = e.badge === "chat" ? "prompt" : "command";
          matches.push({
            key: `${tool}|command|${g.id}|${e.cmd}|${e.name}`,
            cmd: e.cmd,
            name: e.name,
            category: `${tool[0].toUpperCase() + tool.slice(1)} · ${g.label.replace(/\s+commands?$/i, "")}`,
            tool,
            kind,
          });
        }
      }

      for (const s of conf.skills || []) {
        const haystack = `${s.cmd} ${s.name} ${s.desc} ${s.trigger}`.toLowerCase();
        if (!haystack.includes(q)) continue;
        matches.push({
          key: `${tool}|skill|${s.cmd}|${s.name}`,
          cmd: s.cmd,
          name: s.name,
          category: `${tool[0].toUpperCase() + tool.slice(1)} · Skills`,
          tool,
          kind: "skill",
        });
      }

      for (const a of conf.agents || []) {
        const haystack = `${a.name} ${a.desc} ${a.when} ${a.invoke}`.toLowerCase();
        if (!haystack.includes(q)) continue;
        matches.push({
          key: `${tool}|agent|${a.name}`,
          cmd: "@agent",
          name: a.name,
          category: `${tool[0].toUpperCase() + tool.slice(1)} · Agents`,
          tool,
          kind: "agent",
        });
      }

      for (const h of conf.hooks || []) {
        const haystack = `${h.cmd} ${h.name} ${h.desc} ${h.trigger}`.toLowerCase();
        if (!haystack.includes(q)) continue;
        matches.push({
          key: `${tool}|hook|${h.cmd}|${h.name}`,
          cmd: h.cmd,
          name: h.name,
          category: `${tool[0].toUpperCase() + tool.slice(1)} · Hooks`,
          tool,
          kind: "hook",
        });
      }
    }

    return matches.slice(0, 8);
  }, [activeTool, data, search]);

  const showSearchSuggestions = Boolean(searchFocused && search.trim());

  const groupedReleaseEntries = useMemo(() => {
    const grouped: Record<(typeof TOOL_ORDER)[number], ReleaseLogEntry[]> = {
      claude: [],
      cursor: [],
      copilot: [],
    };

    for (const entry of releaseDisplay.entries) {
      grouped[entry.tool].push(entry);
    }

    return grouped;
  }, [releaseDisplay.entries]);

  const totalEntries = useMemo(() => {
    return Object.values(data).reduce((sum, tool) => {
      const groupsCount = tool.groups.reduce((s, g) => s + g.entries.length, 0);
      const skillsCount = Array.isArray(tool.skills) ? tool.skills.length : 0;
      const agentsCount = Array.isArray(tool.agents) ? tool.agents.length : 0;
      const hooksCount = Array.isArray(tool.hooks) ? tool.hooks.length : 0;
      return sum + groupsCount + skillsCount + agentsCount + hooksCount;
    }, 0);
  }, [data]);

  useEffect(() => {
    const stored = localStorage.getItem("aidevref-sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(stored === "1");
    }
    const storedView = localStorage.getItem("aidevref-view-mode");
    if (storedView === "tiles" || storedView === "list") {
      setViewMode(storedView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aidevref-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("aidevref-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const onViewportChange = () => {
      if (!media.matches) {
        setIsMobileMenuOpen(false);
      }
    };
    onViewportChange();
    media.addEventListener("change", onViewportChange);
    return () => media.removeEventListener("change", onViewportChange);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const endpoint = activeTool ? `/api/catalog?tool=${activeTool}` : "/api/catalog";
        const res = await fetch(endpoint, { cache: "default" });
        if (!res.ok) return;

        if (activeTool) {
          const remote = (await res.json()) as { tool?: "claude" | "cursor" | "copilot"; data?: ToolCatalog };
          const tool = remote?.tool;
          if (tool && remote?.data && (tool === "claude" || tool === "cursor" || tool === "copilot")) {
            setData((prev) => ({
              ...prev,
              [tool]: remote.data,
            }));
          }
          return;
        }

        const remote = (await res.json()) as Catalog;
        if (remote?.tools) {
          setData(remote.tools);
        }
      } catch {
        // silent
      }
    })();

  }, [activeTool]);

  useEffect(() => {
    const synced = syncCatalogUpdates(data);

    if (route === "whats-new") {
      if (synced.unseenEntries.length > 0) {
        setReleaseDisplay({
          entries: synced.unseenEntries,
          mode: "new",
          unseenCount: synced.unseenEntries.length,
        });
      } else {
        setReleaseDisplay({ entries: [], mode: "empty", unseenCount: 0 });
      }
      return;
    }
  }, [data, route]);

  useEffect(() => {
    if (route === "whats-new" && releaseDisplay.mode !== "new") {
      router.replace("/");
    }
  }, [route, releaseDisplay.mode, router]);

  function handleMarkUpdatesReviewed() {
    const synced = syncCatalogUpdates(data);
    if (!synced.unseenEntries.length) return;

    markAllUnseenReviewed(synced.unseenEntries.map((entry) => entry.key));
    setReleaseDisplay({ entries: [], mode: "empty", unseenCount: 0 });
    router.replace("/");
  }

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/notify/stats", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { ok?: boolean; stats?: SubscriberStats };
        if (!json?.ok || !json.stats) return;
        setSubscriberStats(json.stats);
      } catch {
        // silent
      }
    })();
  }, []);

  function navigate(nextRoute: RouteId) {
    setIsMobileMenuOpen(false);
    router.push(ROUTE_TO_PATH[nextRoute]);
  }

  function toggleSidebarMenu() {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsMobileMenuOpen((prev) => !prev);
      return;
    }
    setSidebarCollapsed((prev) => !prev);
  }

  function renderToolGlyph(tool: "claude" | "cursor" | "copilot", size = 18) {
    return <ToolIcon tool={tool} size={size} />;
  }

  function renderLegend(context: LegendContext) {
    if (context === "skills" || context === "hooks") {
      return (
        <aside className="badge-legend-aside" aria-label="Invocation legend">
          <p className="badge-legend-title">Legend</p>
          <ul className="badge-legend-list">
            {INVOCATION_LEGEND.map((item) => (
              <li className="badge-legend-aside-item" key={item.label}>
                <span className={`skill-auto skill-auto-${item.className}`}>{item.label}</span>
                <span className="badge-legend-desc">{item.hint}</span>
              </li>
            ))}
          </ul>
        </aside>
      );
    }

    if (context === "agents") {
      return (
        <aside className="badge-legend-aside" aria-label="Agent badge legend">
          <p className="badge-legend-title">Legend</p>
          <ul className="badge-legend-list">
            {AGENT_BADGE_LEGEND.map((item) => (
              <li className="badge-legend-aside-item" key={item.label}>
                <span className="agent-badge agent-badge-legend">{item.label}</span>
                <span className="badge-legend-desc">{item.hint}</span>
              </li>
            ))}
          </ul>
        </aside>
      );
    }

    return (
      <aside className="badge-legend-aside" aria-label="Category legend">
        <p className="badge-legend-title">Legend</p>
        <ul className="badge-legend-list">
          {BADGE_LEGEND.map((item) => (
            <li className="badge-legend-aside-item" key={item.badge}>
              <span className={`badge ${item.badge}`}>{item.label}</span>
              <span className="badge-legend-desc">{item.hint}</span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  function renderViewToolbar(tool: "claude" | "cursor" | "copilot", showTypeFilter: boolean) {
    return (
      <div className="ref-toolbar">
        {showTypeFilter ? (
          <label className="ref-toolbar-field">
            <span className="ref-toolbar-label">Type</span>
            <select
              className="ref-type-select"
              value={badgeFilter[tool]}
              onChange={(event) => {
                const value = event.target.value as BadgeFilter;
                setBadgeFilter((prev) => ({ ...prev, [tool]: value }));
              }}
            >
              {BADGE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="ref-toolbar-spacer" />
        )}
        <div className="view-mode-toggle" role="group" aria-label="Display mode">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "tiles" ? "active" : ""}`}
            onClick={() => setViewMode("tiles")}
            aria-pressed={viewMode === "tiles"}
          >
            <LayoutGrid size={14} />
            Tiles
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <List size={14} />
            List
          </button>
        </div>
      </div>
    );
  }

  function renderConfigBlock(configPath?: string, configExample?: string) {
    if (!configPath && !configExample) return null;

    return (
      <div className="config-block">
        {configPath ? (
          <div className="config-path">
            <strong>Configure in:</strong> <code>{configPath}</code>
          </div>
        ) : null}
        {configExample ? (
          <div className="config-example-wrap">
            <div className="config-example-head">
              <span className="ex-label">Example config</span>
            </div>
            <pre className="config-example">{configExample}</pre>
          </div>
        ) : null}
      </div>
    );
  }

  function renderSkillsSection(skills: SkillEntry[] = [], tool: "claude" | "cursor" | "copilot" = "claude") {
    const title = tool === "claude" ? "Bundled Skills" : "Skills";

    return (
      <section>
        <div className="group-label" id={`${tool}-skills`}>
          <h3>{title}</h3>
          <div className="line" />
        </div>
        <div className="info-box info-skill">
          {tool === "claude"
            ? "Claude can auto-invoke skills based on request intent. User-only skills are available when invoked explicitly. Configure custom skills in .claude/skills/<name>/SKILL.md."
            : "Agent skills extend Cursor with reusable workflows. Configure in .cursor/skills/ or via /create-skill."}
        </div>
        <div className={`skills-list ${viewMode === "list" ? "skills-list-compact" : ""}`}>
          {skills.map((s) => {
            const usage = commandUsage(s.cmd, s.ex, s.usage);
            return (
            <article className={`skill-row ${viewMode === "list" ? "skill-row-list" : ""}`} key={`${s.cmd}-${s.name}`}>
              <div className="skill-left">
                <div className="skill-cmd-row">
                  <div className="skill-cmd">{s.cmd}</div>
                </div>
                <div className="skill-auto">{s.auto ? "auto-invoked" : "user-only"}</div>
              </div>
              <div className="skill-right">
                <div className="skill-name">{s.name}</div>
                <div className="skill-desc">{s.desc}</div>
                <div className="skill-trigger">
                  <strong>Trigger:</strong> {s.trigger}
                </div>
                {renderConfigBlock(s.configPath, s.configExample)}
                <div className="ex-label-row">
                  <span className="ex-label">Command</span>
                  <CopyButton text={usage} label="Copy command pattern" />
                </div>
                <pre className="skill-ex cmd-usage">{usage}</pre>
                <div className="ex-label-row">
                  <span className="ex-label">Example</span>
                  <CopyButton text={s.ex} label="Copy example" />
                </div>
                <pre className="skill-ex">{s.ex}</pre>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderCommandCard(tool: "claude" | "cursor" | "copilot", entry: CommandEntry) {
    const badgeValue = entryBadge(entry);
    const badge = badgeValue ? <span className={`badge ${badgeValue}`}>{badgeLabel(badgeValue)}</span> : null;
    const usage = commandUsage(entry.cmd, entry.ex, entry.usage);

    return (
      <article
        className={`cmd-card ${tool} ${viewMode === "list" ? "cmd-card-list" : ""}`}
        key={`${entry.cmd}-${entry.name}`}
      >
        <div className="cmd-top">
          <span className={`cmd ${tool}`}>{entry.cmd}</span>
          <div className="cmd-top-actions">{badge}</div>
        </div>
        <div className="cmd-name">{entry.name}</div>
        <div className="cmd-desc">{entry.desc}</div>
        <div className="ex-label-row">
          <span className="ex-label">Command</span>
          <CopyButton text={usage} label="Copy command pattern" />
        </div>
        <pre className={`ex ${tool} cmd-usage`}>{usage}</pre>
        <div className="ex-label-row">
          <span className="ex-label">Example</span>
          <CopyButton text={entry.ex} label="Copy example" />
        </div>
        <pre className={`ex ${tool}`}>{entry.ex}</pre>
      </article>
    );
  }

  function renderAgentsSection(agents: AgentEntry[] = [], tool: "claude" | "cursor" | "copilot" = "claude") {
    return (
      <section>
        <div className="group-label" id={`${tool}-agents`}>
          <h3>Subagents</h3>
          <div className="line" />
        </div>
        <div className="info-box info-agent">
          {tool === "claude"
            ? "Subagents run focused tasks with tuned tools, model choices, and invocation patterns. Define custom agents in .claude/agents/<name>.md."
            : "Subagents delegate specialized tasks. Configure in .cursor/agents/ or via /create-subagent."}
        </div>
        <div className={`agent-grid ${viewMode === "list" ? "agent-grid-list" : ""}`}>
          {agents.map((a) => (
            <article className={`agent-card ${viewMode === "list" ? "agent-card-list" : ""}`} style={{ borderLeftColor: a.color }} key={a.name}>
              <div className="agent-top">
                <div className="agent-name">{a.name}</div>
                <div className="agent-top-actions">
                  <span className="agent-badge">{a.badge}</span>
                </div>
              </div>
              <div className="agent-desc">{a.desc}</div>
              <div className="agent-when">
                <strong>When used:</strong> {a.when}
              </div>
              {renderConfigBlock(a.configPath, a.configExample)}
              <div className="meta-pills">
                <span className="meta-pill">Tools: {a.tools}</span>
                <span className="meta-pill">Model: {a.model}</span>
                <span className="meta-pill">Invoke: {a.invoke}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderHooksSection(hooks: HookEntry[] = [], tool: "claude" | "cursor" | "copilot" = "claude") {
    return (
      <section>
        <div className="group-label">
          <h3>Hooks</h3>
          <div className="line" />
        </div>
        <div className="info-box info-skill">
          {tool === "claude"
            ? "Lifecycle hooks automate Claude Code sessions. Configure in .claude/settings.json under the hooks key, or globally in ~/.claude/settings.json."
            : "Lifecycle hooks automate agent behavior. Configure in .cursor/hooks.json or via /create-hook."}
        </div>
        <div className={`skills-list ${viewMode === "list" ? "skills-list-compact" : ""}`}>
          {hooks.map((h) => {
            const usage = commandUsage(h.cmd, h.ex, h.usage);
            return (
            <article className={`skill-row ${viewMode === "list" ? "skill-row-list" : ""}`} key={`${h.cmd}-${h.name}`}>
              <div className="skill-left">
                <div className="skill-cmd-row">
                  <div className="skill-cmd">{h.cmd}</div>
                </div>
                <div className="skill-auto">{h.auto ? "auto-invoked" : "user-only"}</div>
              </div>
              <div className="skill-right">
                <div className="skill-name">{h.name}</div>
                <div className="skill-desc">{h.desc}</div>
                <div className="skill-trigger">
                  <strong>Trigger:</strong> {h.trigger}
                </div>
                {renderConfigBlock(h.configPath, h.configExample)}
                <div className="ex-label-row">
                  <span className="ex-label">Command</span>
                  <CopyButton text={usage} label="Copy command pattern" />
                </div>
                <pre className="skill-ex cmd-usage">{usage}</pre>
                <div className="ex-label-row">
                  <span className="ex-label">Example</span>
                  <CopyButton text={h.ex} label="Copy example" />
                </div>
                <pre className="skill-ex">{h.ex}</pre>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderToolPage(tool: "claude" | "cursor" | "copilot") {
    const conf = data[tool] as ToolCatalog;
    const groupValue = activeGroup[tool];
    const typeFilter = badgeFilter[tool];
    const q = search.trim().toLowerCase();
    const commandGroups = groupValue === "all" ? conf.groups : conf.groups.filter((g) => g.id === groupValue);
    const showingCommandGroups = !["skills", "agents", "hooks-meta"].includes(groupValue);
    const legendContext: LegendContext =
      groupValue === "skills" ? "skills" : groupValue === "agents" ? "agents" : groupValue === "hooks-meta" ? "hooks" : "commands";

    const pills = [
      <button
        key="all"
        className={`pill ${tool} ${groupValue === "all" ? "active" : ""}`}
        onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: "all" }))}
      >
        All
      </button>,
      ...conf.groups.map((g) => (
        <button
          key={g.id}
          className={`pill ${tool} ${groupValue === g.id ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: g.id }))}
        >
          {g.label}
        </button>
      )),
    ];

    if (conf.skills?.length) {
      pills.push(
        <button
          key="skills"
          className={`pill ${tool} ${groupValue === "skills" ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: "skills" }))}
        >
          Skills
        </button>,
      );
    }

    if (conf.agents?.length) {
      pills.push(
        <button
          key="agents"
          className={`pill ${tool} ${groupValue === "agents" ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: "agents" }))}
        >
          Agents
        </button>,
      );
    }

    if (Array.isArray(conf.hooks) && conf.hooks.length) {
      pills.push(
        <button
          key="hooks-meta"
          className={`pill ${tool} ${groupValue === "hooks-meta" ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: "hooks-meta" }))}
        >
          Hooks
        </button>,
      );
    }

    const sections: React.ReactNode[] = [];

    if (groupValue === "skills" && conf.skills?.length) {
      sections.push(renderSkillsSection(conf.skills, tool));
    } else if (groupValue === "agents" && conf.agents?.length) {
      sections.push(renderAgentsSection(conf.agents, tool));
    } else if (groupValue === "hooks-meta" && conf.hooks) {
      sections.push(renderHooksSection(conf.hooks, tool));
    } else {
      for (const g of commandGroups) {
        const filtered = g.entries.filter((e) => {
          if (!matchesBadgeFilter(e, typeFilter)) return false;
          if (!q) return true;
          return [e.cmd, e.name, e.desc].join(" ").toLowerCase().includes(q);
        });

        if (!filtered.length && (q || typeFilter !== "all")) continue;

        sections.push(
          <section key={g.id}>
            <div className="group-label" id={`${tool}-${g.id}`}>
              <h3>{g.label}</h3>
              <div className="line" />
            </div>
            <div className={`cmd-grid ${viewMode === "list" ? "cmd-grid-list" : ""}`}>
              {filtered.length ? (
                filtered.map((e) => renderCommandCard(tool, e))
              ) : (
                <div className="empty">
                  {q
                    ? `No results for "${search}"`
                    : `No commands match the "${badgeLabel(typeFilter) || "selected"}" type filter.`}
                </div>
              )}
            </div>
          </section>,
        );
      }

      if (!sections.length && showingCommandGroups) {
        sections.push(
          <div className="empty" key="no-matches">
            {q
              ? `No results for "${search}"`
              : `No commands match the "${badgeLabel(typeFilter) || "selected"}" type filter.`}
          </div>,
        );
      }
    }

    return (
      <>
        <section className="tool-header">
          <div className="tool-meta">
            <div className={`logo-52 ${tool}`}>
              {renderToolGlyph(tool, 20)}
            </div>
            <div>
              <h1 className={`tool-title ${tool}`}>{tool[0].toUpperCase() + tool.slice(1)}</h1>
              <p className="tool-sub">{conf.subtitle}</p>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => navigate("landing")}>
            ← Back
          </button>
        </section>
        <div className="tool-content-layout">
          <div className="tool-content-main">
            <nav className="pill-nav">{pills}</nav>
            {showingCommandGroups ? renderViewToolbar(tool, true) : renderViewToolbar(tool, false)}
            {sections}
          </div>
          {renderLegend(legendContext)}
        </div>
      </>
    );
  }

  function toolNav(tool: "claude" | "cursor" | "copilot", label: string) {
    const active = route === tool;
    return (
      <div className={`tool-nav-item ${active ? "tool-open" : ""}`}>
        <button
          className={`nav-btn has-tooltip tool-${tool} ${active ? "active" : ""}`}
          onClick={() => navigate(tool)}
          data-tooltip={label}
          aria-label={label}
          title={label}
          aria-expanded={active}
        >
          <span className={`nav-icon-wrap nav-icon-wrap-tool nav-icon-wrap-${tool}`}>
            <ToolIcon tool={tool} size={14} className="nav-icon" />
          </span>
          <span className="nav-label">{label}</span>
        </button>
        <div className={`sub-nav sub-nav-${tool}`}>
          {active ? (
            <>
              <button
                className={`sub-link ${tool} ${activeGroup[tool] === "all" ? "active" : ""}`}
                onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: "all" }))}
              >
                All groups
              </button>
              {data[tool].groups.map((g: Group) => (
                <button
                  className={`sub-link ${tool} ${activeGroup[tool] === g.id ? "active" : ""}`}
                  key={g.id}
                  onClick={() => setActiveGroup((prev) => ({ ...prev, [tool]: g.id }))}
                >
                  {g.label}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" data-route={route}>
      <header className="topbar">
        <button
          className="mobile-menu-btn"
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="sidebar"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <button className="brand" onClick={() => navigate("landing")} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="logo-box" aria-hidden="true">
            <span className="brand-mark">
              <span className="brand-mark-node node-claude" />
              <span className="brand-mark-node node-cursor" />
              <span className="brand-mark-node node-copilot" />
            </span>
          </div>
          <span>AI Dev Reference</span>
        </button>
        <div className="brand-quick-actions">
          <button id="btn-feature" className="btn-primary" type="button" onClick={() => navigate("feedback")}>
            Request a feature
          </button>
          <div id="entry-count" className="count-tag">
            {search.trim() && ["claude", "cursor", "copilot"].includes(route)
              ? "Searching..."
              : `${totalEntries} entries · 3 tools`}
          </div>
        </div>
        <div className="top-actions">
          <label className="sr-only" htmlFor="global-search">
            Search
          </label>
          <div className={`search-wrap ${showSearchSuggestions ? "open" : ""}`}>
            <input
              id="global-search"
              type="search"
              placeholder="Search active tool commands..."
              value={search}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setSearchFocused(false), 120);
              }}
              onChange={(e) => setSearch(e.target.value)}
            />
            {showSearchSuggestions ? (
              <div className="search-dropdown" role="listbox" aria-label="Command suggestions">
                {searchSuggestions.length ? (
                  searchSuggestions.map((item) => (
                    <button
                      className={`search-option ${item.tool}`}
                      key={item.key}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(item.cmd);
                        setSearchFocused(false);
                      }}
                    >
                      <span className="search-option-main">
                        <span className="search-option-cmd">{item.cmd}</span>
                        <span className="search-option-name">{item.name}</span>
                      </span>
                      <span className="search-option-meta">
                        <span className="search-option-category">{item.category}</span>
                        <span className={`search-option-kind ${item.kind}`}>{item.kind}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="search-empty">No matching commands</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="disclaimer">
        <span className="disclaimer-text">
          <span className="disclaimer-text-full">
            Educational reference. All trademarks belong to their respective owners: <strong>Anthropic (Claude), Anysphere (Cursor), Microsoft/GitHub (Copilot).</strong>
          </span>
          <span className="disclaimer-text-compact">
            Educational reference for Claude, Cursor, and Copilot.
          </span>
        </span>
        <button className="link-btn link-btn-sm disclaimer-action" onClick={() => navigate("feedback")}>
          Anything Missing / Found an error?
        </button>
      </div>

      <div className={`layout ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`} id="sidebar">
          <button
            className="sidebar-toggle has-tooltip"
            type="button"
            onClick={toggleSidebarMenu}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-tooltip={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
            title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="sidebar-toggle-label">Menu</span>
          </button>
          <div className="sidebar-main">
            <p className="nav-title">Navigation</p>
            <button
              className={`nav-btn has-tooltip ${route === "landing" ? "active" : ""}`}
              onClick={() => navigate("landing")}
              data-tooltip="Home"
              aria-label="Home"
              title="Home"
            >
              <span className="nav-icon-wrap">
                <Home size={15} className="nav-icon" />
              </span>
              <span className="nav-label">Home</span>
            </button>
            <button
              className={`nav-btn has-tooltip ${route === "feedback" ? "active" : ""}`}
              onClick={() => navigate("feedback")}
              data-tooltip="Request a feature"
              aria-label="Request a feature"
              title="Request a feature"
            >
              <span className="nav-icon-wrap">
                <Lightbulb size={15} className="nav-icon" />
              </span>
              <span className="nav-label">Request a feature</span>
            </button>
            <div className="sidebar-tools">
              <p className="nav-title">Tools</p>
              {toolNav("claude", "Claude")}
              {toolNav("cursor", "Cursor")}
              {toolNav("copilot", "Copilot")}
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              className="nav-btn has-tooltip footer-action"
              onClick={() => navigate("feedback")}
              data-tooltip="Submit feature / Found error"
              aria-label="Submit feature / Found error"
              title="Submit feature / Found error"
              type="button"
            >
              <span className="nav-icon-wrap">
                <Bug size={15} className="nav-icon" />
              </span>
              <span className="nav-label">Submit feature / Found error</span>
            </button>

            <button
              className="sidebar-app-logo has-tooltip"
              onClick={() => navigate("landing")}
              data-tooltip="AI Dev Reference"
              aria-label="AI Dev Reference"
              title="AI Dev Reference"
              type="button"
            >
              <span className="sidebar-app-mark" aria-hidden="true">
                <span className="brand-mark brand-mark-sm">
                  <span className="brand-mark-node node-claude" />
                  <span className="brand-mark-node node-cursor" />
                  <span className="brand-mark-node node-copilot" />
                </span>
              </span>
              <span className="nav-label">AI Dev Reference</span>
            </button>
          </div>
        </aside>

        <div className="content">
          <AnimatePresence mode="wait">
            <motion.main
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="active"
            >
              {route === "landing" ? (
                <>
                  <section className="hero">
                    <div className="hero-surface">
                      <div className="eyebrow">Developer Command Reference · 2026</div>
                      <h1>
                        Every command,<br />
                        <span className="benefit">one reference.</span>
                      </h1>
                      <p>
                        Commands, skills, and subagents for Claude, Cursor, and GitHub Copilot.
                        One searchable reference, always current.
                      </p>
                      <div className="hero-stats" aria-label="Community stats">
                        <span className="hero-stat-chip confirmed">
                          {subscriberStats ? subscriberStats.confirmed.toLocaleString() : "-"} confirmed subscribers
                        </span>
                        <span className="hero-stat-chip pending">
                          {subscriberStats ? subscriberStats.pending.toLocaleString() : "-"} pending confirmations
                        </span>
                      </div>
                      <div className="hero-tool-row" aria-label="Included tools">
                        <article className="hero-tool-item claude" aria-label="Claude">
                          <span className="hero-tool-icon">
                            <ToolIcon tool="claude" size={18} />
                          </span>
                          <span className="hero-tool-name">Claude</span>
                          <span className="hero-tool-meta">
                            {countToolEntries(data.claude)} entries
                          </span>
                        </article>
                        <article className="hero-tool-item cursor" aria-label="Cursor">
                          <span className="hero-tool-icon">
                            <ToolIcon tool="cursor" size={18} />
                          </span>
                          <span className="hero-tool-name">Cursor</span>
                          <span className="hero-tool-meta">
                            {countToolEntries(data.cursor)} entries
                          </span>
                        </article>
                        <article className="hero-tool-item copilot" aria-label="Copilot">
                          <span className="hero-tool-icon">
                            <ToolIcon tool="copilot" size={18} />
                          </span>
                          <span className="hero-tool-name">Copilot</span>
                          <span className="hero-tool-meta">
                            {countToolEntries(data.copilot)} entries
                          </span>
                        </article>
                      </div>
                    </div>
                  </section>

                  <section className="tool-grid" id="landing-tool-grid">
                    {([
                      {
                        id: "claude",
                        name: "Claude",
                        maker: "Anthropic",
                        desc: "Terminal-native slash commands, rich skills, and subagents for deep workflows.",
                        tags: ["Slash Commands", "Skills", "Subagents", "Hooks"],
                      },
                      {
                        id: "cursor",
                        name: "Cursor",
                        maker: "Anysphere",
                        desc: "IDE-first command flows for editing, navigation, and autonomous coding passes.",
                        tags: ["Composer", "IDE Actions", "Automation", "Hooks"],
                      },
                      {
                        id: "copilot",
                        name: "Copilot",
                        maker: "Microsoft/GitHub",
                        desc: "Workspace-aware chat commands for review, edits, tests, and docs in one surface.",
                        tags: ["Chat", "Workspace", "Quality", "Hooks"],
                      },
                    ] as const).map((card) => (
                      <article className={`tool-card ${card.id}`} key={card.id} onClick={() => navigate(card.id)}>
                        <div className="tool-head">
                          <div className={`tool-mini ${card.id}`}>
                            {renderToolGlyph(card.id, 18)}
                          </div>
                          <div>
                            <div className={`tool-name ${card.id}`}>{card.name}</div>
                            <div className="maker">
                              by {card.maker} · {countToolEntries(data[card.id])} entries
                            </div>
                            <div className="maker-meta">{formatMetaBreakdown(data[card.id])}</div>
                          </div>
                        </div>
                        <div className="tool-strip-body">
                          <p className="tool-desc">{card.desc}</p>
                          <div className="tags">
                            {card.tags.map((tag) => (
                              <span className="tag" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="tool-strip-cta">
                          <span className={`card-cta ${card.id}`}>
                            Open reference <span className="arr">→</span>
                          </span>
                        </div>
                      </article>
                    ))}
                  </section>

                  <section className="compare-wrap">
                    <table>
                      <tbody>
                        <tr><th>Catalog entries</th><td>{countToolEntries(data.claude)}</td><td>{countToolEntries(data.cursor)}</td><td>{countToolEntries(data.copilot)}</td></tr>
                        <tr><th>Slash commands</th><td>{countCommands(data.claude)}</td><td>{countCommands(data.cursor)}</td><td>{countCommands(data.copilot)}</td></tr>
                        <tr><th>Skills / agents / hooks</th><td>{formatMetaBreakdown(data.claude)}</td><td>{formatMetaBreakdown(data.cursor)}</td><td>{formatMetaBreakdown(data.copilot)}</td></tr>
                        <tr><th>Configure in</th><td><code>{CONFIG_PATHS.claude}</code></td><td><code>{CONFIG_PATHS.cursor}</code></td><td><code>{CONFIG_PATHS.copilot}</code></td></tr>
                        <tr><th>Parallel execution</th><td>Supported in tool pipelines</td><td>Supported in IDE workflows</td><td>Supported in terminal/task flows</td></tr>
                        <tr><th>Context management</th><td>Memory tiers + agent context</td><td>Workspace-aware context windows</td><td>Chat + repo context + policies</td></tr>
                        <tr><th>MCP support</th><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                        <tr><th>Memory/rules file</th><td>Rules and memory scopes</td><td>.cursor rules and memories</td><td>Instruction files + repo memory</td></tr>
                        <tr><th>Code review</th><td>Review-oriented prompts + agents</td><td>Inline review in editor</td><td>PR and workspace review workflows</td></tr>
                        <tr><th>Surfaces</th><td>Terminal + editor + planning</td><td>IDE sidebar + chat + commands</td><td>Chat view + terminal + editor</td></tr>
                      </tbody>
                    </table>
                  </section>
                </>
              ) : null}

              {route === "claude" || route === "cursor" || route === "copilot"
                ? renderToolPage(route)
                : null}

              {route === "feedback" ? (
                <>
                  <section className="feedback-header">
                    <h1>Submit a request</h1>
                    <p className="feedback-sub">
                      Report missing commands, request additions, or suggest improvements for clarity
                      and searchability across Claude, Cursor, and Copilot references. For anything else
                      — including privacy or data requests — select <strong>General</strong> and choose{" "}
                      <strong>I want to contact</strong> or <strong>Other</strong>.
                    </p>
                  </section>
                  <section className="feedback-wrap">
                    <FeedbackForm />
                    <div className="signup">
                      <h3>Release notification signup</h3>
                      <p>Get notified when command references and tool mappings are updated.</p>
                      <NotifyForm />
                    </div>
                  </section>
                </>
              ) : null}

              {route === "whats-new" && releaseDisplay.mode === "new" ? (
                <section className="catalog-updates-page">
                  <div className="catalog-updates-hero">
                    <div>
                      <h1>What&apos;s new</h1>
                      {releaseDisplay.unseenCount > 0 ? (
                        <p>
                          {releaseDisplay.unseenCount} new {releaseDisplay.unseenCount === 1 ? "entry" : "entries"} since your last review.
                        </p>
                      ) : null}
                    </div>
                    <div className="catalog-updates-actions">
                      <button className="btn-primary catalog-mark-read" type="button" onClick={handleMarkUpdatesReviewed}>
                        Mark as reviewed
                      </button>
                    </div>
                  </div>

                  <section className="catalog-updates-shell">
                    {releaseDisplay.unseenCount > 0 ? (
                      <div className="catalog-updates-head">
                        <div className="catalog-chip catalog-chip-new">{releaseDisplay.unseenCount} new</div>
                      </div>
                    ) : null}

                    <div className="update-feed">
                      {TOOL_ORDER.map((tool) => {
                        const items = groupedReleaseEntries[tool];
                        if (!items.length) return null;

                        return (
                          <section className={`update-group update-group-${tool}`} key={tool}>
                            <div className="update-group-head">
                              <h2>{TOOL_LABELS[tool]}</h2>
                              <span className="update-group-count">{items.length}</span>
                            </div>
                            <div className="update-card-list">
                              {items.map((item) => (
                                <article
                                  className={`update-card ${tool} is-new`}
                                  key={item.key}
                                >
                                  <div className="update-card-top">
                                    <span className={`update-kind ${item.kind}`}>{item.kind}</span>
                                    <time className="update-date" dateTime={item.addedAt}>
                                      {formatReleaseDate(item.addedAt)}
                                    </time>
                                  </div>
                                  <h3 className="update-title">{item.title}</h3>
                                  <p className="update-details">{item.details}</p>
                                  <button
                                    className={`update-open tool-link-${tool}`}
                                    type="button"
                                    onClick={() => navigate(tool)}
                                  >
                                    Open in {TOOL_LABELS[tool]} reference
                                  </button>
                                </article>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </section>
                </section>
              ) : null}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-row footer-row-primary">
            <div className="f-left">
              <div className="f-kicker">
                <span className="k-sym">{ticker.symbol}</span>
                <span className="k-word">{ticker.word}</span>
              </div>
            </div>
            <div className="f-center">
              <div className="f-main">
                Crafted with <span className="heart">♥</span> by <span className="name">Nuthan Murarysetty</span>
              </div>
              <div className="f-sub">
                Community-maintained reference · Not affiliated with Anthropic, Cursor, or Microsoft
              </div>
            </div>
            <div className="f-right">
              <div className="f-link-row docs-row">
                <Link className="doc-link claude" href="https://code.claude.com/docs/en/overview" target="_blank" rel="noreferrer">Claude Docs</Link>
                <Link className="doc-link cursor" href="https://cursor.com/docs" target="_blank" rel="noreferrer">Cursor Docs</Link>
                <Link className="doc-link copilot" href="https://docs.github.com/en/copilot" target="_blank" rel="noreferrer">Copilot Docs</Link>
              </div>
            </div>
          </div>
          <div className="footer-row footer-row-secondary">
            <div className="f-legal">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-and-conditions">Terms and Conditions</Link>
            </div>
            <div className="f-social">
              <Link className="social-link" href="https://github.com/nuthanm" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
                <Github size={14} />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link className="social-link" href="https://www.linkedin.com/in/nuthanm/?skipRedirect=true" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
                <Linkedin size={14} />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link className="social-link" href="https://x.com/nuthanmurari" target="_blank" rel="noreferrer" aria-label="X" title="X">
                <X size={14} />
                <span className="sr-only">X</span>
              </Link>
              <Link className="social-link" href="https://nuthanmurarysetty.medium.com/" target="_blank" rel="noreferrer" aria-label="Medium" title="Medium">
                <BookOpen size={14} />
                <span className="sr-only">Medium</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
