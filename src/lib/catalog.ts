export type Badge = "skill" | "wf" | "chat" | "ide";

export type CommandEntry = {
  cmd: string;
  name: string;
  desc: string;
  ex: string;
  badge?: Badge;
  officialUrl?: string;
};

export type Group = {
  id: string;
  label: string;
  entries: CommandEntry[];
};

export type SkillEntry = {
  cmd: string;
  name: string;
  auto: boolean;
  desc: string;
  ex: string;
  trigger: string;
  officialUrl?: string;
};

export type AgentEntry = {
  name: string;
  badge: string;
  color: string;
  desc: string;
  tools: string;
  model: string;
  invoke: string;
  when: string;
  officialUrl?: string;
};

export type HookEntry = {
  cmd: string;
  name: string;
  auto: boolean;
  desc: string;
  ex: string;
  trigger: string;
  officialUrl?: string;
};

export type ToolCatalog = {
  maker: string;
  subtitle: string;
  officialDocs: string[];
  groups: Group[];
  skills?: SkillEntry[];
  agents?: AgentEntry[];
  hooks?: HookEntry[];
};

export type Catalog = {
  generatedAt: string;
  sourceFeeds: string[];
  tools: Record<"claude" | "cursor" | "copilot", ToolCatalog>;
};

const CLAUDE_DOCS = "https://docs.anthropic.com/en/docs/claude-code";
const CURSOR_DOCS = "https://docs.cursor.com";
const COPILOT_DOCS = "https://code.visualstudio.com/docs/copilot";

export const baseCatalog: Catalog = {
  generatedAt: new Date().toISOString(),
  sourceFeeds: [
    "https://raw.githubusercontent.com/nuthanm/aidevreference/main/catalog.json",
  ],
  tools: {
    claude: {
      maker: "Anthropic",
      subtitle: "Slash commands, skills, subagents, and workflow hooks for Claude Code environments.",
      officialDocs: [CLAUDE_DOCS],
      groups: [
        {
          id: "core",
          label: "Core Commands",
          entries: [
            { cmd: "/help", name: "Show Help", desc: "Lists available commands.", ex: "/help", badge: "chat", officialUrl: CLAUDE_DOCS },
            { cmd: "/review", name: "Code Review", desc: "Performs severity-first review of selected changes.", ex: "/review", badge: "wf", officialUrl: CLAUDE_DOCS },
            { cmd: "/plan", name: "Build Plan", desc: "Creates a concise execution plan before coding.", ex: "/plan add billing retry", badge: "wf", officialUrl: CLAUDE_DOCS },
            { cmd: "/mcp list", name: "List MCP Servers", desc: "Shows configured MCP servers and capabilities.", ex: "/mcp list", badge: "ide", officialUrl: CLAUDE_DOCS },
          ],
        },
      ],
      skills: [
        {
          cmd: "/project-setup-info-local",
          name: "Project Setup Info",
          auto: true,
          desc: "Scaffolding guidance for complete project setup.",
          ex: "/project-setup-info-local setup Next.js app",
          trigger: "When user asks to initialize a full project",
          officialUrl: CLAUDE_DOCS,
        },
      ],
      agents: [
        {
          name: "Explore",
          badge: "Read-only · Sonnet",
          color: "#0EA5E9",
          desc: "Fast exploration and retrieval across workspace files.",
          tools: "Read, Search, Grep",
          model: "Sonnet",
          invoke: "Automatic",
          when: "When broad context gathering is needed",
          officialUrl: CLAUDE_DOCS,
        },
      ],
      hooks: [
        {
          cmd: "onRouteChange",
          name: "Route Transition Hook",
          auto: true,
          desc: "Resets scroll and updates active route state.",
          ex: "window.scrollTo(0,0)",
          trigger: "Runs when route changes",
          officialUrl: CLAUDE_DOCS,
        },
      ],
    },
    cursor: {
      maker: "Anysphere",
      subtitle: "Commands, automation hooks, and IDE workflows for Cursor.",
      officialDocs: [CURSOR_DOCS],
      groups: [
        {
          id: "core",
          label: "Core Commands",
          entries: [
            { cmd: "/chat", name: "Composer Chat", desc: "Open contextual chat.", ex: "/chat explain auth flow", badge: "chat", officialUrl: CURSOR_DOCS },
            { cmd: "/edit", name: "Inline Edit", desc: "Apply focused edits to selected code.", ex: "/edit simplify function", badge: "ide", officialUrl: CURSOR_DOCS },
            { cmd: "/agent", name: "Agent Mode", desc: "Run multi-step autonomous coding task.", ex: "/agent add caching", badge: "wf", officialUrl: CURSOR_DOCS },
          ],
        },
      ],
      hooks: [
        {
          cmd: "pre-command",
          name: "Pre-command Validation",
          auto: true,
          desc: "Validates command intent against workspace rules.",
          ex: "check .cursor/rules",
          trigger: "Runs before command execution",
          officialUrl: CURSOR_DOCS,
        },
      ],
    },
    copilot: {
      maker: "Microsoft/GitHub",
      subtitle: "Slash commands and quality workflows for GitHub Copilot in VS Code.",
      officialDocs: [COPILOT_DOCS],
      groups: [
        {
          id: "chat",
          label: "Chat Commands",
          entries: [
            { cmd: "/explain", name: "Explain Code", desc: "Explain selected code behavior.", ex: "/explain this module", badge: "chat", officialUrl: COPILOT_DOCS },
            { cmd: "/fix", name: "Fix Issues", desc: "Fixes current diagnostics with proposed edits.", ex: "/fix this file", badge: "wf", officialUrl: COPILOT_DOCS },
            { cmd: "/tests", name: "Create Tests", desc: "Generate tests from context.", ex: "/tests for auth", badge: "wf", officialUrl: COPILOT_DOCS },
          ],
        },
      ],
      hooks: [
        {
          cmd: "diagnostic-sync",
          name: "Diagnostics Hook",
          auto: true,
          desc: "Synchronizes diagnostic context into chat responses.",
          ex: "read Problems panel before /fix",
          trigger: "Runs when diagnostics update",
          officialUrl: COPILOT_DOCS,
        },
      ],
    },
  },
};

