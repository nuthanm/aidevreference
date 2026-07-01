"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BookOpen,
  Bug,
  ChevronLeft,
  ChevronRight,
  FileText,
  Github,
  Home,
  Linkedin,
  Lightbulb,
  Menu,
  MousePointer2,
  Sparkles,
  X,
} from "lucide-react";
import { FeedbackForm, NotifyForm } from "@/features/forms/forms";
import { useFooterTicker } from "@/hooks/use-footer-ticker";
import { baseCatalog, type Catalog, type Group, type ToolCatalog } from "@/lib/catalog";
import type { AgentEntry, HookEntry, SkillEntry, CommandEntry } from "@/lib/catalog";

type RouteId =
  | "landing"
  | "claude"
  | "cursor"
  | "copilot"
  | "feedback"
  | "release-notes";

type ReleaseData = {
  version: string;
  releaseNotes: Array<{ type?: string; title?: string; text?: string }>;
};

type ReleaseEntry = {
  id: string;
  source: "github" | "feed";
  type: "new" | "change" | "fix";
  title: string;
  text: string;
  url?: string;
  publishedAt?: string;
};

type ReleasesApiResponse = {
  ok?: boolean;
  version?: string;
  feed?: {
    totalNewEntries?: number;
    byTool?: {
      claude?: number;
      cursor?: number;
      copilot?: number;
    };
    hasNewEntries?: boolean;
    signature?: string;
    lastSentAt?: string | null;
  };
  entries?: ReleaseEntry[];
};

type BroadcastResponse = {
  ok?: boolean;
  sent?: number;
  failed?: number;
  totalRecipients?: number;
  failures?: string[];
  message?: string;
  error?: string;
};

type SubscriberStats = {
  confirmed: number;
  pending: number;
  total: number;
};

const RELEASE_FALLBACK: ReleaseData = {
  version: "1.0.0",
  releaseNotes: [
    {
      type: "new",
      title: "Unified command pages",
      text: "Added claude, cursor, copilot, and feedback routes with lazy rendering.",
    },
    {
      type: "change",
      title: "Search behavior",
      text: "Global search now filters cmd, name, and desc on active tool pages.",
    },
    {
      type: "fix",
      title: "Version banner",
      text: "Silent fetch and local dismissal persistence for update checks.",
    },
  ],
};

const RELEASE_TIMELINE_FALLBACK: ReleaseEntry[] = RELEASE_FALLBACK.releaseNotes.map((note, index) => ({
  id: `fallback-${index}`,
  source: "github",
  type: (note.type as "new" | "change" | "fix") || "change",
  title: note.title || `Update ${index + 1}`,
  text: note.text || "",
}));

const PATH_TO_ROUTE: Record<string, RouteId> = {
  "/": "landing",
  "/claude": "claude",
  "/cursor": "cursor",
  "/copilot": "copilot",
  "/feedback": "feedback",
  "/release-notes": "release-notes",
};

const ROUTE_TO_PATH: Record<RouteId, string> = {
  landing: "/",
  claude: "/claude",
  cursor: "/cursor",
  copilot: "/copilot",
  feedback: "/feedback",
  "release-notes": "/release-notes",
};

function badgeLabel(v?: string) {
  if (v === "skill") return "Skill";
  if (v === "wf") return "Workflow";
  if (v === "chat") return "Chat";
  if (v === "ide") return "IDE";
  return "";
}

function toCatalogTools() {
  return JSON.parse(JSON.stringify(baseCatalog.tools)) as Catalog["tools"];
}

