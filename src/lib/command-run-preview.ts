import type { AgentEntry, CommandEntry, HookEntry, SkillEntry } from "@/lib/catalog";
import {
  effectiveSurfaces,
  renderSurfaceLabels,
  surfaceTagLabel,
  type CatalogTool,
  type SurfaceId,
} from "@/lib/catalog-surfaces";

export type RunPreviewKind = "interactive" | "instant" | "workflow" | "settings" | "config" | "automatic";

export type SurfaceRunGuide = {
  surface: string;
  whereToAccess: string;
  howToRun: string[];
  expectedOutput: string;
};

export type EntryRunPreviewData = {
  entryKind: "command" | "skill" | "agent" | "hook";
  tool: CatalogTool;
  toolLabel: string;
  name: string;
  purpose: string;
  surfaces: string[];
  example: string;
  usage?: string;
  configPath?: string;
  configExample?: string;
  surfaceGuides: SurfaceRunGuide[];
  notes?: string[];
  docsUrl?: string;
  previewKind: RunPreviewKind;
  promptLine?: string;
};

/** @deprecated Use EntryRunPreviewData — kept for gradual migration */
export type CommandRunPreviewData = EntryRunPreviewData;

type ToolKey = CatalogTool;

const TOOL_LABELS: Record<ToolKey, string> = {
  claude: "Claude",
  cursor: "Cursor",
  copilot: "Copilot",
};

const ACCESS = {
  claudeTerminal: {
    where: "Open a terminal in your project folder and run `claude` to start a Claude Code session.",
    howIntro: "At the Claude Code prompt",
  },
  cursorIde: {
    where: "Open Cursor IDE. Press Ctrl+L (Win/Linux) or Cmd+L (macOS) to open Agent chat, or Ctrl+I for the side panel.",
    howIntro: "In the Agent chat input",
  },
  copilot: {
    "copilot-vscode": {
      where: "Open VS Code with GitHub Copilot enabled. Open Chat with Ctrl+Alt+I (Win/Linux) or Control+Command+I (macOS).",
      howIntro: "In the Copilot Chat panel",
    },
    "copilot-jetbrains": {
      where: "Open a JetBrains IDE with the GitHub Copilot plugin installed. Open the Copilot chat tool window from the right sidebar.",
      howIntro: "In the Copilot chat tool window",
    },
    "copilot-visualstudio": {
      where: "Open Visual Studio with GitHub Copilot. Open Chat from View → GitHub Copilot Chat.",
      howIntro: "In the Copilot Chat window",
    },
  } satisfies Partial<Record<SurfaceId, { where: string; howIntro: string }>>,
};

const COPILOT_DOCS = {
  cheatSheet: "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet",
  smartActions: "https://code.visualstudio.com/docs/editing/copilot-smart-actions",
  chatContext: "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context",
} as const;

