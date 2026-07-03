import type { CommandEntry } from "@/lib/catalog";

export type RunPreviewKind = "interactive" | "instant" | "workflow" | "settings";

export type RunPreviewStatus = {
  label: string;
  value: string;
  warn?: boolean;
};

export type RunPreviewMenuItem = {
  label: string;
  active?: boolean;
  muted?: boolean;
};

export type CommandRunPreviewData = {
  promptLine: string;
  surfaceLabel: string;
  previewKind: RunPreviewKind;
  title: string;
  description: string;
  status?: RunPreviewStatus[];
  menuItems?: RunPreviewMenuItem[];
  steps?: string[];
  notes?: string[];
  promptUsage?: string;
  cliUsage?: string;
  docsUrl?: string;
};

type ToolKey = "claude" | "cursor" | "copilot";

const SURFACE_LABELS: Record<ToolKey, string> = {
  claude: "Claude Code terminal",
  cursor: "Cursor agent chat",
  copilot: "GitHub Copilot chat",
};

/** Rich previews for commands with distinctive terminal UIs (docs-accurate). */
const COMMAND_RUN_OVERRIDES: Record<string, Partial<CommandRunPreviewData>> = {
  "/chrome": {
    previewKind: "settings",
    title: "Claude in Chrome (beta)",
    description:
      "Claude in Chrome works with the Chrome extension to let you control your browser directly from Claude Code. Navigate websites, fill forms, capture screenshots, record GIFs, and debug with console logs and network requests.",
    status: [
      { label: "Status", value: "Disabled until extension is installed" },
      { label: "Extension", value: "Not detected (until installed)", warn: true },
    ],
    menuItems: [
      { label: "Install Chrome extension", active: true },
      { label: "Manage permissions (requires extension)", muted: true },
      { label: "Reconnect extension (requires extension)", muted: true },
      { label: "Enabled by default: No", muted: true },
    ],
    cliUsage: "claude --chrome or claude --no-chrome",
    notes: [
      "Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings to control which sites Claude can browse, click, and type on.",
    ],
    docsUrl: "https://code.claude.com/docs/en/chrome",
  },
  "/help": {
    previewKind: "interactive",
    title: "Command Help",
    menuItems: [
      { label: "Scrollable list of slash commands", active: true },
      { label: "Type letters after / to filter", muted: true },
      { label: "Enter to select a command", muted: true },
    ],
    notes: ["Shows every command available in your environment — availability varies by plan and platform."],
  },
  "/doctor": {
    previewKind: "interactive",
    title: "Installation Doctor",
    status: [{ label: "Tip", value: "Press f to have Claude fix reported issues" }],
    menuItems: [{ label: "Diagnostics run with pass / warn / fail icons", active: true }],
  },
  "/skills": {
    previewKind: "interactive",
    menuItems: [
      { label: "Browse installed skills", active: true },
      { label: "Type to filter by name", muted: true },
      { label: "Space — toggle visibility to Claude", muted: true },
      { label: "t — sort by token count", muted: true },
    ],
  },
  "/permissions": {
    previewKind: "settings",
    menuItems: [
      { label: "View allow / ask / deny rules by scope", active: true },
      { label: "Add or remove rules", muted: true },
      { label: "Manage working directories", muted: true },
    ],
  },
  "/mcp": {
    previewKind: "settings",
    menuItems: [
      { label: "Interactive MCP server list", active: true },
      { label: "reconnect · enable · disable <server>", muted: true },
      { label: "OAuth authentication when required", muted: true },
    ],
  },
  "/plugin": {
    previewKind: "settings",
    menuItems: [
      { label: "Plugin menu", active: true },
      { label: "Subcommands: list · install · enable · disable", muted: true },
    ],
  },
  "/theme": {
    previewKind: "settings",
    menuItems: [
      { label: "Theme picker (auto, light, dark, custom…)", active: true },
      { label: "Custom themes from ~/.claude/themes/", muted: true },
    ],
  },
  "/model": {
    previewKind: "settings",
    menuItems: [
      { label: "Model picker with effort slider", active: true },
      { label: "s — switch for current session only", muted: true },
      { label: "Left / right arrows adjust effort", muted: true },
    ],
  },
  "/config": {
    previewKind: "settings",
    menuItems: [
      { label: "Settings interface (theme, model, output style…)", active: true },
      { label: "Or pass key=value pairs directly", muted: true },
    ],
    promptUsage: "/config [key=value ...]",
  },
  "/diff": {
    previewKind: "interactive",
    menuItems: [
      { label: "Interactive diff viewer opens", active: true },
      { label: "← / → switch git diff vs per-turn diffs", muted: true },
      { label: "↑ / ↓ browse files", muted: true },
    ],
  },
  "/resume": {
    previewKind: "interactive",
    menuItems: [
      { label: "Session picker with recent conversations", active: true },
      { label: "Background sessions marked with bg", muted: true },
      { label: "Or pass session ID / name directly", muted: true },
    ],
  },
  "/rewind": {
    previewKind: "interactive",
    menuItems: [
      { label: "Checkpoint picker for conversation and code", active: true },
      { label: "Roll back messages and/or file changes", muted: true },
    ],
  },
  "/context": {
    previewKind: "interactive",
    menuItems: [
      { label: "Colored grid of context usage", active: true },
      { label: "Optimization tips for heavy tools / memory", muted: true },
      { label: "Pass all to expand per-item breakdown", muted: true },
    ],
  },
  "/workflows": {
    previewKind: "interactive",
    menuItems: [
      { label: "Workflow progress view", active: true },
      { label: "Watch · pause · resume · save workflows", muted: true },
    ],
  },
};

