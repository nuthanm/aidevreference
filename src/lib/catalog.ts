import catalogSeed from "../../catalog.json";
import { getCatalogSnapshotStored } from "@/lib/catalog-store";

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
  sourceFeeds: ["static-catalog-db"],
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
      skills: [
        {
          cmd: "@refactor-flow",
          name: "Refactor Flow",
          auto: false,
          desc: "Guides larger refactors with checkpoints and validation.",
          ex: "@refactor-flow split auth service",
          trigger: "When user asks for multi-file structural refactors",
          officialUrl: CURSOR_DOCS,
        },
      ],
      agents: [
        {
          name: "Codebase Explorer",
          badge: "Focused · Balanced",
          color: "#0EA5E9",
          desc: "Explores related files quickly before proposing edits.",
          tools: "Search, Read, Edit",
          model: "Cursor Agent",
          invoke: "On demand",
          when: "When broad context is needed before code changes",
          officialUrl: CURSOR_DOCS,
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
      subtitle: "Slash commands, reusable skills, and quality workflows for GitHub Copilot in VS Code.",
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
      skills: [
        {
          cmd: "/tests",
          name: "Test Scaffolding Skill",
          auto: false,
          desc: "Builds baseline unit and integration tests from local context.",
          ex: "/tests for notify route",
          trigger: "When user asks for test generation",
          officialUrl: COPILOT_DOCS,
        },
      ],
      agents: [
        {
          name: "Fix and Verify",
          badge: "Workflow · Reliable",
          color: "#10B981",
          desc: "Applies fixes, then validates diagnostics and behavior.",
          tools: "Edit, Problems, Terminal",
          model: "Copilot Agent",
          invoke: "On demand",
          when: "When handling bug fixes with follow-up validation",
          officialUrl: COPILOT_DOCS,
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
  const jsonSeed = catalogSeed as Catalog;
  const fallback: Catalog = JSON.parse(JSON.stringify(
    (jsonSeed?.tools ? jsonSeed : baseCatalog),
  ));

  let merged: Catalog = fallback;
  merged.sourceFeeds = ["json-seed-cache"];

  try {
    const snapshot = await getCatalogSnapshotStored();
    if (snapshot?.catalog?.tools) {
      merged = JSON.parse(JSON.stringify(snapshot.catalog)) as Catalog;
      merged.sourceFeeds = ["database-snapshot"];
    }
  } catch {
    // Fallback to JSON cache/base catalog when DB is unavailable.
  }

  if (!merged.generatedAt) {
    merged.generatedAt = new Date().toISOString();
  }

  if (process.env.NODE_ENV !== "production") {
    const warnings = collectCatalogValidationWarnings(merged);
    if (warnings.length) {
      console.warn("[catalog] completeness warnings:\n- " + warnings.join("\n- "));
    }
  }

  return merged;
}
