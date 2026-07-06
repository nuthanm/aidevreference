export type Badge = "skill" | "wf" | "chat" | "ide" | "other";

import type { SurfaceId } from "@/lib/catalog-surfaces";
import { COPILOT_SURFACES } from "@/lib/catalog-surfaces";
import type { KeyboardShortcutIde } from "@/lib/copilot-keyboard-shortcuts";

export type { SurfaceId } from "@/lib/catalog-surfaces";

export type {
  KeyboardShortcutIde,
  KeyboardShortcutPlatformTable,
  KeyboardShortcutRow,
} from "@/lib/copilot-keyboard-shortcuts";

export type CommandEntry = {
  cmd: string;
  name: string;
  desc: string;
  ex: string;
  usage?: string;
  badge?: Badge;
  surfaces?: SurfaceId[];
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
  usage?: string;
  trigger: string;
  surfaces?: SurfaceId[];
  configPath?: string;
  configExample?: string;
  detail?: string;
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
  surfaces?: SurfaceId[];
  configPath?: string;
  configExample?: string;
  detail?: string;
  officialUrl?: string;
};

export type HookEntry = {
  cmd: string;
  name: string;
  auto: boolean;
  desc: string;
  ex: string;
  usage?: string;
  trigger: string;
  surfaces?: SurfaceId[];
  configPath?: string;
  configExample?: string;
  detail?: string;
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
  keyboardShortcuts?: KeyboardShortcutIde[];
};

export type Catalog = {
  generatedAt: string;
  sourceFeeds: string[];
  tools: Record<"claude" | "cursor" | "copilot", ToolCatalog>;
};