const INSTANT_EFFECTS: Record<string, string> = {
  "/clear": "New conversation started — previous session kept in /resume",
  "/compact": "Conversation summarized — context window space freed",
  "/exit": "CLI exits (background sessions keep running if detached)",
  "/recap": "One-line session summary printed",
  "/export": "Conversation exported to clipboard or file",
  "/btw": "Side answer shown — not added to conversation history",
  "/fast": "Fast mode toggled on or off",
  "/focus": "Focus view toggled (last prompt + response only)",
  "/rename": "Session renamed on the prompt bar",
  "/feedback": "Feedback form opens with session context attached",
  "/login": "Browser or terminal auth flow starts",
  "/logout": "Signed out from Anthropic account",
  "/mobile": "QR code shown for Claude mobile app",
  "/radio": "Claude FM opens in your browser",
  "/stickers": "Sticker order flow opens",
  "/release-notes": "Interactive changelog version picker opens",
  "/reload-skills": "Skills rescanned — count of added / removed reported",
  "/reload-plugins": "Plugins reloaded — component counts and errors shown",
  "/insights": "Session analysis report generated",
  "/usage": "Session cost and plan usage breakdown shown",
  "/help": "Command list displayed",
};

const INTERACTIVE_CMDS = new Set([
  "/add-dir",
  "/advisor",
  "/agents",
  "/branch",
  "/cd",
  "/color",
  "/config",
  "/context",
  "/desktop",
  "/doctor",
  "/effort",
  "/hooks",
  "/ide",
  "/keybindings",
  "/memory",
  "/mcp",
  "/model",
  "/permissions",
  "/plugin",
  "/powerup",
  "/remote-env",
  "/scroll-speed",
  "/status",
  "/statusline",
  "/tasks",
  "/teleport",
  "/terminal-setup",
  "/theme",
  "/tui",
  "/update-config",
  "/usage-credits",
  "/voice",
]);

const WORKFLOW_CMDS = new Set([
  "/plan",
  "/review",
  "/code-review",
  "/security-review",
  "/simplify",
  "/batch",
  "/background",
  "/deep-research",
  "/ultraplan",
  "/autofix-pr",
  "/design-sync",
  "/design-login",
  "/schedule",
  "/fork",
  "/goal",
  "/artifact-design",
  "/team-onboarding",
  "/install-github-app",
  "/install-slack-app",
  "/init",
  "/run",
  "/verify",
  "/debug",
]);

function commandUsage(cmd: string, ex: string, usage?: string) {
  if (usage) return usage;
  if (ex === cmd) return cmd;
  const cmdTrim = cmd.trim();
  const exTrim = ex.trim();
  if (exTrim.startsWith(cmdTrim)) {
    const tail = exTrim.slice(cmdTrim.length).trim();
    if (!tail) return cmdTrim;
    return `${cmdTrim} ${tail
      .split(/\s+/)
      .map((part) => (part.startsWith("--") || part.startsWith("@") ? part : `<${part}>`))
      .join(" ")}`;
  }
  return cmdTrim;
}

function inferPreviewKind(entry: CommandEntry): RunPreviewKind {
  if (INTERACTIVE_CMDS.has(entry.cmd) || entry.badge === "ide") {
    return entry.badge === "ide" ? "settings" : "interactive";
  }
  if (WORKFLOW_CMDS.has(entry.cmd) || entry.badge === "wf") {
    return "workflow";
  }
  if (INSTANT_EFFECTS[entry.cmd] || entry.badge === "chat") {
    return "instant";
  }
  return "interactive";
}