function extractCatalogKeys(tools: Catalog["tools"]) {
  const keys: string[] = [];

  for (const tool of ["claude", "cursor", "copilot"] as const) {
    const conf = tools[tool];

    for (const group of conf.groups) {
      for (const entry of group.entries) {
        keys.push(`${tool}|command|${group.id}|${entry.cmd}|${entry.name}`);
      }
    }

    for (const skill of conf.skills || []) {
      keys.push(`${tool}|skill|${skill.cmd}|${skill.name}`);
    }

    for (const agent of conf.agents || []) {
      keys.push(`${tool}|agent|${agent.name}`);
    }

    for (const hook of conf.hooks || []) {
      keys.push(`${tool}|hook|${hook.cmd}|${hook.name}`);
    }
  }

  return keys;
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
  const [latestVersionData, setLatestVersionData] = useState<ReleaseData>(RELEASE_FALLBACK);
  const [releaseTimeline, setReleaseTimeline] = useState<ReleaseEntry[]>(RELEASE_TIMELINE_FALLBACK);
  const [feedNewCount, setFeedNewCount] = useState(0);
  const [feedHasNewEntries, setFeedHasNewEntries] = useState(false);
  const [feedSignature, setFeedSignature] = useState("");
  const [feedLastSentAt, setFeedLastSentAt] = useState<string | null>(null);
  const [broadcastAdminKey, setBroadcastAdminKey] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResponse | null>(null);
  const [broadcastError, setBroadcastError] = useState("");
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null);
  const [catalogUpdateCount, setCatalogUpdateCount] = useState(0);
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
  }, []);

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
    void (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) return;

        const remote = (await res.json()) as Catalog;
        if (!remote?.tools) return;

        const currentKeys = extractCatalogKeys(remote.tools);
        const storageKey = "aidevref-catalog-seen-keys-v1";
        const seenRaw = localStorage.getItem(storageKey);

        if (!seenRaw) {
          localStorage.setItem(storageKey, JSON.stringify(currentKeys));
          setCatalogUpdateCount(0);
          return;
        }

        let seenKeys = new Set<string>();
        try {
          const parsed = JSON.parse(seenRaw) as string[];
          seenKeys = new Set(Array.isArray(parsed) ? parsed : []);
        } catch {
          seenKeys = new Set<string>();
        }

        const unseenCount = currentKeys.filter((key) => !seenKeys.has(key)).length;
        setCatalogUpdateCount(unseenCount);
      } catch {
        // silent
      }
    })();
  }, [pathname]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/releases", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as ReleasesApiResponse;
        const version = json.version?.trim();
        if (version) {
          setLatestVersionData((prev) => ({ ...prev, version }));
        }
        if (Array.isArray(json.entries) && json.entries.length) {
          setReleaseTimeline(json.entries);
        }
        const totalFeedEntries = json.feed?.totalNewEntries || 0;
        setFeedNewCount(totalFeedEntries);
        setFeedHasNewEntries(Boolean(json.feed?.hasNewEntries));
        setFeedSignature(json.feed?.signature || "");
        setFeedLastSentAt(json.feed?.lastSentAt || null);
      } catch {
        // silent
      }
    })();

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
    if (tool === "claude") return <Bot size={size} />;
    if (tool === "cursor") return <MousePointer2 size={size} />;
    return <Sparkles size={size} />;
  }

  function renderCommandCard(tool: "claude" | "cursor" | "copilot", entry: CommandEntry) {
    const badge = entry.badge ? <span className={`badge ${entry.badge}`}>{badgeLabel(entry.badge)}</span> : null;

    return (
      <article className={`cmd-card ${tool}`} key={`${entry.cmd}-${entry.name}`}>
        <div className="cmd-top">
          <span className={`cmd ${tool}`}>{entry.cmd}</span>
          {badge}
        </div>
        <div className="cmd-name">{entry.name}</div>
        <div className="cmd-desc">{entry.desc}</div>
        <div className="ex-label">Example</div>
        <pre className={`ex ${tool}`}>{entry.ex}</pre>
      </article>
    );
  }

  function renderSkillsSection(skills: SkillEntry[] = []) {
    return (
      <section>
        <div className="group-label" id="claude-skills">
          <h3>Bundled Skills</h3>
          <div className="line" />
        </div>
        <div className="info-box info-skill">
          Claude can auto-invoke skills based on request intent. User-only skills are available when
          invoked explicitly.
        </div>
        <div className="skills-list">
          {skills.map((s) => (
            <article className="skill-row" key={`${s.cmd}-${s.name}`}>
              <div className="skill-left">
                <div className="skill-cmd">{s.cmd}</div>
                <div className="skill-auto">{s.auto ? "auto-invoked" : "user-only"}</div>
              </div>
              <div className="skill-right">
                <div className="skill-name">{s.name}</div>
                <div className="skill-desc">{s.desc}</div>
                <div className="skill-trigger">
                  <strong>Trigger:</strong> {s.trigger}
                </div>
                <pre className="skill-ex">{s.ex}</pre>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderAgentsSection(agents: AgentEntry[] = []) {
    return (
      <section>
        <div className="group-label" id="claude-agents">
          <h3>Subagents</h3>
          <div className="line" />
        </div>
        <div className="info-box info-agent">
          Subagents run focused tasks with tuned tools, model choices, and invocation patterns.
        </div>
        <div className="agent-grid">
          {agents.map((a) => (
            <article className="agent-card" style={{ borderLeftColor: a.color }} key={a.name}>
              <div className="agent-top">
                <div className="agent-name">{a.name}</div>
                <span className="agent-badge">{a.badge}</span>
              </div>
              <div className="agent-desc">{a.desc}</div>
              <div className="agent-when">
                <strong>When used:</strong> {a.when}
              </div>
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

  function renderHooksSection(hooks: HookEntry[] = []) {
    return (
      <section>
        <div className="group-label">
          <h3>Hooks</h3>
          <div className="line" />
        </div>
        <div className="info-box info-skill">
          Lifecycle hooks and automation triggers available in this tool environment.
        </div>
        <div className="skills-list">
          {hooks.map((h) => (
            <article className="skill-row" key={`${h.cmd}-${h.name}`}>
              <div className="skill-left">
                <div className="skill-cmd">{h.cmd}</div>
                <div className="skill-auto">{h.auto ? "auto-invoked" : "user-only"}</div>
              </div>
              <div className="skill-right">
                <div className="skill-name">{h.name}</div>
                <div className="skill-desc">{h.desc}</div>
                <div className="skill-trigger">
                  <strong>Trigger:</strong> {h.trigger}
                </div>
                <pre className="skill-ex">{h.ex}</pre>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderToolPage(tool: "claude" | "cursor" | "copilot") {
    const conf = data[tool] as ToolCatalog;
    const groupValue = activeGroup[tool];
    const q = search.trim().toLowerCase();
    const commandGroups = groupValue === "all" ? conf.groups : conf.groups.filter((g) => g.id === groupValue);

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

    if (tool === "claude") {
      pills.push(
        <button
          key="skills"
          className={`pill claude ${groupValue === "skills" ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, claude: "skills" }))}
        >
          Skills
        </button>,
      );
      pills.push(
        <button
          key="agents"
          className={`pill claude ${groupValue === "agents" ? "active" : ""}`}
          onClick={() => setActiveGroup((prev) => ({ ...prev, claude: "agents" }))}
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

    if (groupValue === "skills" && tool === "claude") {
      sections.push(renderSkillsSection(conf.skills));
    } else if (groupValue === "agents" && tool === "claude") {
      sections.push(renderAgentsSection(conf.agents));
    } else if (groupValue === "hooks-meta" && conf.hooks) {
      sections.push(renderHooksSection(conf.hooks));
    } else {
      for (const g of commandGroups) {
        const filtered = g.entries.filter((e) => {
          if (!q) return true;
          return [e.cmd, e.name, e.desc].join(" ").toLowerCase().includes(q);
        });

        sections.push(
          <section key={g.id}>
            <div className="group-label" id={`${tool}-${g.id}`}>
              <h3>{g.label}</h3>
              <div className="line" />
            </div>
            <div className="cmd-grid">
              {filtered.length ? (
                filtered.map((e) => renderCommandCard(tool, e))
              ) : (
                <div className="empty">No results for {search}</div>
              )}
            </div>
          </section>,
        );
      }
    }

    if (groupValue === "all" && tool === "claude" && !q) {
      sections.push(renderSkillsSection(conf.skills));
      sections.push(renderAgentsSection(conf.agents));
    }

    if (groupValue === "all" && conf.hooks?.length && !q) {
      sections.push(renderHooksSection(conf.hooks));
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
        <nav className="pill-nav">{pills}</nav>
        {sections}
      </>
    );
  }

  function toolNav(tool: "claude" | "cursor" | "copilot", label: string, icon: React.ReactNode) {
    const active = route === tool;
    return (
      <div className={active ? "tool-open" : ""}>
        <button
          className={`nav-btn has-tooltip ${active ? "active" : ""}`}
          onClick={() => navigate(tool)}
          data-tooltip={label}
          aria-label={label}
          title={label}
        >
          <span className="nav-icon-wrap">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
        <div className="sub-nav">
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

  async function triggerBroadcast() {
    setBroadcastError("");
    setBroadcastResult(null);
    setIsBroadcasting(true);

    try {
      const notes = releaseTimeline.slice(0, 8).map((item) => `${item.title}: ${item.text}`);
      const res = await fetch("/api/notify/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(broadcastAdminKey.trim() ? { "x-admin-key": broadcastAdminKey.trim() } : {}),
        },
        body: JSON.stringify({
          version: latestVersionData.version,
          notes,
          feedSignature,
          feedTotal: feedNewCount,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as BroadcastResponse;

      if (!res.ok) {
        setBroadcastError(json.error || "Unable to send broadcast.");
        setBroadcastResult(json);
        return;
      }

      setBroadcastResult(json);
      if ((json.failed || 0) === 0) {
        setFeedHasNewEntries(false);
        setFeedLastSentAt(new Date().toISOString());
      }
    } catch {
      setBroadcastError("Unable to send broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  }

  return (
    <>
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
            <button
              className={`nav-btn has-tooltip ${route === "release-notes" ? "active" : ""}`}
              onClick={() => navigate("release-notes")}
              data-tooltip="Release notes"
              aria-label="Release notes"
              title="Release notes"
            >
              <span className="nav-icon-wrap">
                <FileText size={15} className="nav-icon" />
              </span>
              <span className="nav-label">Release notes</span>
              {route !== "release-notes" && catalogUpdateCount > 0 ? (
                <span className="nav-count" aria-label={`${catalogUpdateCount} new catalog updates`}>
                  {catalogUpdateCount}
                </span>
              ) : null}
            </button>
            <div className="sidebar-tools">
              <p className="nav-title">Tools</p>
              {toolNav("claude", "Claude", <Bot size={15} className="nav-icon" />)}
              {toolNav("cursor", "Cursor", <MousePointer2 size={15} className="nav-icon" />)}
              {toolNav("copilot", "Copilot", <Sparkles size={15} className="nav-icon" />)}
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
                            <Bot size={18} />
                          </span>
                          <span className="hero-tool-name">Claude</span>
                          <span className="hero-tool-meta">
                            {data.claude.groups.reduce((sum, g) => sum + g.entries.length, 0)} commands
                          </span>
                        </article>
                        <article className="hero-tool-item cursor" aria-label="Cursor">
                          <span className="hero-tool-icon">
                            <MousePointer2 size={18} />
                          </span>
                          <span className="hero-tool-name">Cursor</span>
                          <span className="hero-tool-meta">
                            {data.cursor.groups.reduce((sum, g) => sum + g.entries.length, 0)} commands
                          </span>
                        </article>
                        <article className="hero-tool-item copilot" aria-label="Copilot">
                          <span className="hero-tool-icon">
                            <Sparkles size={18} />
                          </span>
                          <span className="hero-tool-name">Copilot</span>
                          <span className="hero-tool-meta">
                            {data.copilot.groups.reduce((sum, g) => sum + g.entries.length, 0)} commands
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
                            <div className="maker">by {card.maker}</div>
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
                        <tr><th>Built-in commands count</th><td>Claude: 28+</td><td>Cursor: 20+</td><td>Copilot: 22+</td></tr>
                        <tr><th>Bundled skills/agents</th><td>Skills + subagents</td><td>Command packs + context tools</td><td>Modes + integrations</td></tr>
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
                      and searchability across Claude, Cursor, and Copilot references.
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

              {route === "release-notes" ? (
                <section className="policy-page">
                  <div className="modal-head" style={{ marginBottom: 12 }}>
                    <h1 className="modal-title" style={{ margin: 0 }}>Release notes</h1>
                    <button className="btn-ghost" onClick={() => navigate("landing")}>
                      <X size={14} /> Close
                    </button>
                  </div>
                  <section className="panel" style={{ marginBottom: 12 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 8 }}>Update broadcast</h3>
                    <p style={{ marginTop: 0, marginBottom: 10, color: "var(--text-2)", fontSize: 12 }}>
                      Sends release + feed update notes to subscribers.
                    </p>
                    <div className="form-grid" style={{ marginBottom: 10 }}>
                      <label className="field full">
                        <span className="field-label-row">Admin key (required in production)</span>
                        <input
                          type="password"
                          value={broadcastAdminKey}
                          onChange={(event) => setBroadcastAdminKey(event.target.value)}
                          placeholder="Enter ADMIN_BROADCAST_KEY"
                        />
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => void triggerBroadcast()}
                        disabled={
                          isBroadcasting
                          || (!feedHasNewEntries && (broadcastResult?.failed || 0) === 0)
                        }
                      >
                        {isBroadcasting ? "Sending..." : "Send update email"}
                      </button>
                      <span className="count-tag">
                        Recipients: {subscriberStats?.confirmed ?? 0}
                      </span>
                      <span className="count-tag">
                        Feed new entries: {feedNewCount}
                      </span>
                      <span className="count-tag">
                        Last sent: {feedLastSentAt ? new Date(feedLastSentAt).toLocaleString() : "Never"}
                      </span>
                    </div>
                    {broadcastError ? (
                      <div className="inline-toast error" style={{ marginTop: 10 }}>{broadcastError}</div>
                    ) : null}
                    {broadcastResult ? (
                      <div
                        className={`inline-toast ${(broadcastResult.failed || 0) > 0 ? "error" : "success"}`}
                        style={{ marginTop: 10 }}
                      >
                        {broadcastResult.message || "Broadcast completed."} Sent: {broadcastResult.sent || 0} / {broadcastResult.totalRecipients || 0}
                        {` · Failed: ${broadcastResult.failed || 0}`}
                      </div>
                    ) : null}
                    {broadcastResult?.failures?.length ? (
                      <div className="field-helper" style={{ marginTop: 8 }}>
                        Failed recipients (sample): {broadcastResult.failures.slice(0, 5).join(", ")}
                      </div>
                    ) : null}
                  </section>
                  <div className="release-list">
                    <div className="release-item" style={{ borderLeftColor: "var(--claude)" }}>
                      <div className="release-top">
                        <strong>Version {latestVersionData.version}</strong>
                        <span className="rtag rtag-change">Release</span>
                      </div>
                      <div className="release-text">Latest command catalog and GitHub release updates.</div>
                    </div>
                    {releaseTimeline.map((n, index) => {
                      const t = (n.type || "change").toLowerCase();
                      const cls = t === "new" ? "rtag-new" : t === "fix" ? "rtag-fix" : "rtag-change";
                      const left = t === "new" ? "var(--cursor)" : t === "fix" ? "var(--copilot)" : "var(--claude)";
                      return (
                        <article className="release-item" style={{ borderLeftColor: left }} key={`${n.id}-${index}`}>
                          <div className="release-top">
                            <strong className="release-strong">
                              {n.url ? (
                                <Link href={n.url} target="_blank" rel="noreferrer">
                                  {n.title || "Update"}
                                </Link>
                              ) : (
                                n.title || "Update"
                              )}
                            </strong>
                            <span className={`rtag ${cls}`}>{n.source === "feed" ? `feed ${t}` : `github ${t}`}</span>
                          </div>
                          <div className="release-text">{n.text || ""}</div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <footer className="footer">
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
          <div className="f-sub">Independent educational reference for Claude, Cursor, and Copilot</div>
        </div>
        <div className="f-right">
          <div className="f-link-row docs-row">
            <Link className="doc-link claude" href="https://docs.anthropic.com/" target="_blank" rel="noreferrer">Claude Docs</Link>
            <Link className="doc-link cursor" href="https://docs.cursor.com/" target="_blank" rel="noreferrer">Cursor Docs</Link>
            <Link className="doc-link copilot" href="https://code.visualstudio.com/docs/copilot" target="_blank" rel="noreferrer">Copilot Docs</Link>
          </div>
        </div>
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
      </footer>
    </>
  );
}