export const baseCatalog: Catalog = {
  "generatedAt": "2026-07-03T10:40:10.677Z",
  "sourceFeeds": [
    "static-catalog-db"
  ],
  "tools": {
    "claude": {
      "maker": "Anthropic",
      "subtitle": "Slash commands, skills, subagents, and hooks for Claude Code (terminal CLI). Surface tags mark entries that also work on Desktop, IDE, Chrome, mobile, or integrations.",
      "officialDocs": [
        "https://code.claude.com/docs/en/overview"
      ],
      "groups": [
        {
          "id": "core",
          "label": "Core Commands",
          "entries": [
            {
              "cmd": "/help",
              "name": "Show Help",
              "desc": "Lists available commands.",
              "ex": "/help",
              "badge": "chat",
              "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              "cmd": "/review",
              "name": "Code Review",
              "desc": "Performs severity-first review of selected changes.",
              "ex": "/review",
              "badge": "wf",
              "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              "cmd": "/plan",
              "name": "Build Plan",
              "desc": "Creates a concise execution plan before coding.",
              "ex": "/plan add billing retry",
              "usage": "/plan <goal>",
              "badge": "wf",
              "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              "cmd": "/mcp list",
              "name": "List MCP Servers",
              "desc": "Shows configured MCP servers and capabilities.",
              "ex": "/mcp list",
              "badge": "ide",
              "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              "cmd": "/init",
              "name": "Initialize Project",
              "desc": "Generate a starter CLAUDE.md guide for the current repository.",
              "ex": "/init",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/doctor",
              "name": "Diagnose Installation",
              "desc": "Verify Claude Code installation, settings, and connectivity.",
              "ex": "/doctor",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/diff",
              "name": "View Changes",
              "desc": "Open an interactive diff viewer for uncommitted and per-turn changes.",
              "ex": "/diff",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/mcp",
              "name": "Manage MCP Servers",
              "desc": "List, connect, enable, or disable MCP server integrations.",
              "ex": "/mcp reconnect my-server",
              "usage": "/mcp reconnect <server-name>",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/mcp"
            },
            {
              "cmd": "/hooks",
              "name": "View Hooks",
              "desc": "Inspect configured hook events and their commands.",
              "ex": "/hooks",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/hooks"
            },
            {
              "cmd": "/skills",
              "name": "List Skills",
              "desc": "Show available skills and toggle their visibility to Claude.",
              "ex": "/skills",
              "badge": "skill",
              "officialUrl": "https://code.claude.com/docs/en/skills"
            }
          ]
        },
        {
          "id": "session",
          "label": "Session & Context",
          "entries": [
            {
              "cmd": "/clear",
              "name": "Clear Context",
              "desc": "Start a new conversation with empty context while keeping session history.",
              "ex": "/clear auth-refactor",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/compact",
              "name": "Compact Context",
              "desc": "Summarize conversation history to free context window space.",
              "ex": "/compact keep API migration details",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/context",
              "name": "Context Usage",
              "desc": "Visualize what is filling the context window and get optimization tips.",
              "ex": "/context all",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/resume",
              "name": "Resume Session",
              "desc": "Continue a previous conversation by ID, name, or picker.",
              "ex": "/resume billing-fix",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/sessions"
            },
            {
              "cmd": "/branch",
              "name": "Branch Conversation",
              "desc": "Fork the current conversation to try a different approach.",
              "ex": "/branch redis-cache",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/rewind",
              "name": "Rewind Session",
              "desc": "Roll back conversation and/or code to a prior checkpoint.",
              "ex": "/rewind",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/checkpointing"
            },
            {
              "cmd": "/background",
              "name": "Background Session",
              "desc": "Detach the current session to keep running while freeing the terminal.",
              "ex": "/background finish the migration",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/tasks",
              "name": "Background Tasks",
              "desc": "View and manage subagents and background work in the session.",
              "ex": "/tasks",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/add-dir",
              "name": "Add Directory",
              "desc": "Add a working directory for file access during the current session.",
              "ex": "/add-dir ../shared-lib",
              "usage": "/add-dir <path>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/btw",
              "name": "By The Way",
              "desc": "Ask a quick side question without adding to the conversation history.",
              "ex": "/btw what is a monad?",
              "usage": "/btw <question>",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/cd",
              "name": "Change Directory",
              "desc": "Move this session to a new working directory while preserving prompt cache.",
              "ex": "/cd ../other-project",
              "usage": "/cd <path>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/exit",
              "name": "Exit CLI",
              "desc": "Exit Claude Code. In a background session, detaches while work continues.",
              "ex": "/exit",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/export",
              "name": "Export Conversation",
              "desc": "Export the current conversation as plain text to clipboard or a file.",
              "ex": "/export session-notes.txt",
              "usage": "/export [filename]",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/fork",
              "name": "Fork Subagent",
              "desc": "Spawn a background subagent that inherits the conversation and works on a directive.",
              "ex": "/fork research the caching layer",
              "usage": "/fork <directive>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/goal",
              "name": "Set Goal",
              "desc": "Set a condition Claude keeps working toward across turns until met.",
              "ex": "/goal all tests pass",
              "usage": "/goal [condition|clear]",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/recap",
              "name": "Session Recap",
              "desc": "Generate a one-line summary of the current session on demand.",
              "ex": "/recap",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/rename",
              "name": "Rename Session",
              "desc": "Rename the current session and show the name on the prompt bar.",
              "ex": "/rename auth-refactor",
              "usage": "/rename [name]",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/teleport",
              "name": "Teleport Session",
              "desc": "Pull a Claude Code on the web session into this terminal.",
              "ex": "/teleport",
              "badge": "wf",
              "surfaces": ["remote"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "review",
          "label": "Review & Quality",
          "entries": [
            {
              "cmd": "/plan",
              "name": "Plan Mode",
              "desc": "Enter plan mode to design an approach before making code changes.",
              "ex": "/plan add retry logic to payments",
              "usage": "/plan <goal>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/review",
              "name": "Review Pull Request",
              "desc": "Run a GitHub pull request review using the code-review engine.",
              "ex": "/review 42",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/code-review",
              "name": "Review Local Diff",
              "desc": "Review uncommitted changes for bugs, reuse, and simplification.",
              "ex": "/code-review --fix",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/code-review"
            },
            {
              "cmd": "/security-review",
              "name": "Security Review",
              "desc": "Analyze branch diff for injection, auth, and data exposure risks.",
              "ex": "/security-review",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/simplify",
              "name": "Simplify Changes",
              "desc": "Find cleanup opportunities in changed code and apply fixes.",
              "ex": "/simplify src/api/",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "config",
          "label": "Configuration",
          "entries": [
            {
              "cmd": "/model",
              "name": "Switch Model",
              "desc": "Change the active model and optionally adjust effort level.",
              "ex": "/model sonnet",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/model-config"
            },
            {
              "cmd": "/effort",
              "name": "Set Effort Level",
              "desc": "Adjust reasoning depth: low, medium, high, xhigh, max, or auto.",
              "ex": "/effort high",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/permissions",
              "name": "Manage Permissions",
              "desc": "Configure allow, ask, and deny rules for tool usage.",
              "ex": "/permissions",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/permissions"
            },
            {
              "cmd": "/config",
              "name": "Open Settings",
              "desc": "Adjust theme, model, output style, and other preferences.",
              "ex": "/config theme=dark",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/settings"
            },
            {
              "cmd": "/memory",
              "name": "Edit Memory",
              "desc": "Manage CLAUDE.md memory files and auto-memory entries.",
              "ex": "/memory",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/memory"
            },
            {
              "cmd": "/usage",
              "name": "Usage & Cost",
              "desc": "Show session cost, plan limits, and usage breakdown by skill or MCP.",
              "ex": "/usage",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/costs"
            },
            {
              "cmd": "/color",
              "name": "Prompt Bar Color",
              "desc": "Set the prompt bar color for the current session.",
              "ex": "/color blue",
              "usage": "/color [color|default]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/fast",
              "name": "Fast Mode",
              "desc": "Toggle fast mode on or off for quicker responses.",
              "ex": "/fast on",
              "usage": "/fast [on|off]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/focus",
              "name": "Focus View",
              "desc": "Toggle focus view showing only your last prompt and final response.",
              "ex": "/focus",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/keybindings",
              "name": "Keyboard Shortcuts",
              "desc": "Open your keyboard shortcuts configuration file.",
              "ex": "/keybindings",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/remote-env",
              "name": "Remote Environment",
              "desc": "Choose the default environment for cloud agents.",
              "ex": "/remote-env",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/scroll-speed",
              "name": "Scroll Speed",
              "desc": "Adjust mouse wheel scroll speed interactively in fullscreen mode.",
              "ex": "/scroll-speed",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/status",
              "name": "Status",
              "desc": "Open Settings on the Status tab showing version, model, and connectivity.",
              "ex": "/status",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/statusline",
              "name": "Status Line",
              "desc": "Configure Claude Code's status line from a description or auto-detect from shell.",
              "ex": "/statusline show git branch and model",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/terminal-setup",
              "name": "Terminal Setup",
              "desc": "Configure terminal keybindings for Shift+Enter and other shortcuts.",
              "ex": "/terminal-setup",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/theme",
              "name": "Color Theme",
              "desc": "Change the color theme including auto, light, dark, and custom themes.",
              "ex": "/theme",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/tui",
              "name": "Terminal UI Mode",
              "desc": "Set the terminal UI renderer and relaunch with conversation intact.",
              "ex": "/tui fullscreen",
              "usage": "/tui [default|fullscreen]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/update-config",
              "name": "Update Config",
              "desc": "Set configuration values directly without opening the settings interface.",
              "ex": "/update-config theme=dark",
              "usage": "/update-config <key=value ...>",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "account",
          "label": "Account & Feedback",
          "entries": [
            {
              "cmd": "/feedback",
              "name": "Submit Feedback",
              "desc": "Submit feedback, report a bug, or share your conversation.",
              "ex": "/feedback the diff viewer froze",
              "usage": "/feedback [report]",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/insights",
              "name": "Usage Insights",
              "desc": "Generate a report analyzing your Claude Code sessions and friction points.",
              "ex": "/insights",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/login",
              "name": "Sign In",
              "desc": "Sign in to your Anthropic account.",
              "ex": "/login",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/logout",
              "name": "Sign Out",
              "desc": "Sign out from your Anthropic account.",
              "ex": "/logout",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/mobile",
              "name": "Mobile App",
              "desc": "Show QR code to download the Claude mobile app.",
              "ex": "/mobile",
              "badge": "other",
              "surfaces": ["claude-mobile"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/stickers",
              "name": "Order Stickers",
              "desc": "Order Claude Code stickers.",
              "ex": "/stickers",
              "badge": "other",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/team-onboarding",
              "name": "Team Onboarding",
              "desc": "Generate a team onboarding guide from your Claude Code usage history.",
              "ex": "/team-onboarding",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/usage-credits",
              "name": "Usage Credits",
              "desc": "Configure usage credits to keep working when you hit a plan limit.",
              "ex": "/usage-credits",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "integrations",
          "label": "Integrations & Surfaces",
          "entries": [
            {
              "cmd": "/chrome",
              "name": "Claude in Chrome",
              "desc": "Configure Claude in Chrome browser integration settings.",
              "ex": "/chrome",
              "badge": "ide",
              "surfaces": ["claude-chrome"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/desktop",
              "name": "Desktop App",
              "desc": "Continue the current session in the Claude Code Desktop app.",
              "ex": "/desktop",
              "badge": "ide",
              "surfaces": ["claude-desktop"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/ide",
              "name": "IDE Integration",
              "desc": "Manage IDE integrations and show connection status.",
              "ex": "/ide",
              "badge": "ide",
              "surfaces": ["claude-ide"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/install-github-app",
              "name": "Install GitHub App",
              "desc": "Install the Claude GitHub App and optionally set up Actions workflows.",
              "ex": "/install-github-app",
              "badge": "wf",
              "surfaces": ["github-actions"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/install-slack-app",
              "name": "Install Slack App",
              "desc": "Install the Claude Slack app via OAuth in the browser.",
              "ex": "/install-slack-app",
              "badge": "wf",
              "surfaces": ["slack"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/remote-control",
              "name": "Remote Control",
              "desc": "Make this session available for remote control from claude.ai.",
              "ex": "/remote-control",
              "badge": "ide",
              "surfaces": ["remote"],
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "plugins",
          "label": "Plugins & Skills",
          "entries": [
            {
              "cmd": "/advisor",
              "name": "Advisor Tool",
              "desc": "Enable or disable the advisor tool that consults a second model for guidance.",
              "ex": "/advisor sonnet",
              "usage": "/advisor [model|off]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/agents",
              "name": "Manage Agents",
              "desc": "Create or manage subagent configurations in .claude/agents/.",
              "ex": "/agents",
              "badge": "skill",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/plugin",
              "name": "Manage Plugins",
              "desc": "Open the plugin menu or run subcommands like list, install, enable, disable.",
              "ex": "/plugin list",
              "usage": "/plugin [subcommand]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/powerup",
              "name": "Powerup Lessons",
              "desc": "Discover Claude Code features through quick interactive lessons.",
              "ex": "/powerup",
              "badge": "other",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/release-notes",
              "name": "Release Notes",
              "desc": "View the changelog in an interactive version picker.",
              "ex": "/release-notes",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/reload-plugins",
              "name": "Reload Plugins",
              "desc": "Reload all active plugins to apply pending changes without restarting.",
              "ex": "/reload-plugins",
              "usage": "/reload-plugins [--force]",
              "badge": "ide",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/reload-skills",
              "name": "Reload Skills",
              "desc": "Re-scan skill directories so disk changes are available without restart.",
              "ex": "/reload-skills",
              "badge": "skill",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/run-skill-generator",
              "name": "Run Skill Generator",
              "desc": "Teach /run and /verify how to build and drive your project's app.",
              "ex": "/run-skill-generator",
              "badge": "skill",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "workflows",
          "label": "Workflows & Automation",
          "entries": [
            {
              "cmd": "/artifact-design",
              "name": "Artifact Design",
              "desc": "Design and refine UI artifacts with Claude's design tooling.",
              "ex": "/artifact-design",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/autofix-pr",
              "name": "Autofix Pull Request",
              "desc": "Spawn a cloud session that watches the current PR and pushes fixes for CI or reviews.",
              "ex": "/autofix-pr only fix lint errors",
              "usage": "/autofix-pr [prompt]",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/deep-research",
              "name": "Deep Research",
              "desc": "Fan out web searches, cross-check sources, and synthesize a cited report.",
              "ex": "/deep-research compare React state libraries",
              "usage": "/deep-research <question>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/design-login",
              "name": "Design Login",
              "desc": "Authorize design-system access for /design-sync with your claude.ai account.",
              "ex": "/design-login",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/design-sync",
              "name": "Design Sync",
              "desc": "Convert your React design system and upload it to Claude Design.",
              "ex": "/design-sync Acme DS",
              "usage": "/design-sync [hint]",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/schedule",
              "name": "Scheduled Routines",
              "desc": "Create, update, list, or run routines on Anthropic-managed cloud infrastructure.",
              "ex": "/schedule daily dependency audit",
              "usage": "/schedule [description]",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/ultraplan",
              "name": "Ultraplan",
              "desc": "Draft a plan in an ultraplan session, review in browser, then execute remotely.",
              "ex": "/ultraplan migrate auth to OAuth",
              "usage": "/ultraplan <goal>",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/workflows",
              "name": "Workflow Progress",
              "desc": "Open the workflow progress view to watch, pause, resume, or save workflows.",
              "ex": "/workflows",
              "badge": "wf",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          "id": "experience",
          "label": "Experience",
          "entries": [
            {
              "cmd": "/radio",
              "name": "Claude FM Radio",
              "desc": "Open Claude FM lo-fi radio in your browser.",
              "ex": "/radio",
              "badge": "other",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            },
            {
              "cmd": "/voice",
              "name": "Voice Dictation",
              "desc": "Toggle voice dictation or enable it in hold or tap mode.",
              "ex": "/voice tap",
              "usage": "/voice [hold|tap|off]",
              "badge": "chat",
              "officialUrl": "https://code.claude.com/docs/en/commands"
            }
          ]
        }
      ],
      "skills": [
        {
          "cmd": "/project-setup-info-local",
          "name": "Project Setup Info",
          "auto": true,
          "desc": "Scaffolding guidance for complete project setup.",
          "usage": "/project-setup-info-local <request>",
          "ex": "/project-setup-info-local setup Next.js app",
          "trigger": "When user asks to initialize a full project",
          "configPath": ".claude/skills/project-setup-info-local/SKILL.md",
          "configExample": "# Project Setup Info\n\nInvoke when the user asks to scaffold or initialize a new project.\n\n## Steps\n1. Detect framework from package.json\n2. Generate starter structure\n3. Add CLAUDE.md with conventions",
          "detail": "Bundled skills ship with Claude Code and live under .claude/skills/<skill-name>/SKILL.md.\n\nEach skill folder contains a SKILL.md with frontmatter (name, description) and instructions Claude follows when the skill is invoked.\n\nAuto-invoked skills are matched by intent; user-only skills require an explicit slash command.",
          "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
        },
        {
          "cmd": "/batch",
          "name": "Batch Migration",
          "auto": false,
          "desc": "Decompose large codebase changes into parallel subagent work units.",
          "usage": "/batch <goal> <scope>",
          "ex": "/batch migrate src/ from Solid to React",
          "trigger": "When orchestrating large multi-file migrations",
          "configPath": ".claude/skills/batch/SKILL.md",
          "configExample": "# Batch Migration\n\nBreak large refactors into parallel sub-tasks.\n\n## Usage\n/batch <goal> <scope>",
          "detail": "Create a custom skill at .claude/skills/batch/SKILL.md or invoke the bundled /batch command.\n\nThe skill instructs Claude to split work into independent units and delegate to subagents where possible.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        },
        {
          "cmd": "/debug",
          "name": "Debug Session",
          "auto": false,
          "desc": "Enable debug logging and troubleshoot issues from session logs.",
          "usage": "/debug <issue>",
          "ex": "/debug MCP connection timeout",
          "trigger": "When diagnosing Claude Code runtime issues",
          "configPath": "CLAUDE_DEBUG=1 in shell or .claude/settings.json",
          "configExample": "{\n  \"env\": {\n    \"CLAUDE_DEBUG\": \"1\"\n  }\n}",
          "detail": "Run /debug <issue> to analyze session logs, or set CLAUDE_DEBUG=1 for verbose output.\n\nLogs are written to ~/.claude/debug/ — share relevant excerpts when reporting issues.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        },
        {
          "cmd": "/loop",
          "name": "Loop Prompt",
          "auto": false,
          "desc": "Run a prompt repeatedly on an interval while the session stays open.",
          "usage": "/loop <interval> <prompt>",
          "ex": "/loop 5m check if deploy finished",
          "trigger": "When polling or recurring maintenance is needed",
          "configPath": "Slash command (no file config required)",
          "configExample": "/loop 10m run tests and report failures",
          "detail": "Syntax: /loop <interval> <prompt>\n\nIntervals: 30s, 5m, 1h, etc. The loop runs until you stop the session or cancel.\n\nUse for CI polling, log watching, or recurring health checks.",
          "officialUrl": "https://code.claude.com/docs/en/scheduled-tasks"
        },
        {
          "cmd": "/run",
          "name": "Run App",
          "auto": false,
          "desc": "Launch and drive the project app to verify a change works end-to-end.",
          "ex": "/run",
          "trigger": "When validating behavior beyond unit tests",
          "configPath": "package.json scripts (npm run dev, etc.)",
          "configExample": "{\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"start\": \"next start\"\n  }\n}",
          "detail": "/run detects the project type from package.json and starts the dev server, then exercises the app to verify your change.\n\nEnsure your start/dev script is defined so Claude can launch the app.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        },
        {
          "cmd": "/verify",
          "name": "Verify Change",
          "auto": false,
          "desc": "Build and run the app to confirm a change works as intended.",
          "ex": "/verify",
          "trigger": "When confirming functional behavior of a code change",
          "configPath": "Project test/build scripts in package.json",
          "configExample": "{\n  \"scripts\": {\n    \"build\": \"next build\",\n    \"test\": \"vitest run\"\n  }\n}",
          "detail": "/verify runs build + test commands appropriate to your stack.\n\nClaude uses existing npm/pnpm scripts — define build and test targets for best results.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        },
        {
          "cmd": "/claude-api",
          "name": "Claude API Reference",
          "auto": true,
          "desc": "Load Claude API reference material for the project's language and SDK.",
          "usage": "/claude-api <task>",
          "ex": "/claude-api migrate",
          "trigger": "When code imports anthropic SDK or needs API guidance",
          "configPath": ".claude/skills/claude-api/SKILL.md",
          "configExample": "# Claude API Reference\n\nLoad SDK docs for Python, TypeScript, or curl based on project imports.",
          "detail": "Auto-invoked when Claude detects anthropic SDK imports or API-related questions.\n\nSkill loads language-specific reference material into context.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        },
        {
          "cmd": "/fewer-permission-prompts",
          "name": "Reduce Permission Prompts",
          "auto": false,
          "desc": "Scan transcripts and add allowlist rules for common read-only tool calls.",
          "ex": "/fewer-permission-prompts",
          "trigger": "When permission prompts slow down routine workflows",
          "configPath": ".claude/settings.json → permissions.allow",
          "configExample": "{\n  \"permissions\": {\n    \"allow\": [\n      \"Read\",\n      \"Grep\",\n      \"Glob\"\n    ]\n  }\n}",
          "detail": "Run /fewer-permission-prompts to analyze your session and suggest allowlist entries.\n\nManually edit .claude/settings.json to persist rules across sessions.\n\nUse cautiously — only allow tools you trust for your workflow.",
          "officialUrl": "https://code.claude.com/docs/en/commands"
        }
      ],
      "agents": [
        {
          "name": "Explore",
          "badge": "Read-only · Sonnet",
          "color": "#0EA5E9",
          "desc": "Fast exploration and retrieval across workspace files.",
          "tools": "Read, Search, Grep",
          "model": "Sonnet",
          "invoke": "Automatic",
          "when": "When broad context gathering is needed",
          "configPath": ".claude/agents/explore.md (optional custom agent)",
          "configExample": "---\nname: Explore\ntools: Read, Grep, Glob\ndescription: Fast read-only codebase search\n---\n\nSearch and summarize files without making edits.",
          "detail": "Built-in subagent — no config required.\n\nTo customize, create .claude/agents/explore.md with YAML frontmatter defining name, tools, model, and system prompt.\n\nClaude delegates exploration tasks automatically when broad context is needed.",
          "officialUrl": "https://docs.anthropic.com/en/docs/claude-code"
        },
        {
          "name": "Plan",
          "badge": "Read-only · Planning",
          "color": "#8B5CF6",
          "desc": "Researches codebase in plan mode while keeping the main session read-only.",
          "tools": "Read, Search, Grep",
          "model": "Inherits session model",
          "invoke": "Automatic in plan mode",
          "when": "When planning requires codebase exploration",
          "configPath": "Plan mode (Shift+Tab) — no file required",
          "configExample": "Enter plan mode → Claude spawns Plan subagent automatically for research.",
          "detail": "Activated when you enter plan mode (Shift+Tab in Claude Code).\n\nThe Plan subagent researches the codebase read-only while the main session stays in planning.\n\nCustom plan agents can be defined in .claude/agents/plan.md.",
          "officialUrl": "https://code.claude.com/docs/en/sub-agents"
        },
        {
          "name": "general-purpose",
          "badge": "Full access · Balanced",
          "color": "#10B981",
          "desc": "Handles tasks requiring exploration, modification, and multi-step reasoning.",
          "tools": "Read, Edit, Bash, Search",
          "model": "Inherits session model",
          "invoke": "Automatic",
          "when": "When a task needs both research and code changes",
          "configPath": ".claude/agents/general-purpose.md",
          "configExample": "---\nname: general-purpose\ntools: Read, Edit, Bash, Grep\ndescription: Full-access agent for complex tasks\n---\n\nHandle multi-step tasks requiring both research and edits.",
          "detail": "Default workhorse subagent with full tool access.\n\nClaude spawns it automatically for tasks needing exploration plus code changes.\n\nOverride behavior by creating .claude/agents/general-purpose.md in your project.",
          "officialUrl": "https://code.claude.com/docs/en/sub-agents"
        }
      ],
      "hooks": [
        {
          "cmd": "PreToolUse",
          "name": "Pre-Tool Validation",
          "auto": true,
          "desc": "Run scripts before tool calls to block, allow, or modify execution.",
          "usage": "hooks.PreToolUse in .claude/settings.json",
          "ex": "bash .claude/hooks/block-dangerous.sh",
          "trigger": "Fires before any tool call executes",
          "configPath": ".claude/settings.json → hooks.PreToolUse",
          "configExample": "{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/block-dangerous.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PreToolUse hooks run before Claude executes a tool.\n\nUse matchers to target specific tools (Bash, Edit, Write, etc.).\n\nHook scripts receive JSON on stdin with tool name and input — exit 2 to block, 0 to allow.\n\nConfigure in .claude/settings.json (project) or ~/.claude/settings.json (global).",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PostToolUse",
          "name": "Post-Tool Formatting",
          "auto": true,
          "desc": "Run scripts after successful tool calls, e.g. auto-format edited files.",
          "usage": "hooks.PostToolUse matcher \"Edit|Write\"",
          "ex": "prettier --write $FILE",
          "trigger": "Fires after a tool call succeeds",
          "configPath": ".claude/settings.json → hooks.PostToolUse",
          "configExample": "{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"prettier --write $FILE\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PostToolUse hooks run after a tool succeeds.\n\nCommon use: auto-format files after Edit/Write, run linters, or log activity.\n\n$FILE is replaced with the edited file path when available.",
          "officialUrl": "https://code.claude.com/docs/en/hooks-guide"
        },
        {
          "cmd": "SessionStart",
          "name": "Session Start Hook",
          "auto": true,
          "desc": "Inject context when a session begins, resumes, clears, or compacts.",
          "usage": "hooks.SessionStart on session start, resume, clear, or compact",
          "ex": "bash .claude/hooks/load-env.sh",
          "trigger": "Fires on startup, resume, clear, or compact",
          "configPath": ".claude/settings.json → hooks.SessionStart",
          "configExample": "{\n  \"hooks\": {\n    \"SessionStart\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/load-env.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "SessionStart fires when a session starts, resumes, after /clear, or after /compact.\n\nUse to inject environment variables, load project context, or print reminders.\n\nHook output can be added to Claude's context.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "Notification",
          "name": "Desktop Notification",
          "auto": true,
          "desc": "Send OS notifications when Claude needs input or permission.",
          "usage": "hooks.Notification when Claude waits for input",
          "ex": "notify-send \"Claude needs your attention\"",
          "trigger": "Fires when Claude waits for user input",
          "configPath": ".claude/settings.json → hooks.Notification",
          "configExample": "{\n  \"hooks\": {\n    \"Notification\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"notify-send \\\"Claude needs input\\\"\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "Notification hooks fire when Claude is waiting for your input or a permission decision.\n\nUseful when running long tasks in the background — get a desktop alert when attention is needed.\n\nOn macOS use osascript; on Linux use notify-send.",
          "officialUrl": "https://code.claude.com/docs/en/hooks-guide"
        },
        {
          "cmd": "Stop",
          "name": "Stop Hook",
          "auto": true,
          "desc": "Run scripts when Claude finishes a response turn.",
          "usage": "hooks.Stop after each response turn",
          "ex": "bash .claude/hooks/log-turn.sh",
          "trigger": "Fires when Claude finishes responding",
          "configPath": ".claude/settings.json → hooks.Stop",
          "configExample": "{\n  \"hooks\": {\n    \"Stop\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/log-turn.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "Stop hooks run when Claude completes a response turn.\n\nUse for logging, metrics, or triggering follow-up automation.\n\nReceives session metadata on stdin.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PostToolUseFailure",
          "name": "Post-Tool Failure Handler",
          "auto": true,
          "desc": "Run scripts after a tool call fails to log errors or provide corrective feedback.",
          "usage": "hooks.PostToolUseFailure matcher \"Bash|Edit\"",
          "ex": "bash .claude/hooks/log-tool-failure.sh",
          "trigger": "Fires after a tool call throws an error or returns a failure result",
          "configPath": ".claude/settings.json → hooks.PostToolUseFailure",
          "configExample": "{\n  \"hooks\": {\n    \"PostToolUseFailure\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/log-tool-failure.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PostToolUseFailure hooks run when a tool execution fails.\n\nUse matchers to target specific tools (Bash, Edit, Write, etc.).\n\nCommon use: log failures, send alerts, or inject corrective context for Claude.\n\nExit 2 shows stderr to Claude; the tool has already failed.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PostToolBatch",
          "name": "Post-Tool Batch Hook",
          "auto": true,
          "desc": "Run once after every tool in a parallel batch resolves, before the next model call.",
          "usage": "hooks.PostToolBatch after parallel tool batch",
          "ex": "bash .claude/hooks/summarize-batch.sh",
          "trigger": "Fires once after a full batch of parallel tool calls completes",
          "configPath": ".claude/settings.json → hooks.PostToolBatch",
          "configExample": "{\n  \"hooks\": {\n    \"PostToolBatch\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/summarize-batch.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PostToolBatch fires exactly once with the full batch of parallel tool calls, unlike PostToolUse which fires per tool.\n\nUse when context depends on the set of tools that ran together.\n\nNo matcher support — fires on every batch. Exit 2 or decision: block stops the agentic loop.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PermissionDenied",
          "name": "Permission Denied Hook",
          "auto": true,
          "desc": "React when auto mode classifier denies a tool call; optionally allow retry.",
          "usage": "hooks.PermissionDenied matcher \"Bash\"",
          "ex": "bash .claude/hooks/handle-denial.sh",
          "trigger": "Fires when auto mode classifier denies a tool call",
          "configPath": ".claude/settings.json → hooks.PermissionDenied",
          "configExample": "{\n  \"hooks\": {\n    \"PermissionDenied\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/handle-denial.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PermissionDenied fires only in auto mode when the classifier denies a tool call.\n\nDoes not fire for manual denials, PreToolUse blocks, or deny rules.\n\nReturn hookSpecificOutput.retry: true to tell the model it may retry the denied call.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "UserPromptSubmit",
          "name": "User Prompt Submit Hook",
          "auto": true,
          "desc": "Validate or enrich prompts before Claude processes them; can block submission.",
          "usage": "hooks.UserPromptSubmit before each prompt",
          "ex": "bash .claude/hooks/check-secrets.sh",
          "trigger": "Fires when you submit a prompt, before Claude processes it",
          "configPath": ".claude/settings.json → hooks.UserPromptSubmit",
          "configExample": "{\n  \"hooks\": {\n    \"UserPromptSubmit\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/check-secrets.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "UserPromptSubmit runs before every prompt and blocks model processing until complete.\n\nExit 2 rejects the prompt. stdout additionalContext is visible to Claude.\n\nDefault timeout is 30 seconds for command hooks.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "UserPromptExpansion",
          "name": "User Prompt Expansion Hook",
          "auto": true,
          "desc": "Intercept slash commands and MCP prompts before they expand into full prompts.",
          "usage": "hooks.UserPromptExpansion matcher \"deploy\"",
          "ex": "bash .claude/hooks/gate-deploy.sh",
          "trigger": "Fires when a user-typed command expands into a prompt",
          "configPath": ".claude/settings.json → hooks.UserPromptExpansion",
          "configExample": "{\n  \"hooks\": {\n    \"UserPromptExpansion\": [\n      {\n        \"matcher\": \"deploy\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/gate-deploy.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "UserPromptExpansion covers direct slash commands that bypass PreToolUse.\n\nMatches on command_name. Empty matcher fires on every prompt-type command.\n\nUse to block commands, inject skill context, or audit command usage.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "StopFailure",
          "name": "Stop Failure Hook",
          "auto": true,
          "desc": "Log or alert when a turn ends due to an API error instead of a normal Stop.",
          "usage": "hooks.StopFailure matcher \"rate_limit\"",
          "ex": "bash .claude/hooks/alert-api-error.sh",
          "trigger": "Fires when the turn ends due to an API error",
          "configPath": ".claude/settings.json → hooks.StopFailure",
          "configExample": "{\n  \"hooks\": {\n    \"StopFailure\": [\n      {\n        \"matcher\": \"rate_limit\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/alert-api-error.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "StopFailure runs instead of Stop when Claude can't complete a response.\n\nCovers rate limits, auth failures, billing errors, and other API errors.\n\nOutput and exit code are ignored — use for logging and side effects only.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "SubagentStart",
          "name": "Subagent Start Hook",
          "auto": true,
          "desc": "Inject context or gate subagents when they are spawned via the Agent tool.",
          "usage": "hooks.SubagentStart matcher \"Explore|Plan\"",
          "ex": "bash .claude/hooks/subagent-context.sh",
          "trigger": "Fires when a Claude Code subagent is spawned",
          "configPath": ".claude/settings.json → hooks.SubagentStart",
          "configExample": "{\n  \"hooks\": {\n    \"SubagentStart\": [\n      {\n        \"matcher\": \"Explore\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/subagent-context.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "SubagentStart fires when a subagent is spawned.\n\nMatcher filters on agent_type (general-purpose, Explore, Plan, custom names, or plugin-scoped names like ^my-plugin:reviewer$).\n\nCan inject additionalContext for the subagent session.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "SubagentStop",
          "name": "Subagent Stop Hook",
          "auto": true,
          "desc": "Chain follow-up work or inject feedback when a subagent finishes responding.",
          "usage": "hooks.SubagentStop matcher \"Explore\"",
          "ex": "bash .claude/hooks/subagent-followup.sh",
          "trigger": "Fires when a Claude Code subagent finishes responding",
          "configPath": ".claude/settings.json → hooks.SubagentStop",
          "configExample": "{\n  \"hooks\": {\n    \"SubagentStop\": [\n      {\n        \"matcher\": \"Explore\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/subagent-followup.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "SubagentStop fires when a subagent completes its turn.\n\nReceives agent_transcript_path and last_assistant_message.\n\nCan return followup_message or additionalContext to continue workflows.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PreCompact",
          "name": "Pre-Compact Hook",
          "auto": true,
          "desc": "Observe or block context compaction before it runs.",
          "usage": "hooks.PreCompact matcher \"manual|auto\"",
          "ex": "bash .claude/hooks/pre-compact.sh",
          "trigger": "Fires before a compact operation (manual /compact or auto-compact)",
          "configPath": ".claude/settings.json → hooks.PreCompact",
          "configExample": "{\n  \"hooks\": {\n    \"PreCompact\": [\n      {\n        \"matcher\": \"manual\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/pre-compact.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PreCompact runs before context compaction.\n\nMatcher values: manual (/compact) or auto (context window full).\n\nExit 2 or decision: block prevents compaction.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PostCompact",
          "name": "Post-Compact Hook",
          "auto": true,
          "desc": "React after context compaction completes, e.g. log the summary or update external state.",
          "usage": "hooks.PostCompact matcher \"manual|auto\"",
          "ex": "bash .claude/hooks/post-compact.sh",
          "trigger": "Fires after a compact operation completes",
          "configPath": ".claude/settings.json → hooks.PostCompact",
          "configExample": "{\n  \"hooks\": {\n    \"PostCompact\": [\n      {\n        \"matcher\": \"auto\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/post-compact.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PostCompact runs after compaction finishes.\n\nMatcher values: manual or auto.\n\nNo decision control — use for logging and side effects.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "SessionEnd",
          "name": "Session End Hook",
          "auto": true,
          "desc": "Run cleanup, logging, or state persistence when a session terminates.",
          "usage": "hooks.SessionEnd matcher \"clear|logout\"",
          "ex": "bash .claude/hooks/session-cleanup.sh",
          "trigger": "Fires when a Claude Code session ends",
          "configPath": ".claude/settings.json → hooks.SessionEnd",
          "configExample": "{\n  \"hooks\": {\n    \"SessionEnd\": [\n      {\n        \"matcher\": \"clear\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/session-cleanup.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "SessionEnd fires when a session terminates.\n\nMatcher filters on reason: clear, resume, logout, prompt_input_exit, bypass_permissions_disabled, or other.\n\nUse for cleanup, session statistics, or saving state.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "PermissionRequest",
          "name": "Permission Request Hook",
          "auto": true,
          "desc": "Auto-allow or deny permission dialogs on behalf of the user.",
          "usage": "hooks.PermissionRequest matcher \"Bash|Edit\"",
          "ex": "bash .claude/hooks/auto-approve-reads.sh",
          "trigger": "Fires when a permission dialog is about to be shown",
          "configPath": ".claude/settings.json → hooks.PermissionRequest",
          "configExample": "{\n  \"hooks\": {\n    \"PermissionRequest\": [\n      {\n        \"matcher\": \"Read\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/auto-approve-reads.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "PermissionRequest runs when a permission dialog would appear.\n\nUnlike PreToolUse, this fires only when user approval is needed.\n\nReturn permission decision JSON to allow or deny on behalf of the user.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "Setup",
          "name": "Setup Hook",
          "auto": true,
          "desc": "One-time preparation when starting with --init-only, --init, or --maintenance.",
          "usage": "hooks.Setup matcher \"init|maintenance\"",
          "ex": "bash .claude/hooks/install-deps.sh",
          "trigger": "Fires on --init-only or --init/--maintenance in -p mode",
          "configPath": ".claude/settings.json → hooks.Setup",
          "configExample": "{\n  \"hooks\": {\n    \"Setup\": [\n      {\n        \"matcher\": \"init\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/install-deps.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "Setup fires for one-time CI or script preparation, not every launch.\n\nMatcher: init or maintenance.\n\nHas access to CLAUDE_ENV_FILE for persisting environment variables.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "TeammateIdle",
          "name": "Teammate Idle Hook",
          "auto": true,
          "desc": "Enforce quality gates before an agent team teammate goes idle.",
          "usage": "hooks.TeammateIdle before teammate stops working",
          "ex": "bash .claude/hooks/check-lint-before-idle.sh",
          "trigger": "Fires when an agent team teammate is about to go idle",
          "configPath": ".claude/settings.json → hooks.TeammateIdle",
          "configExample": "{\n  \"hooks\": {\n    \"TeammateIdle\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/check-lint-before-idle.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "TeammateIdle fires before a teammate finishes its turn.\n\nExit 2 keeps the teammate working with stderr feedback.\n\nReturn continue: false to stop the teammate entirely.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "TaskCreated",
          "name": "Task Created Hook",
          "auto": true,
          "desc": "Enforce naming conventions or block task creation via TaskCreate.",
          "usage": "hooks.TaskCreated on TaskCreate tool",
          "ex": "bash .claude/hooks/validate-task.sh",
          "trigger": "Fires when a task is being created via TaskCreate",
          "configPath": ".claude/settings.json → hooks.TaskCreated",
          "configExample": "{\n  \"hooks\": {\n    \"TaskCreated\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/validate-task.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "TaskCreated fires when TaskCreate runs.\n\nExit 2 rolls back task creation and feeds stderr to the model.\n\nNo matcher support — fires on every task creation.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "TaskCompleted",
          "name": "Task Completed Hook",
          "auto": true,
          "desc": "Enforce completion criteria before a task can be marked done.",
          "usage": "hooks.TaskCompleted before task closes",
          "ex": "bash .claude/hooks/require-tests-pass.sh",
          "trigger": "Fires when a task is being marked as completed",
          "configPath": ".claude/settings.json → hooks.TaskCompleted",
          "configExample": "{\n  \"hooks\": {\n    \"TaskCompleted\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/require-tests-pass.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "TaskCompleted fires when TaskUpdate marks a task done or a teammate finishes with in-progress tasks.\n\nExit 2 prevents completion and feeds stderr to the model.\n\nUse to require passing tests or lint before closing tasks.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "Elicitation",
          "name": "MCP Elicitation Hook",
          "auto": true,
          "desc": "Respond programmatically when an MCP server requests user input mid-task.",
          "usage": "hooks.Elicitation matcher \"my-mcp-server\"",
          "ex": "bash .claude/hooks/auto-respond-elicitation.sh",
          "trigger": "Fires when an MCP server requests user input during a tool call",
          "configPath": ".claude/settings.json → hooks.Elicitation",
          "configExample": "{\n  \"hooks\": {\n    \"Elicitation\": [\n      {\n        \"matcher\": \"my-mcp-server\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/auto-respond-elicitation.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "Elicitation intercepts MCP user-input dialogs.\n\nMatcher filters on MCP server name.\n\nReturn action (accept/decline/cancel) and content to respond without showing the dialog.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "ElicitationResult",
          "name": "MCP Elicitation Result Hook",
          "auto": true,
          "desc": "Observe, modify, or block user responses before they are sent to the MCP server.",
          "usage": "hooks.ElicitationResult matcher \"my-mcp-server\"",
          "ex": "bash .claude/hooks/audit-elicitation.sh",
          "trigger": "Fires after a user responds to an MCP elicitation",
          "configPath": ".claude/settings.json → hooks.ElicitationResult",
          "configExample": "{\n  \"hooks\": {\n    \"ElicitationResult\": [\n      {\n        \"matcher\": \"my-mcp-server\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/audit-elicitation.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "ElicitationResult runs after the user responds to an MCP elicitation.\n\nMatcher filters on MCP server name.\n\nCan override action and content before the response reaches the server.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "ConfigChange",
          "name": "Config Change Hook",
          "auto": true,
          "desc": "Audit or block changes to settings, policy, or skill files during a session.",
          "usage": "hooks.ConfigChange matcher \"project_settings|skills\"",
          "ex": "bash .claude/hooks/audit-config.sh",
          "trigger": "Fires when a configuration file changes during a session",
          "configPath": ".claude/settings.json → hooks.ConfigChange",
          "configExample": "{\n  \"hooks\": {\n    \"ConfigChange\": [\n      {\n        \"matcher\": \"project_settings\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/audit-config.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "ConfigChange fires for settings, policy, and skill file changes.\n\nMatcher: user_settings, project_settings, local_settings, policy_settings, or skills.\n\nExit 2 blocks the change (except policy_settings).",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "InstructionsLoaded",
          "name": "Instructions Loaded Hook",
          "auto": true,
          "desc": "Observe when CLAUDE.md or .claude/rules/*.md files are loaded into context.",
          "usage": "hooks.InstructionsLoaded matcher \"session_start\"",
          "ex": "bash .claude/hooks/log-instructions.sh",
          "trigger": "Fires when instruction files are loaded at session start or lazily",
          "configPath": ".claude/settings.json → hooks.InstructionsLoaded",
          "configExample": "{\n  \"hooks\": {\n    \"InstructionsLoaded\": [\n      {\n        \"matcher\": \"session_start\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/log-instructions.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "InstructionsLoaded fires when CLAUDE.md or .claude/rules/*.md loads.\n\nMatcher filters on load_reason: session_start, nested_traversal, path_glob_match, include, or compact.\n\nAsync observability only — no blocking.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "WorktreeCreate",
          "name": "Worktree Create Hook",
          "auto": true,
          "desc": "Replace default git worktree creation for --worktree or isolation: worktree.",
          "usage": "hooks.WorktreeCreate for custom VCS isolation",
          "ex": "bash .claude/hooks/create-worktree.sh",
          "trigger": "Fires when a worktree is being created via --worktree or isolation",
          "configPath": ".claude/settings.json → hooks.WorktreeCreate",
          "configExample": "{\n  \"hooks\": {\n    \"WorktreeCreate\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/create-worktree.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "WorktreeCreate replaces default git worktree behavior.\n\nHook must print the absolute worktree path on stdout.\n\nAny non-zero exit code aborts worktree creation.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "WorktreeRemove",
          "name": "Worktree Remove Hook",
          "auto": true,
          "desc": "Clean up isolated worktrees when a session exits or a subagent finishes.",
          "usage": "hooks.WorktreeRemove paired with WorktreeCreate",
          "ex": "bash .claude/hooks/remove-worktree.sh",
          "trigger": "Fires when a worktree is being removed at session exit or subagent finish",
          "configPath": ".claude/settings.json → hooks.WorktreeRemove",
          "configExample": "{\n  \"hooks\": {\n    \"WorktreeRemove\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/remove-worktree.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "WorktreeRemove is the cleanup counterpart to WorktreeCreate.\n\nReceives worktree_path from the create hook.\n\nRequired for non-git VCS; git worktrees are cleaned up automatically.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "CwdChanged",
          "name": "Working Directory Changed Hook",
          "auto": true,
          "desc": "React when the working directory changes, e.g. reload direnv or toolchains.",
          "usage": "hooks.CwdChanged on cd during session",
          "ex": "bash .claude/hooks/reload-direnv.sh",
          "trigger": "Fires when the working directory changes during a session",
          "configPath": ".claude/settings.json → hooks.CwdChanged",
          "configExample": "{\n  \"hooks\": {\n    \"CwdChanged\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/reload-direnv.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "CwdChanged fires when Claude executes cd or the cwd otherwise changes.\n\nHas access to CLAUDE_ENV_FILE for persisting environment variables.\n\nNo matcher support — fires on every directory change.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "FileChanged",
          "name": "File Changed Hook",
          "auto": true,
          "desc": "React when watched files change on disk, e.g. reload .envrc or .env.",
          "usage": "hooks.FileChanged matcher \".envrc|.env\"",
          "ex": "bash .claude/hooks/reload-env.sh",
          "trigger": "Fires when a watched file changes on disk",
          "configPath": ".claude/settings.json → hooks.FileChanged",
          "configExample": "{\n  \"hooks\": {\n    \"FileChanged\": [\n      {\n        \"matcher\": \".envrc|.env\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/reload-env.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "FileChanged watches literal filenames split on | in the matcher.\n\nUse with SessionStart watchPaths for reactive environment management.\n\nHas access to CLAUDE_ENV_FILE.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        },
        {
          "cmd": "MessageDisplay",
          "name": "Message Display Hook",
          "auto": true,
          "desc": "Replace assistant message text on screen without changing the transcript.",
          "usage": "hooks.MessageDisplay for display-only text replacement",
          "ex": "bash .claude/hooks/redact-secrets-display.sh",
          "trigger": "Fires while assistant message text is displayed",
          "configPath": ".claude/settings.json → hooks.MessageDisplay",
          "configExample": "{\n  \"hooks\": {\n    \"MessageDisplay\": [\n      {\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash .claude/hooks/redact-secrets-display.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}",
          "detail": "MessageDisplay is display-only: Claude and the transcript keep the original text.\n\nReturn hookSpecificOutput.displayContent to replace on-screen rendering.\n\nDefault timeout is 10 seconds. No matcher support.",
          "officialUrl": "https://code.claude.com/docs/en/hooks"
        }
      ]
    },
    "cursor": {
      "maker": "Anysphere",
      "subtitle": "Commands, automation hooks, and IDE workflows for Cursor.",
      "officialDocs": [
        "https://cursor.com/docs"
      ],
      "groups": [
        {
          "id": "core",
          "label": "Core Commands",
          "entries": [
            {
              "cmd": "/chat",
              "name": "Composer Chat",
              "desc": "Open contextual chat.",
              "ex": "/chat explain auth flow",
              "badge": "chat",
              "officialUrl": "https://docs.cursor.com"
            },
            {
              "cmd": "/edit",
              "name": "Inline Edit",
              "desc": "Apply focused edits to selected code.",
              "ex": "/edit simplify function",
              "badge": "ide",
              "officialUrl": "https://docs.cursor.com"
            },
            {
              "cmd": "/agent",
              "name": "Agent Mode",
              "desc": "Run multi-step autonomous coding task.",
              "ex": "/agent add caching",
              "badge": "wf",
              "officialUrl": "https://docs.cursor.com"
            },
            {
              "cmd": "/chat",
              "name": "Agent Chat",
              "desc": "Open contextual agent chat for questions and multi-step tasks.",
              "ex": "/chat explain the auth middleware",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs/agent/overview"
            },
            {
              "cmd": "/ask",
              "name": "Quick Ask",
              "desc": "Ask a focused question about selected code or the current file.",
              "ex": "/ask what does this regex match?",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs"
            },
            {
              "cmd": "/generate",
              "name": "Generate Code",
              "desc": "Generate code from a natural-language description in context.",
              "ex": "/generate a Zod schema for UserProfile",
              "badge": "ide",
              "officialUrl": "https://cursor.com/docs"
            },
            {
              "cmd": "/fix",
              "name": "Fix Issues",
              "desc": "Propose fixes for errors, lints, or failing tests in selection.",
              "ex": "/fix the type error on line 42",
              "badge": "wf",
              "officialUrl": "https://cursor.com/docs"
            }
          ]
        },
        {
          "id": "context",
          "label": "Context & Search",
          "entries": [
            {
              "cmd": "@codebase",
              "name": "Codebase Context",
              "desc": "Include semantic search results from the full workspace.",
              "ex": "@codebase where is rate limiting configured?",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs/context/codebase"
            },
            {
              "cmd": "@docs",
              "name": "Documentation Context",
              "desc": "Attach indexed documentation to the current prompt.",
              "ex": "@docs Next.js App Router caching",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs/context/docs"
            },
            {
              "cmd": "@web",
              "name": "Web Search",
              "desc": "Search the web and include results in the agent context.",
              "ex": "@web latest React 19 migration guide",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs/context/web"
            },
            {
              "cmd": "@file",
              "name": "File Context",
              "desc": "Attach a specific file or folder to the conversation.",
              "ex": "@file src/lib/auth.ts",
              "badge": "chat",
              "officialUrl": "https://cursor.com/docs/context/symbols"
            }
          ]
        }
      ],
      "skills": [
        {
          "cmd": "@refactor-flow",
          "name": "Refactor Flow",
          "auto": false,
          "desc": "Guides larger refactors with checkpoints and validation.",
          "usage": "@refactor-flow <goal>",
          "ex": "@refactor-flow split auth service",
          "trigger": "When user asks for multi-file structural refactors",
          "officialUrl": "https://docs.cursor.com"
        },
        {
          "cmd": "/create-skill",
          "name": "Create Skill",
          "auto": false,
          "desc": "Walk through creating a new Agent Skill with SKILL.md structure.",
          "usage": "/create-skill <description>",
          "ex": "/create-skill for API endpoint testing",
          "trigger": "When user wants to add a reusable agent workflow",
          "configPath": ".cursor/skills/<skill-name>/SKILL.md",
          "configExample": "---\nname: api-testing\ndescription: Test API endpoints with fixtures\n---\n\n## Steps\n1. Read route handlers\n2. Generate test cases",
          "detail": "Run /create-skill to scaffold a new skill, or manually create .cursor/skills/<name>/SKILL.md.\n\nSkills are reusable agent workflows invoked by name or matched by intent.",
          "officialUrl": "https://cursor.com/docs/skills"
        },
        {
          "cmd": "/create-rule",
          "name": "Create Rule",
          "desc": "Create Cursor rules with appropriate scope and instructions.",
          "auto": false,
          "usage": "/create-rule <rule description>",
          "ex": "/create-rule enforce TypeScript strict mode",
          "trigger": "When user wants persistent project conventions",
          "configPath": ".cursor/rules/*.mdc or AGENTS.md",
          "configExample": "---\ndescription: TypeScript strict mode\nglobs: **/*.{ts,tsx}\n---\n\nAlways enable strict null checks.",
          "detail": "Rules persist project conventions. Store in .cursor/rules/ as .mdc files or use AGENTS.md for repo-wide guidance.",
          "officialUrl": "https://cursor.com/docs/context/rules"
        },
        {
          "cmd": "/create-hook",
          "name": "Create Hook",
          "auto": false,
          "desc": "Create lifecycle hooks and update hooks.json for agent events.",
          "usage": "/create-hook <description>",
          "ex": "/create-hook format files after edits",
          "trigger": "When automating agent lifecycle behavior",
          "configPath": ".cursor/hooks.json",
          "configExample": "{\n  \"version\": 1,\n  \"hooks\": {\n    \"afterFileEdit\": [\n      { \"command\": \"prettier --write $FILE\" }\n    ]\n  }\n}",
          "detail": "Hooks fire on agent lifecycle events (sessionStart, preToolUse, afterFileEdit, etc.).\n\nDefine in .cursor/hooks.json at project or user level.",
          "officialUrl": "https://cursor.com/docs/hooks"
        },
        {
          "cmd": "/create-subagent",
          "name": "Create Subagent",
          "auto": false,
          "desc": "Create custom subagents with focused roles and delegation rules.",
          "usage": "/create-subagent <role>",
          "ex": "/create-subagent for security reviews",
          "trigger": "When delegating specialized tasks to subagents",
          "configPath": ".cursor/agents/<agent-name>.md",
          "configExample": "---\nname: security-reviewer\ntools: Read, Grep\ndescription: Read-only security audit subagent\n---\n\nReview changes for OWASP risks.",
          "detail": "Subagents are specialized delegates with their own tools and prompts.\n\nCreate .cursor/agents/<name>.md with frontmatter for name, tools, and instructions.",
          "officialUrl": "https://cursor.com/docs/agent/subagents"
        },
        {
          "cmd": "/migrate-to-skills",
          "name": "Migrate to Skills",
          "auto": false,
          "desc": "Convert eligible dynamic rules and slash commands into Agent Skills.",
          "ex": "/migrate-to-skills",
          "trigger": "When modernizing rules and commands to the skills format",
          "officialUrl": "https://cursor.com/docs/skills"
        },
        {
          "cmd": "/loop",
          "name": "Loop Skill",
          "auto": false,
          "desc": "Run a prompt or skill repeatedly at a specified interval.",
          "usage": "/loop <interval> <prompt>",
          "ex": "/loop 10m check CI status",
          "trigger": "When recurring polling or maintenance is needed",
          "officialUrl": "https://cursor.com/docs/skills"
        },
        {
          "cmd": "/automate",
          "name": "Create Automation",
          "auto": false,
          "desc": "Create Cursor Automations triggered by schedules, Slack, or GitHub.",
          "usage": "/automate <description>",
          "ex": "/automate daily dependency audit",
          "trigger": "When setting up event-driven agent workflows",
          "officialUrl": "https://cursor.com/docs/skills"
        },
        {
          "cmd": "/sdk",
          "name": "Cursor SDK Guide",
          "auto": true,
          "desc": "Guidance for building programmatic agents with the Cursor TypeScript SDK.",
          "usage": "/sdk <task>",
          "ex": "/sdk set up a cloud agent",
          "trigger": "When building agents with @cursor/sdk",
          "officialUrl": "https://cursor.com/docs/cloud-agent/api/endpoints"
        }
      ],
      "agents": [
        {
          "name": "Codebase Explorer",
          "badge": "Focused · Balanced",
          "color": "#0EA5E9",
          "desc": "Explores related files quickly before proposing edits.",
          "tools": "Search, Read, Edit",
          "model": "Cursor Agent",
          "invoke": "On demand",
          "when": "When broad context is needed before code changes",
          "officialUrl": "https://docs.cursor.com"
        },
        {
          "name": "Explore",
          "badge": "Read-only · Fast",
          "color": "#0EA5E9",
          "desc": "Fast codebase exploration without making edits.",
          "tools": "Search, Read, Grep",
          "model": "Composer",
          "invoke": "Automatic",
          "when": "When broad context gathering is needed before changes",
          "configPath": ".cursor/agents/explore.md (optional)",
          "configExample": "---\nname: Explore\ntools: Read, Grep, Glob\ndescription: Read-only codebase search\n---",
          "detail": "Built-in subagent for fast read-only exploration.\n\nCustomize via .cursor/agents/explore.md with YAML frontmatter.",
          "officialUrl": "https://cursor.com/docs/agent/subagents"
        },
        {
          "name": "Shell",
          "badge": "Terminal · Focused",
          "color": "#F59E0B",
          "desc": "Runs terminal commands and inspects output for build and test tasks.",
          "tools": "Shell, Read",
          "model": "Composer",
          "invoke": "On demand",
          "when": "When tasks require command execution and log analysis",
          "officialUrl": "https://cursor.com/docs/agent/subagents"
        },
        {
          "name": "Browser",
          "badge": "Web · Interactive",
          "color": "#8B5CF6",
          "desc": "Controls a browser to test web apps and verify UI behavior.",
          "tools": "Browser, Screenshot",
          "model": "Composer",
          "invoke": "On demand",
          "when": "When validating frontend changes in a running app",
          "officialUrl": "https://cursor.com/docs/agent/browser"
        }
      ],
      "hooks": [
        {
          "cmd": "pre-command",
          "name": "Pre-command Validation",
          "auto": true,
          "desc": "Validates command intent against workspace rules.",
          "usage": "pre-command hook in .cursor/hooks.json",
          "ex": "bash .cursor/hooks/validate-command.sh",
          "trigger": "Runs before command execution",
          "officialUrl": "https://docs.cursor.com"
        },
        {
          "cmd": "sessionStart",
          "name": "Session Start",
          "auto": true,
          "desc": "Run commands when an agent session begins or ends.",
          "usage": "hooks.sessionStart in .cursor/hooks.json",
          "ex": "bash .cursor/hooks/load-env.sh",
          "trigger": "Fires at sessionStart or sessionEnd",
          "officialUrl": "https://cursor.com/docs/hooks"
        },
        {
          "cmd": "preToolUse",
          "name": "Pre-Tool Use",
          "auto": true,
          "desc": "Validate or block tool calls before the agent executes them.",
          "usage": "hooks.preToolUse in .cursor/hooks.json",
          "ex": "bash .cursor/hooks/validate-write.sh",
          "trigger": "Fires before any agent tool call",
          "configPath": ".cursor/hooks.json → hooks.preToolUse",
          "configExample": "{\n  \"hooks\": {\n    \"preToolUse\": [\n      { \"command\": \"bash .cursor/hooks/validate-write.sh\" }\n    ]\n  }\n}",
          "detail": "preToolUse hooks run before each agent tool call.\n\nUse to block dangerous operations or enforce workspace policies.",
          "officialUrl": "https://cursor.com/docs/hooks"
        },
        {
          "cmd": "postToolUse",
          "name": "Post-Tool Use",
          "auto": true,
          "desc": "Observe or react after a tool call completes successfully.",
          "usage": "hooks.postToolUse in .cursor/hooks.json",
          "ex": "bash .cursor/hooks/log-tool.sh",
          "trigger": "Fires after successful tool execution",
          "configPath": ".cursor/hooks.json → hooks.postToolUse",
          "configExample": "{\n  \"hooks\": {\n    \"postToolUse\": [\n      { \"command\": \"bash .cursor/hooks/log-tool.sh\" }\n    ]\n  }\n}",
          "detail": "postToolUse hooks run after a successful tool call.\n\nUse for logging, metrics, or follow-up automation.",
          "officialUrl": "https://cursor.com/docs/hooks"
        },
        {
          "cmd": "afterFileEdit",
          "name": "After File Edit",
          "auto": true,
          "desc": "Run formatters or linters after the agent edits a file.",
          "usage": "hooks.afterFileEdit in .cursor/hooks.json",
          "ex": "prettier --write $FILE",
          "trigger": "Fires after agent file modifications",
          "configPath": ".cursor/hooks.json → hooks.afterFileEdit",
          "configExample": "{\n  \"hooks\": {\n    \"afterFileEdit\": [\n      { \"command\": \"prettier --write $FILE\" }\n    ]\n  }\n}",
          "detail": "afterFileEdit hooks run when the agent modifies a file.\n\nCommon use: auto-format with prettier or eslint --fix.",
          "officialUrl": "https://cursor.com/docs/hooks"
        },
        {
          "cmd": "beforeSubmitPrompt",
          "name": "Before Submit Prompt",
          "auto": true,
          "desc": "Inspect or modify prompts before they are sent to the agent.",
          "usage": "hooks.beforeSubmitPrompt in .cursor/hooks.json",
          "ex": "bash .cursor/hooks/redact-secrets.sh",
          "trigger": "Fires before user prompt is submitted",
          "officialUrl": "https://cursor.com/docs/hooks"
        }
      ]
    },
    "copilot": {
      "maker": "Microsoft/GitHub",
      "subtitle": "Slash commands, IDE keyboard shortcuts, skills, and quality workflows for GitHub Copilot across VS Code, JetBrains, Visual Studio, Xcode, Eclipse, and Vim/Neovim.",
      "officialDocs": [
        "https://docs.github.com/en/copilot",
        "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet",
        "https://code.visualstudio.com/docs/editing/copilot-smart-actions",
        "https://docs.github.com/en/copilot/reference/keyboard-shortcuts"
      ],
      "groups": [
        {
          "id": "chat",
          "label": "Chat Commands",
          "entries": [
            {
              "cmd": "/explain",
              "name": "Explain Code",
              "desc": "Explain selected code or a programming concept in Chat.",
              "ex": "/explain this module",
              "usage": "/explain [code or concept]",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.chatCore,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "/fix",
              "name": "Fix Issues",
              "desc": "Fix selected code or resolve compiler and linting errors.",
              "ex": "/fix this file",
              "usage": "/fix [code or error]",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.chatCore,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "/tests",
              "name": "Generate Tests",
              "desc": "Generate unit tests for selected methods and functions using your project's detected test framework.",
              "ex": "/tests for validateEmail",
              "usage": "/tests [for function or scope]",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.chatCore,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "/doc",
              "name": "Add Documentation",
              "desc": "Generate documentation comments for selected code symbols.",
              "ex": "/doc DeleteBasketAsync method",
              "usage": "/doc [symbol or selection]",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "/help",
              "name": "Copilot Help",
              "desc": "Quick reference for using GitHub Copilot in the editor.",
              "ex": "/help",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.chatCore,
              "officialUrl": "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              "cmd": "/clear",
              "name": "Clear Chat",
              "desc": "Start a new chat session with empty context.",
              "ex": "/clear",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              "cmd": "/new",
              "name": "New Project",
              "desc": "Scaffold a new project from a technology stack description.",
              "ex": "/new Node.js Express TypeScript API",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "/optimize",
              "name": "Optimize Code",
              "desc": "Analyze and improve runtime performance of selected code.",
              "ex": "/optimize the sortUsers function",
              "usage": "/optimize [selection]",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "/simplify",
              "name": "Simplify Code",
              "desc": "Refactor selected code to be clearer and more concise.",
              "ex": "/simplify this nested conditional",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "/fixTestFailure",
              "name": "Fix Test Failure",
              "desc": "Diagnose and suggest fixes for a failing test.",
              "ex": "/fixTestFailure",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
            },
            {
              "cmd": "/setupTests",
              "name": "Setup Tests",
              "desc": "Recommend and configure a testing framework for the project.",
              "ex": "/setupTests",
              "badge": "wf",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            }
          ]
        },
        {
          "id": "editor",
          "label": "Editor Context Menu",
          "entries": [
            {
              "cmd": "Explain",
              "name": "Explain the Code",
              "desc": "Opens Chat with /explain and your editor selection attached as context.",
              "ex": "Right-click selection → Explain",
              "usage": "Editor context menu → Explain",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "Add to Chat",
              "name": "Add to Chat",
              "desc": "Attaches selected code (or the whole file) to Chat as #selection context without sending a slash command.",
              "ex": "Right-click selection → Add to Chat",
              "usage": "Editor context menu → Add to Chat",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            },
            {
              "cmd": "Review",
              "name": "Review Selection",
              "desc": "Quick code review pass with inline comments in the editor and Comments panel.",
              "ex": "Right-click selection → Generate Code → Review",
              "usage": "Editor context menu → Generate Code → Review",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "Generate Tests",
              "name": "Generate Tests",
              "desc": "Opens Chat with /tests and your selection; writes tests to an existing or new test file.",
              "ex": "Right-click selection → Generate Code → Generate Tests",
              "usage": "Editor context menu → Generate Code → Generate Tests",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "Generate Docs",
              "name": "Generate Comments",
              "desc": "Opens Chat with /doc and your selection; adds documentation comments to the code.",
              "ex": "Right-click selection → Generate Code → Generate Docs",
              "usage": "Editor context menu → Generate Code → Generate Docs",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            },
            {
              "cmd": "Optimize",
              "name": "Optimize Selection",
              "desc": "Opens Chat with /optimize and your selection for performance and maintainability improvements.",
              "ex": "Right-click selection → Optimize Selection",
              "usage": "Editor context menu → Optimize Selection",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscodeVs,
              "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
            },
            {
              "cmd": "Fix",
              "name": "Fix Selection",
              "desc": "Opens Chat with /fix and your selection to resolve errors in the selected code.",
              "ex": "Right-click selection → Generate Code → Fix",
              "usage": "Editor context menu → Generate Code → Fix",
              "badge": "ide",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
            }
          ]
        },
        {
          "id": "workspace",
          "label": "Workspace Commands",
          "entries": [
            {
              "cmd": "@workspace",
              "name": "Workspace Agent",
              "desc": "Ask questions scoped to the entire workspace with semantic search.",
              "ex": "@workspace where is authentication configured?",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            },
            {
              "cmd": "@vscode",
              "name": "VS Code Agent",
              "desc": "Get help with VS Code features, settings, and commands.",
              "ex": "@vscode how do I enable format on save?",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.vscode,
              "officialUrl": "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            },
            {
              "cmd": "@terminal",
              "name": "Terminal Context",
              "desc": "Include terminal output and shell context in the chat prompt.",
              "ex": "@terminal explain this build error",
              "badge": "chat",
              "surfaces": COPILOT_SURFACES.chatCore,
              "officialUrl": "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            }
          ]
        }
      ],
      "skills": [
        {
          "cmd": "/setupTests",
          "name": "Test Framework Setup",
          "auto": false,
          "desc": "Guide through choosing and configuring a project test framework.",
          "ex": "/setupTests for a React TypeScript app",
          "trigger": "When user needs test infrastructure from scratch",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
        },
        {
          "cmd": "/savePrompt",
          "name": "Save Prompt",
          "auto": false,
          "desc": "Save a reusable prompt to .github/prompts as a .prompt.md file.",
          "ex": "/savePrompt",
          "trigger": "When capturing a workflow prompt for reuse",
          "surfaces": COPILOT_SURFACES.vscodeVs,
          "configPath": ".github/prompts/<name>.prompt.md",
          "configExample": "---\nname: review-pr\ndescription: Review pull request changes\n---\n\nReview the diff for bugs and style issues.",
          "detail": "Reusable prompts live in .github/prompts/ as .prompt.md files.\n\nRun /savePrompt to capture the current conversation as a prompt template.",
          "officialUrl": "https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context"
        },
        {
          "cmd": "copilot-debug",
          "name": "Copilot Debug",
          "auto": false,
          "desc": "Start a debugging session by prefixing a run command with copilot-debug.",
          "ex": "copilot-debug python app.py",
          "trigger": "When debugging programs with AI-assisted launch configs",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
        }
      ],
      "agents": [
        {
          "name": "Fix and Verify",
          "badge": "Workflow · Reliable",
          "color": "#10B981",
          "desc": "Applies fixes, then validates diagnostics and behavior.",
          "tools": "Edit, Problems, Terminal",
          "model": "Copilot Agent",
          "invoke": "On demand",
          "when": "When handling bug fixes with follow-up validation",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
        },
        {
          "name": "Coding Agent",
          "badge": "Autonomous · Full workspace",
          "color": "#2563EB",
          "desc": "Multi-step agent that edits files, runs terminal commands, and iterates.",
          "tools": "Edit, Terminal, Search",
          "model": "Copilot Agent",
          "invoke": "On demand",
          "when": "When implementing features across multiple files",
          "surfaces": COPILOT_SURFACES.vscode,
          "configPath": ".github/copilot-instructions.md",
          "configExample": "# Copilot instructions\n\n- Use TypeScript strict mode\n- Run tests before completing tasks",
          "detail": "The Coding Agent works across your workspace with edit and terminal access.\n\nGuide behavior via .github/copilot-instructions.md or VS Code custom instructions.",
          "officialUrl": "https://code.visualstudio.com/docs/agents/overview"
        },
        {
          "name": "Workspace",
          "badge": "Search · Read-only",
          "color": "#0EA5E9",
          "desc": "Answers questions using semantic search across the entire workspace.",
          "tools": "Search, Read",
          "model": "GPT-4o",
          "invoke": "Via @workspace",
          "when": "When locating code or understanding project structure",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
        },
        {
          "name": "PR Review Agent",
          "badge": "Review · GitHub",
          "color": "#10B981",
          "desc": "Reviews pull requests and suggests improvements via GitHub integration.",
          "tools": "GitHub API, Diff",
          "model": "Copilot Agent",
          "invoke": "On PR",
          "when": "When reviewing code changes before merge",
          "officialUrl": "https://docs.github.com/en/copilot/using-github-copilot/code-review"
        }
      ],
      "hooks": [
        {
          "cmd": "diagnostic-sync",
          "name": "Diagnostics Hook",
          "auto": true,
          "desc": "Synchronizes diagnostic context into chat responses.",
          "usage": "Diagnostics context before /fix",
          "ex": "/fix this file",
          "trigger": "Runs when diagnostics update",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/editing/copilot-smart-actions"
        },
        {
          "cmd": "test-coverage",
          "name": "Test Coverage (Experimental)",
          "auto": true,
          "desc": "Generate tests for functions not yet covered by existing tests.",
          "usage": "Testing view → generate tests for uncovered functions",
          "ex": "/tests for validateEmail",
          "trigger": "When uncovered functions are detected",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet"
        },
        {
          "cmd": "inline-chat",
          "name": "Inline Chat Hook",
          "auto": true,
          "desc": "Context from cursor position and selection flows into inline chat.",
          "usage": "Ctrl+I with selection",
          "ex": "/explain this module",
          "trigger": "Fires when inline chat opens with editor context",
          "surfaces": COPILOT_SURFACES.vscode,
          "officialUrl": "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
        }
      ]
    }
  }
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

      const seenCmds = new Map<string, number>();
      group.entries.forEach((entry) => {
        const key = entry.cmd.trim();
        seenCmds.set(key, (seenCmds.get(key) ?? 0) + 1);
      });
      for (const [cmd, count] of seenCmds) {
        if (count > 1) {
          warnings.push(`tools.${tool}.groups.${groupLabel} has duplicate cmd "${cmd}" (${count} entries)`);
        }
      }
    });
  }

  return warnings;
}