function inferStatus(entry: CommandEntry, kind: RunPreviewKind): RunPreviewStatus[] | undefined {
  const instant = INSTANT_EFFECTS[entry.cmd];
  if (instant) {
    return [{ label: "Result", value: instant }];
  }

  if (kind === "workflow") {
    const arg = entry.ex.slice(entry.cmd.length).trim();
    return [
      {
        label: "Mode",
        value: arg ? `Runs with your input: “${arg}”` : "Waits for your goal if none provided",
      },
    ];
  }

  if (kind === "settings") {
    return [{ label: "UI", value: "Interactive panel in the terminal" }];
  }

  return undefined;
}

function inferMenuItems(entry: CommandEntry, kind: RunPreviewKind): RunPreviewMenuItem[] | undefined {
  if (kind === "instant") return undefined;

  const arg = entry.ex.slice(entry.cmd.length).trim();

  if (kind === "workflow") {
    return [
      { label: `“${entry.name}” workflow starts`, active: true },
      { label: "Claude may read files, run tools, or ask for approval", muted: true },
      { label: arg ? `Your prompt: ${arg}` : `Add a goal after ${entry.cmd}`, muted: true },
      { label: "Progress shown in the session", muted: true },
    ];
  }

  if (kind === "settings" || kind === "interactive") {
    const items: RunPreviewMenuItem[] = [
      { label: `${entry.name} — interactive terminal UI`, active: true },
      { label: "Arrow keys navigate · Enter confirms · Esc cancels", muted: true },
    ];
    if (arg) {
      items.push({ label: `Pre-filled from your example: ${arg}`, muted: true });
    }
    return items;
  }

  return undefined;
}

function inferSteps(
  entry: CommandEntry,
  usage: string,
  tool: ToolKey,
  kind: RunPreviewKind,
): string[] | undefined {
  if (kind !== "instant") return undefined;

  const surface = SURFACE_LABELS[tool];
  return [
    `Open ${surface}`,
    `Type ${entry.ex} at the prompt and press Enter`,
    INSTANT_EFFECTS[entry.cmd] ?? entry.desc,
  ];
}

function inferNotes(entry: CommandEntry, kind: RunPreviewKind, tool: ToolKey): string[] | undefined {
  const notes: string[] = [];

  if (tool !== "claude") {
    notes.push(`In ${SURFACE_LABELS[tool]}, type the command at the chat prompt.`);
  }

  if (kind === "workflow") {
    notes.push("Output is approximate — exact prompts vary by version and plan.");
  } else if (kind === "interactive" || kind === "settings") {
    notes.push("Simulated preview — your terminal may show different options based on setup.");
  } else {
    notes.push("Simulated instant effect — run the command to see live output.");
  }

  return notes.length ? notes : undefined;
}

function mergeDefined<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export function buildCommandRunPreview(
  entry: CommandEntry,
  tool: ToolKey = "claude",
): CommandRunPreviewData {
  const usage = commandUsage(entry.cmd, entry.ex, entry.usage);
  const override = COMMAND_RUN_OVERRIDES[entry.cmd] ?? {};
  const previewKind = override.previewKind ?? inferPreviewKind(entry);

  const inferred: Partial<CommandRunPreviewData> = {
    previewKind,
    title: entry.name,
    description: entry.desc,
    status: inferStatus(entry, previewKind),
    menuItems: inferMenuItems(entry, previewKind),
    steps: inferSteps(entry, usage, tool, previewKind),
    notes: inferNotes(entry, previewKind, tool),
    promptUsage: usage,
    docsUrl: entry.officialUrl,
  };

  const merged = mergeDefined(
    {
      promptLine: entry.ex,
      surfaceLabel: SURFACE_LABELS[tool],
      previewKind,
      title: entry.name,
      description: entry.desc,
      promptUsage: usage,
      docsUrl: entry.officialUrl,
    },
    mergeDefined(inferred, override),
  );

  if (merged.menuItems?.length) {
    merged.steps = override.steps;
  } else if (!merged.steps?.length && !override.steps) {
    merged.steps = [
      `Open ${merged.surfaceLabel}`,
      `Run: ${entry.ex}`,
      merged.description,
    ];
  }

  if (override.steps) {
    merged.steps = override.steps;
  }

  return merged;
}

export function commandEntryKey(entry: CommandEntry) {
  return `${entry.cmd}|${entry.name}`;
}

export function previewKindLabel(kind: RunPreviewKind) {
  if (kind === "instant") return "Runs immediately";
  if (kind === "workflow") return "Multi-step workflow";
  if (kind === "settings") return "Settings panel";
  return "Interactive picker";
}