const INSTANT_EFFECTS: Record<string, string> = {
  "/clear": "A fresh conversation starts. The previous session remains available under /resume.",
  "/compact": "The conversation is summarized and context window space is freed.",
  "/exit": "Claude Code exits. Background sessions keep running if already detached.",
  "/recap": "A one-line summary of the current session is printed in the terminal.",
  "/export": "The conversation is copied to your clipboard or saved to a file.",
  "/btw": "A side answer appears in an overlay — it is not added to the conversation history.",
  "/fast": "Fast mode toggles on or off for quicker responses.",
  "/focus": "Focus view toggles to show only the last prompt and response.",
  "/rename": "The session name updates in the prompt bar.",
  "/feedback": "A feedback form opens with your session context attached.",
  "/login": "A browser or terminal authentication flow starts.",
  "/logout": "You are signed out from your Anthropic account.",
  "/mobile": "A QR code is shown to link the Claude mobile app.",
  "/radio": "Claude FM opens in your default browser.",
  "/stickers": "The sticker order flow opens in your browser.",
  "/release-notes": "An interactive changelog version picker opens.",
  "/reload-skills": "Skills are rescanned — added and removed skill counts are reported.",
  "/reload-plugins": "Plugins reload — component counts and any errors are shown.",
  "/insights": "A session analysis report is generated in the terminal.",
  "/usage": "Session cost and plan usage breakdown is printed.",
  "/help": "A scrollable list of available slash commands is displayed.",
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
  "/skills",
  "/diff",
  "/resume",
  "/rewind",
  "/workflows",
  "/chrome",
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

type CommandOverride = {
  previewKind?: RunPreviewKind;
  purpose?: string;
  promptLine?: string;
  howToRun?: string[];
  expectedOutput?: string;
  whereToAccess?: string;
  notes?: string[];
  docsUrl?: string;
  cliUsage?: string;
};

const CLAUDE_COMMAND_OVERRIDES: Record<string, CommandOverride> = {
  "/chrome": {
    previewKind: "settings",
    purpose:
      "Configure Claude in Chrome — browser control, screenshots, form filling, and debugging via the Chrome extension.",
    howToRun: [
      "Run `/chrome` in Claude Code",
      "Choose Install Chrome extension if not yet installed",
      "Use `claude --chrome` or `claude --no-chrome` to control the default at launch",
    ],
    expectedOutput:
      "An interactive settings panel showing extension status, permission controls, and reconnect options.",
    notes: [
      "Site permissions inherit from the Chrome extension settings.",
      "CLI flags: `claude --chrome` or `claude --no-chrome`.",
    ],
    docsUrl: "https://code.claude.com/docs/en/chrome",
  },
  "/help": {
    previewKind: "interactive",
    howToRun: ["Run `/help`", "Scroll the list or type letters after `/` to filter", "Press Enter to select a command"],
    expectedOutput: "A scrollable list of every slash command available in your environment.",
  },
  "/doctor": {
    previewKind: "interactive",
    howToRun: ["Run `/doctor`", "Review pass / warn / fail icons for each check", "Press f to let Claude fix reported issues"],
    expectedOutput: "A diagnostics report for installation, auth, MCP servers, and connectivity.",
  },
  "/skills": {
    previewKind: "interactive",
    howToRun: [
      "Run `/skills`",
      "Type to filter by skill name",
      "Press Space to toggle visibility · t to sort by token count",
    ],
    expectedOutput: "An interactive browser of installed skills with visibility and token counts.",
  },
  "/desktop": {
    previewKind: "workflow",
    howToRun: ["Run `/desktop` in Claude Code", "Confirm handoff when prompted"],
    expectedOutput: "The current session continues in the Claude Code Desktop app.",
    notes: ["Requires the Claude Code Desktop app installed."],
  },
  "/ide": {
    previewKind: "settings",
    howToRun: ["Run `/ide` in Claude Code", "Follow prompts to connect or disconnect your IDE"],
    expectedOutput: "Connection status and options for IDE integrations (diagnostics, selections, diffs).",
  },
};

const COPILOT_COMMAND_OVERRIDES: Record<string, CommandOverride> = {
  "/explain|Explain Code": {
    previewKind: "workflow",
    promptLine: "/explain",
    howToRun: [
      "Select code in the editor (or place the cursor in a file)",
      "Right-click → Explain, or open Chat and type `/explain`",
      "Press Enter — Copilot explains the code in the chat response",
    ],
    expectedOutput: "A natural-language explanation of the selected code or concept in Chat.",
    notes: ["The context menu sends `/explain` with your selection attached automatically."],
    docsUrl: COPILOT_DOCS.smartActions,
  },
  "/fix|Fix Issues": {
    previewKind: "workflow",
    promptLine: "/fix",
    howToRun: [
      "Select code with a diagnostic, or open a file with errors",
      "Right-click → Generate Code → Fix, use the lightbulb Fix action, or type `/fix` in Chat",
      "Review the proposed fix and click Apply if it looks correct",
    ],
    expectedOutput: "Copilot proposes a corrected version of the code you can apply inline or from Chat.",
    docsUrl: COPILOT_DOCS.smartActions,
  },
  "/tests|Generate Tests": {
    previewKind: "workflow",
    promptLine: "/tests",
    howToRun: [
      "Select a function to test (optional — covers all uncovered symbols if none selected)",
      "Right-click → Generate Code → Generate Tests, or type `/tests` in Chat",
      "Accept the generated tests in an existing or new test file",
    ],
    expectedOutput: "Unit tests written using your project's detected test framework.",
    docsUrl: COPILOT_DOCS.cheatSheet,
  },
  "/doc|Add Documentation": {
    previewKind: "workflow",
    promptLine: "/doc",
    howToRun: [
      "Select code to document (optional — uses code near the cursor if none selected)",
      "Right-click → Generate Code → Generate Docs, or type `/doc` in Chat",
      "Accept the documentation comments added to your code",
    ],
    expectedOutput: "Documentation comments (XML, JSDoc, etc.) added to the selected symbols.",
    docsUrl: COPILOT_DOCS.smartActions,
  },
  "/optimize|Optimize Code": {
    previewKind: "workflow",
    promptLine: "/optimize",
    howToRun: [
      "Select the code block to optimize",
      "Right-click → Optimize Selection, or type `/optimize` in Chat",
      "Review performance and maintainability suggestions",
    ],
    expectedOutput: "Suggested improvements for the selected code block in Chat.",
    docsUrl: COPILOT_DOCS.cheatSheet,
  },
  "Explain|Explain the Code": {
    previewKind: "workflow",
    promptLine: "Right-click → Explain",
    howToRun: [
      "Select code in the editor",
      "Right-click and choose Explain",
      "Chat opens with `/explain` and your selection attached",
    ],
    expectedOutput: "An explanation of the selected code in the Chat panel.",
    docsUrl: COPILOT_DOCS.smartActions,
  },
  "Add to Chat|Add to Chat": {
    previewKind: "instant",
    promptLine: "Right-click → Add to Chat",
    howToRun: [
      "Select code in the editor",
      "Right-click and choose Add to Chat",
      "Type your custom prompt referencing the attached selection",
    ],
    expectedOutput: "The selection appears as #selection context in Chat — no slash command is sent.",
    notes: ["Use this to reference code in a custom prompt without a built-in action."],
    docsUrl: COPILOT_DOCS.chatContext,
  },
  "Review|Review Selection": {
    previewKind: "workflow",
    promptLine: "Right-click → Generate Code → Review",
    howToRun: [
      "Select a block of code",
      "Right-click → Generate Code → Review",
      "Read inline review comments and the Comments panel",
    ],
    expectedOutput: "Review comments appear inline in the editor and in the Comments panel.",
    notes: ["For uncommitted changes, use Code Review in the Source Control view."],
    docsUrl: COPILOT_DOCS.smartActions,
  },
};

export function commandUsage(cmd: string, ex: string, usage?: string) {
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

function inferInstantOutput(cmd: string, desc: string): string {
  return INSTANT_EFFECTS[cmd] ?? desc;
}

function inferWorkflowOutput(entry: CommandEntry): string {
  const arg = entry.ex.slice(entry.cmd.length).trim();
  if (arg) {
    return `Claude runs the “${entry.name}” workflow with your input (“${arg}”), reading files and using tools until the task completes or asks for approval.`;
  }
  return `Claude starts the “${entry.name}” workflow, reads relevant files, runs tools, and reports progress in the session.`;
}

function inferInteractiveOutput(entry: CommandEntry): string {
  return `An interactive ${entry.name.toLowerCase()} panel opens in the terminal — navigate with arrow keys, confirm with Enter, cancel with Esc.`;
}

function buildClaudeTerminalGuide(
  entry: { cmd?: string; name: string; ex: string; desc: string },
  kind: RunPreviewKind,
  override?: CommandOverride,
): SurfaceRunGuide {
  const cmd = entry.cmd ?? entry.ex;
  const howToRun =
    override?.howToRun ??
    (kind === "instant"
      ? [`${ACCESS.claudeTerminal.howIntro}, type \`${entry.ex}\` and press Enter`]
      : kind === "workflow"
        ? [
            `${ACCESS.claudeTerminal.howIntro}, type \`${entry.ex}\` and press Enter`,
            "Approve tool use when prompted",
            "Follow Claude's progress in the session transcript",
          ]
        : [
            `${ACCESS.claudeTerminal.howIntro}, type \`${cmd}\` and press Enter`,
            "Use arrow keys to navigate · Enter to confirm · Esc to cancel",
          ]);

  const expectedOutput =
    override?.expectedOutput ??
    (kind === "instant"
      ? inferInstantOutput(cmd, entry.desc)
      : kind === "workflow"
        ? inferWorkflowOutput(entry as CommandEntry)
        : inferInteractiveOutput(entry as CommandEntry));

  return {
    surface: "Terminal",
    whereToAccess: override?.whereToAccess ?? ACCESS.claudeTerminal.where,
    howToRun,
    expectedOutput,
  };
}

function buildCursorIdeGuide(
  entry: { cmd?: string; name: string; ex: string; desc: string },
  kind: RunPreviewKind,
): SurfaceRunGuide {
  const line = entry.cmd ?? entry.ex;
  const howToRun =
    kind === "automatic"
      ? ["No manual step — Cursor invokes this automatically when the trigger condition matches"]
      : [
          `${ACCESS.cursorIde.howIntro}, type \`${entry.ex}\` and press Enter`,
          "Add @file, @codebase, or other context mentions if needed",
        ];

  const expectedOutput =
    kind === "automatic"
      ? `Cursor runs “${entry.name}” automatically — ${entry.desc}`
      : kind === "workflow"
        ? `Cursor's agent reads context, proposes edits or answers, and shows diffs you can accept or reject.`
        : `A chat response or inline edit based on “${entry.name}”.`;

  return {
    surface: "IDE",
    whereToAccess: ACCESS.cursorIde.where,
    howToRun,
    expectedOutput,
  };
}

function buildCopilotSurfaceGuide(
  surfaceId: SurfaceId,
  entry: { cmd?: string; name: string; ex: string; desc: string },
  override?: CommandOverride,
): SurfaceRunGuide | null {
  const access = ACCESS.copilot[surfaceId as keyof typeof ACCESS.copilot];
  if (!access) return null;

  const tag = surfaceTagLabel(surfaceId);
  const isContextMenu = !entry.cmd?.startsWith("/");

  const howToRun =
    override?.howToRun ??
    (isContextMenu
      ? [
          "Select code in the editor",
          `Use the editor context menu: ${entry.ex}`,
          "Review Copilot's response in Chat or inline",
        ]
      : [
          `${access.howIntro}, type \`${entry.ex}\` and press Enter`,
          "Attach #selection or #file context if needed",
        ]);

  return {
    surface: tag,
    whereToAccess: override?.whereToAccess ?? access.where,
    howToRun,
    expectedOutput:
      override?.expectedOutput ??
      (isContextMenu
        ? `Copilot runs the “${entry.name}” smart action on your selection.`
        : `Copilot responds in Chat with results for “${entry.name}”.`),
  };
}

function buildSurfaceGuidesForEntry(
  tool: ToolKey,
  surfaces: SurfaceId[],
  entry: { cmd?: string; name: string; ex: string; desc: string },
  kind: RunPreviewKind,
  override?: CommandOverride,
): SurfaceRunGuide[] {
  if (tool === "claude") {
    const guides: SurfaceRunGuide[] = [buildClaudeTerminalGuide(entry, kind, override)];

    for (const id of surfaces) {
      if (id === "claude-code") continue;
      const tag = surfaceTagLabel(id);
      let extra: SurfaceRunGuide | null = null;

      if (id === "claude-desktop") {
        extra = {
          surface: tag,
          whereToAccess: "Install the Claude Code Desktop app from Anthropic.",
          howToRun: ["Run `/desktop` in Claude Code", "Confirm the handoff when prompted"],
          expectedOutput: "Your session continues in the Desktop app with the same context.",
        };
      } else if (id === "claude-ide") {
        extra = {
          surface: tag,
          whereToAccess: "Install the Claude IDE extension for VS Code or JetBrains.",
          howToRun: ["Run `/ide` in Claude Code to connect", "Use your IDE normally — Claude reads selections and diagnostics"],
          expectedOutput: "IDE connection status and live context sharing between your editor and Claude Code.",
        };
      } else if (id === "claude-chrome") {
        extra = {
          surface: tag,
          whereToAccess: "Install the Claude in Chrome extension from the Chrome Web Store.",
          howToRun: ["Run `/chrome` in Claude Code", "Install or reconnect the extension from the settings panel"],
          expectedOutput: "Browser control, screenshots, and debugging from Claude Code via the extension.",
        };
      } else if (id === "claude-mobile") {
        extra = {
          surface: tag,
          whereToAccess: "Install the Claude mobile app (iOS or Android).",
          howToRun: ["Run `/mobile` in Claude Code", "Scan the QR code with your phone"],
          expectedOutput: "A QR code linking your mobile app to your account or session.",
        };
      } else if (id === "slack") {
        extra = {
          surface: tag,
          whereToAccess: "Your Slack workspace with admin approval for app installs.",
          howToRun: ["Run `/install-slack-app` in Claude Code", "Complete OAuth in the browser"],
          expectedOutput: "The Claude Slack app is installed and available in your workspace.",
        };
      } else if (id === "github-actions") {
        extra = {
          surface: tag,
          whereToAccess: "A GitHub repository where you have admin access.",
          howToRun: ["Run `/install-github-app` in Claude Code", "Follow the GitHub App install flow"],
          expectedOutput: "The Claude GitHub App is installed with optional Actions workflow setup.",
        };
      } else if (id === "remote") {
        extra = {
          surface: tag,
          whereToAccess: "claude.ai in your browser, signed in to the same account.",
          howToRun: ["Run `/remote-control` in Claude Code", "Open claude.ai to control this session remotely"],
          expectedOutput: "The session becomes available for remote control from the web.",
        };
      }

      if (extra) guides.push(extra);
    }

    return guides;
  }

  if (tool === "cursor") {
    return [buildCursorIdeGuide(entry, kind)];
  }

  const guides: SurfaceRunGuide[] = [];
  for (const id of surfaces) {
    const guide = buildCopilotSurfaceGuide(id, entry, override);
    if (guide) guides.push(guide);
  }
  return guides.length ? guides : [buildCopilotSurfaceGuide("copilot-vscode", entry, override)!];
}

function resolveCommandOverride(entry: CommandEntry, tool: ToolKey): CommandOverride | undefined {
  const key = commandEntryKey(entry);
  if (tool === "copilot") return COPILOT_COMMAND_OVERRIDES[key];
  return CLAUDE_COMMAND_OVERRIDES[entry.cmd];
}

export function buildCommandRunPreview(entry: CommandEntry, tool: ToolKey = "claude"): EntryRunPreviewData {
  const usage = commandUsage(entry.cmd, entry.ex, entry.usage);
  const override = resolveCommandOverride(entry, tool);
  const previewKind = override?.previewKind ?? inferPreviewKind(entry);
  const surfaces = effectiveSurfaces(tool, entry.surfaces);
  const surfaceGuides = buildSurfaceGuidesForEntry(tool, surfaces, entry, previewKind, override);

  return {
    entryKind: "command",
    tool,
    toolLabel: TOOL_LABELS[tool],
    name: entry.cmd,
    purpose: override?.purpose ?? entry.desc,
    surfaces: renderSurfaceLabels(tool, entry.surfaces),
    example: entry.ex,
    usage,
    surfaceGuides,
    notes: override?.notes,
    docsUrl: override?.docsUrl ?? entry.officialUrl,
    previewKind,
    promptLine: override?.promptLine ?? entry.ex,
  };
}

export function buildSkillRunPreview(skill: SkillEntry, tool: ToolKey): EntryRunPreviewData {
  const usage = commandUsage(skill.cmd, skill.ex, skill.usage);
  const kind: RunPreviewKind = skill.auto ? "automatic" : "workflow";
  const surfaces = effectiveSurfaces(tool, skill.surfaces);
  const entry = { cmd: skill.cmd, name: skill.name, ex: skill.ex, desc: skill.desc };
  const surfaceGuides = buildSurfaceGuidesForEntry(tool, surfaces, entry, kind);

  const purpose = skill.auto
    ? `${skill.desc} Trigger: ${skill.trigger}`
    : `${skill.desc} Invoke explicitly when: ${skill.trigger}`;

  return {
    entryKind: "skill",
    tool,
    toolLabel: TOOL_LABELS[tool],
    name: skill.cmd,
    purpose,
    surfaces: renderSurfaceLabels(tool, skill.surfaces),
    example: skill.ex,
    usage,
    configPath: skill.configPath,
    configExample: skill.configExample,
    surfaceGuides,
    docsUrl: skill.officialUrl,
    previewKind: kind,
    promptLine: skill.ex,
    notes: skill.auto
      ? ["Auto-invoked — Cursor/Claude matches your request to this skill's trigger."]
      : ["User-only — you must invoke this skill explicitly."],
  };
}

export function buildAgentRunPreview(agent: AgentEntry, tool: ToolKey): EntryRunPreviewData {
  const surfaces = effectiveSurfaces(tool, agent.surfaces);
  const kind: RunPreviewKind = agent.invoke.toLowerCase().includes("automatic") ? "automatic" : "workflow";
  const entry = { name: agent.name, ex: agent.name, desc: agent.desc };
  const surfaceGuides = buildSurfaceGuidesForEntry(tool, surfaces, entry, kind).map((guide) => ({
    ...guide,
    howToRun:
      kind === "automatic"
        ? [`Invoked automatically when: ${agent.when}`]
        : [
            tool === "claude"
              ? `${ACCESS.claudeTerminal.howIntro}, delegate to the “${agent.name}” subagent`
              : tool === "cursor"
                ? `${ACCESS.cursorIde.howIntro}, ask the agent to use “${agent.name}”`
                : `${guide.howToRun[0]} — select the ${agent.name} agent mode`,
            `Context: ${agent.when}`,
          ],
    expectedOutput: `${agent.name} runs with ${agent.tools} (${agent.model}) — ${agent.desc}`,
  }));

  return {
    entryKind: "agent",
    tool,
    toolLabel: TOOL_LABELS[tool],
    name: agent.name,
    purpose: agent.desc,
    surfaces: renderSurfaceLabels(tool, agent.surfaces),
    example: agent.when,
    configPath: agent.configPath,
    configExample: agent.configExample,
    surfaceGuides,
    docsUrl: agent.officialUrl,
    previewKind: kind,
    notes: [`Tools: ${agent.tools} · Model: ${agent.model} · Invoke: ${agent.invoke}`],
  };
}

export function buildHookRunPreview(hook: HookEntry, tool: ToolKey): EntryRunPreviewData {
  const surfaces = effectiveSurfaces(tool, hook.surfaces);
  const kind: RunPreviewKind = "config";
  const entry = { cmd: hook.cmd, name: hook.name, ex: hook.ex, desc: hook.desc };
  const surfaceGuides = buildSurfaceGuidesForEntry(tool, surfaces, entry, kind).map((guide) => ({
    ...guide,
    howToRun: [
      `Add the hook to ${hook.configPath ?? (tool === "claude" ? ".claude/settings.json" : ".cursor/hooks.json")}`,
      `Set the event to “${hook.cmd}” with your command script`,
      hook.auto ? "The hook fires automatically on the trigger event" : "Invoke manually when needed",
    ],
    expectedOutput: `On trigger (${hook.trigger}): your script runs and can allow, block, or modify the agent session.`,
  }));

  return {
    entryKind: "hook",
    tool,
    toolLabel: TOOL_LABELS[tool],
    name: hook.cmd,
    purpose: `${hook.desc} Trigger: ${hook.trigger}`,
    surfaces: renderSurfaceLabels(tool, hook.surfaces),
    example: hook.ex,
    usage: hook.usage,
    configPath: hook.configPath,
    configExample: hook.configExample,
    surfaceGuides,
    docsUrl: hook.officialUrl,
    previewKind: kind,
    promptLine: hook.ex,
    notes: hook.auto ? ["Runs automatically — no slash command needed."] : undefined,
  };
}

export function entryPreviewKey(kind: "command" | "skill" | "agent" | "hook", id: string) {
  return `${kind}|${id}`;
}

export function commandEntryKey(entry: CommandEntry) {
  return `${entry.cmd}|${entry.name}`;
}

export function previewKindLabel(kind: RunPreviewKind) {
  if (kind === "instant") return "Runs immediately";
  if (kind === "workflow") return "Multi-step workflow";
  if (kind === "settings") return "Settings panel";
  if (kind === "config") return "Configuration";
  if (kind === "automatic") return "Auto-invoked";
  return "Interactive";
}