function mergeUniqueBy<T>(base: T[], incoming: T[], keyFn: (item: T) => string) {
  const seen = new Set(base.map((item) => keyFn(item)));
  for (const item of incoming) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      base.push(item);
      seen.add(key);
    }
  }
}

function mergeGroups(base: Group[], incoming: Group[]) {
  const groupMap = new Map(base.map((g) => [g.id, g]));
  for (const remoteGroup of incoming) {
    if (!remoteGroup?.id || !Array.isArray(remoteGroup.entries)) continue;
    const current = groupMap.get(remoteGroup.id);
    if (!current) {
      base.push({
        id: remoteGroup.id,
        label: remoteGroup.label || remoteGroup.id,
        entries: [...remoteGroup.entries],
      });
      continue;
    }
    if (remoteGroup.label) current.label = remoteGroup.label;
    mergeUniqueBy(current.entries, remoteGroup.entries, (e) => `${e.cmd}|${e.name}`);
  }
}

function mergeCatalog(base: Catalog, incoming: Partial<Catalog>) {
  if (!incoming?.tools) return;
  const tools = ["claude", "cursor", "copilot"] as const;

  for (const tool of tools) {
    const remoteTool = incoming.tools?.[tool];
    if (!remoteTool) continue;

    const target = base.tools[tool];
    if (remoteTool.subtitle) target.subtitle = remoteTool.subtitle;
    if (remoteTool.maker) target.maker = remoteTool.maker;

    if (Array.isArray(remoteTool.officialDocs)) {
      mergeUniqueBy(target.officialDocs, remoteTool.officialDocs, (v) => v);
    }

    if (Array.isArray(remoteTool.groups)) {
      mergeGroups(target.groups, remoteTool.groups);
    }

    if (Array.isArray(remoteTool.skills)) {
      if (!target.skills) target.skills = [];
      mergeUniqueBy(target.skills, remoteTool.skills, (s) => `${s.cmd}|${s.name}`);
    }

    if (Array.isArray(remoteTool.agents)) {
      if (!target.agents) target.agents = [];
      mergeUniqueBy(target.agents, remoteTool.agents, (a) => `${a.name}`);
    }

    if (Array.isArray(remoteTool.hooks)) {
      if (!target.hooks) target.hooks = [];
      mergeUniqueBy(target.hooks, remoteTool.hooks, (h) => `${h.cmd}|${h.name}`);
    }
  }
}

export function collectCatalogValidationWarnings(catalog: Catalog) {
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
        if (!entry.cmd?.trim()) warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].cmd is missing`);
        if (!entry.name?.trim()) warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].name is missing`);
        if (!entry.desc?.trim()) warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].desc is missing`);
        if (!entry.ex?.trim()) warnings.push(`tools.${tool}.groups.${groupLabel}.entries[${entryIndex}].ex is missing`);
      });
    });
  }

  return warnings;
}

export async function getMergedCatalog(): Promise<Catalog> {
  const merged: Catalog = JSON.parse(JSON.stringify(baseCatalog));
  const envFeeds = process.env.CATALOG_FEEDS?.split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const feeds = envFeeds?.length ? envFeeds : baseCatalog.sourceFeeds;
  merged.sourceFeeds = [...feeds];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data || typeof data !== "object") continue;
      if (data.tools) {
        mergeCatalog(merged, data as Partial<Catalog>);
      } else {
        mergeCatalog(merged, { tools: data } as Partial<Catalog>);
      }
    } catch {
      // ignore feed failures
    }
  }

  merged.generatedAt = new Date().toISOString();

  if (process.env.NODE_ENV !== "production") {
    const warnings = collectCatalogValidationWarnings(merged);
    if (warnings.length) {
      console.warn("[catalog] completeness warnings:\n- " + warnings.join("\n- "));
    }
  }

  return merged;
}
