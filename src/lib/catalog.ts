export type Badge = "skill" | "wf" | "chat" | "ide";

export type CommandEntry = {
  cmd: string;
  name: string;
  desc: string;
  ex: string;
  usage?: string;
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

export const baseCatalog: Catalog = {
  generatedAt: "2026-07-03T06:19:57.782Z",
  sourceFeeds: [
    "static-catalog-db"
  ],
  tools: {
    claude: {
      maker: "Anthropic",
      subtitle: "Slash commands, skills, subagents, and workflow hooks for Claude Code environments.",
      officialDocs: [
        "https://docs.anthropic.com/en/docs/claude-code"
      ],
      groups: [
        {
          id: "core",
          label: "Core Commands",
          entries: [
            {
              cmd: "/help",
              name: "Show Help",
              desc: "Lists available commands.",
              ex: "/help",
              badge: "chat",
              officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              cmd: "/review",
              name: "Code Review",
              desc: "Performs severity-first review of selected changes.",
              ex: "/review",
              badge: "wf",
              officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              cmd: "/plan",
              name: "Build Plan",
              desc: "Creates a concise execution plan before coding.",
              ex: "/plan add billing retry",
              badge: "wf",
              officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              cmd: "/mcp list",
              name: "List MCP Servers",
              desc: "Shows configured MCP servers and capabilities.",
              ex: "/mcp list",
              badge: "ide",
              officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
            },
            {
              cmd: "/init",
              name: "Initialize Project",
              desc: "Generate a starter CLAUDE.md guide for the current repository.",
              ex: "/init",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/doctor",
              name: "Diagnose Installation",
              desc: "Verify Claude Code installation, settings, and connectivity.",
              ex: "/doctor",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/diff",
              name: "View Changes",
              desc: "Open an interactive diff viewer for uncommitted and per-turn changes.",
              ex: "/diff",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/mcp",
              name: "Manage MCP Servers",
              desc: "List, connect, enable, or disable MCP server integrations.",
              ex: "/mcp reconnect my-server",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/mcp"
            },
            {
              cmd: "/hooks",
              name: "View Hooks",
              desc: "Inspect configured hook events and their commands.",
              ex: "/hooks",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/hooks"
            },
            {
              cmd: "/skills",
              name: "List Skills",
              desc: "Show available skills and toggle their visibility to Claude.",
              ex: "/skills",
              badge: "skill",
              officialUrl: "https://code.claude.com/docs/en/skills"
            }
          ]
        },
        {
          id: "session",
          label: "Session & Context",
          entries: [
            {
              cmd: "/clear",
              name: "Clear Context",
              desc: "Start a new conversation with empty context while keeping session history.",
              ex: "/clear auth-refactor",
              badge: "chat",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/compact",
              name: "Compact Context",
              desc: "Summarize conversation history to free context window space.",
              ex: "/compact keep API migration details",
              badge: "chat",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/context",
              name: "Context Usage",
              desc: "Visualize what is filling the context window and get optimization tips.",
              ex: "/context all",
              badge: "chat",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/resume",
              name: "Resume Session",
              desc: "Continue a previous conversation by ID, name, or picker.",
              ex: "/resume billing-fix",
              badge: "chat",
              officialUrl: "https://code.claude.com/docs/en/sessions"
            },
            {
              cmd: "/branch",
              name: "Branch Conversation",
              desc: "Fork the current conversation to try a different approach.",
              ex: "/branch redis-cache",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/rewind",
              name: "Rewind Session",
              desc: "Roll back conversation and/or code to a prior checkpoint.",
              ex: "/rewind",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/checkpointing"
            },
            {
              cmd: "/background",
              name: "Background Session",
              desc: "Detach the current session to keep running while freeing the terminal.",
              ex: "/background finish the migration",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/tasks",
              name: "Background Tasks",
              desc: "View and manage subagents and background work in the session.",
              ex: "/tasks",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          id: "review",
          label: "Review & Quality",
          entries: [
            {
              cmd: "/plan",
              name: "Plan Mode",
              desc: "Enter plan mode to design an approach before making code changes.",
              ex: "/plan add retry logic to payments",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/review",
              name: "Review Pull Request",
              desc: "Run a GitHub pull request review using the code-review engine.",
              ex: "/review 42",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/code-review",
              name: "Review Local Diff",
              desc: "Review uncommitted changes for bugs, reuse, and simplification.",
              ex: "/code-review --fix",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/code-review"
            },
            {
              cmd: "/security-review",
              name: "Security Review",
              desc: "Analyze branch diff for injection, auth, and data exposure risks.",
              ex: "/security-review",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/simplify",
              name: "Simplify Changes",
              desc: "Find cleanup opportunities in changed code and apply fixes.",
              ex: "/simplify src/api/",
              badge: "wf",
              officialUrl: "https://code.claude.com/docs/en/commands"
            }
          ]
        },
        {
          id: "config",
          label: "Configuration",
          entries: [
            {
              cmd: "/model",
              name: "Switch Model",
              desc: "Change the active model and optionally adjust effort level.",
              ex: "/model sonnet",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/model-config"
            },
            {
              cmd: "/effort",
              name: "Set Effort Level",
              desc: "Adjust reasoning depth: low, medium, high, xhigh, max, or auto.",
              ex: "/effort high",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/commands"
            },
            {
              cmd: "/permissions",
              name: "Manage Permissions",
              desc: "Configure allow, ask, and deny rules for tool usage.",
              ex: "/permissions",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/permissions"
            },
            {
              cmd: "/config",
              name: "Open Settings",
              desc: "Adjust theme, model, output style, and other preferences.",
              ex: "/config theme=dark",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/settings"
            },
            {
              cmd: "/memory",
              name: "Edit Memory",
              desc: "Manage CLAUDE.md memory files and auto-memory entries.",
              ex: "/memory",
              badge: "ide",
              officialUrl: "https://code.claude.com/docs/en/memory"
            },
            {
              cmd: "/usage",
              name: "Usage & Cost",
              desc: "Show session cost, plan limits, and usage breakdown by skill or MCP.",
              ex: "/usage",
              badge: "chat",
              officialUrl: "https://code.claude.com/docs/en/costs"
            }
          ]
        }
      ],
      skills: [
        {
          cmd: "/project-setup-info-local",
          name: "Project Setup Info",
          auto: true,
          desc: "Scaffolding guidance for complete project setup.",
          ex: "/project-setup-info-local setup Next.js app",
          trigger: "When user asks to initialize a full project",
          officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
        },
        {
          cmd: "/batch",
          name: "Batch Migration",
          auto: false,
          desc: "Decompose large codebase changes into parallel subagent work units.",
          ex: "/batch migrate src/ from Solid to React",
          trigger: "When orchestrating large multi-file migrations",
          officialUrl: "https://code.claude.com/docs/en/commands"
        },
        {
          cmd: "/debug",
          name: "Debug Session",
          auto: false,
          desc: "Enable debug logging and troubleshoot issues from session logs.",
          ex: "/debug MCP connection timeout",
          trigger: "When diagnosing Claude Code runtime issues",
          officialUrl: "https://code.claude.com/docs/en/commands"
        },
        {
          cmd: "/loop",
          name: "Loop Prompt",
          auto: false,
          desc: "Run a prompt repeatedly on an interval while the session stays open.",
          ex: "/loop 5m check if deploy finished",
          trigger: "When polling or recurring maintenance is needed",
          officialUrl: "https://code.claude.com/docs/en/scheduled-tasks"
        },
        {
          cmd: "/run",
          name: "Run App",
          auto: false,
          desc: "Launch and drive the project app to verify a change works end-to-end.",
          ex: "/run",
          trigger: "When validating behavior beyond unit tests",
          officialUrl: "https://code.claude.com/docs/en/commands"
        },
        {
          cmd: "/verify",
          name: "Verify Change",
          auto: false,
          desc: "Build and run the app to confirm a change works as intended.",
          ex: "/verify",
          trigger: "When confirming functional behavior of a code change",
          officialUrl: "https://code.claude.com/docs/en/commands"
        },
        {
          cmd: "/claude-api",
          name: "Claude API Reference",
          auto: true,
          desc: "Load Claude API reference material for the project's language and SDK.",
          ex: "/claude-api migrate",
          trigger: "When code imports anthropic SDK or needs API guidance",
          officialUrl: "https://code.claude.com/docs/en/commands"
        },
        {
          cmd: "/fewer-permission-prompts",
          name: "Reduce Permission Prompts",
          auto: false,
          desc: "Scan transcripts and add allowlist rules for common read-only tool calls.",
          ex: "/fewer-permission-prompts",
          trigger: "When permission prompts slow down routine workflows",
          officialUrl: "https://code.claude.com/docs/en/commands"
        }
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
          officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
        },
        {
          name: "Plan",
          badge: "Read-only · Planning",
          color: "#8B5CF6",
          desc: "Researches codebase in plan mode while keeping the main session read-only.",
          tools: "Read, Search, Grep",
          model: "Inherits session model",
          invoke: "Automatic in plan mode",
          when: "When planning requires codebase exploration",
          officialUrl: "https://code.claude.com/docs/en/sub-agents"
        },
        {
          name: "general-purpose",
          badge: "Full access · Balanced",
          color: "#10B981",
          desc: "Handles tasks requiring exploration, modification, and multi-step reasoning.",
          tools: "Read, Edit, Bash, Search",
          model: "Inherits session model",
          invoke: "Automatic",
          when: "When a task needs both research and code changes",
          officialUrl: "https://code.claude.com/docs/en/sub-agents"
        }
      ],
      hooks: [
        {
          cmd: "onRouteChange",
          name: "Route Transition Hook",
          auto: true,
          desc: "Resets scroll and updates active route state.",
          ex: "window.scrollTo(0,0)",
          trigger: "Runs when route changes",
          officialUrl: "https://docs.anthropic.com/en/docs/claude-code"
        },
        {
          cmd: "PreToolUse",
          name: "Pre-Tool Validation",
          auto: true,
          desc: "Run scripts before tool calls to block, allow, or modify execution.",
          ex: "block rm -rf in .claude/settings.json hooks",
          trigger: "Fires before any tool call executes",
          officialUrl: "https://code.claude.com/docs/en/hooks"
        },
        {
          cmd: "PostToolUse",
          name: "Post-Tool Formatting",
          auto: true,
          desc: "Run scripts after successful tool calls, e.g. auto-format edited files.",
          ex: "prettier --write $FILE after Edit|Write",
          trigger: "Fires after a tool call succeeds",
          officialUrl: "https://code.claude.com/docs/en/hooks-guide"
        },
        {
          cmd: "SessionStart",
          name: "Session Start Hook",
          auto: true,
          desc: "Inject context when a session begins, resumes, clears, or compacts.",
          ex: "reload env vars after /compact",
          trigger: "Fires on startup, resume, clear, or compact",
          officialUrl: "https://code.claude.com/docs/en/hooks"
        },
        {
          cmd: "Notification",
          name: "Desktop Notification",
          auto: true,
          desc: "Send OS notifications when Claude needs input or permission.",
          ex: "notify-send 'Claude needs your attention'",
          trigger: "Fires when Claude waits for user input",
          officialUrl: "https://code.claude.com/docs/en/hooks-guide"
        },
        {
          cmd: "Stop",
          name: "Stop Hook",
          auto: true,
          desc: "Run scripts when Claude finishes a response turn.",
          ex: "log session activity on turn complete",
          trigger: "Fires when Claude finishes responding",
          officialUrl: "https://code.claude.com/docs/en/hooks"
        }
      ]
    },
    cursor: {
      maker: "Anysphere",
      subtitle: "Commands, automation hooks, and IDE workflows for Cursor.",
      officialDocs: [
        "https://docs.cursor.com"
      ],
      groups: [
        {
          id: "core",
          label: "Core Commands",
          entries: [
            {
              cmd: "/chat",
              name: "Composer Chat",
              desc: "Open contextual chat.",
              ex: "/chat explain auth flow",
              badge: "chat",
              officialUrl: "https://docs.cursor.com"
            },
            {
              cmd: "/edit",
              name: "Inline Edit",
              desc: "Apply focused edits to selected code.",
              ex: "/edit simplify function",
              badge: "ide",
              officialUrl: "https://docs.cursor.com"
            },
            {
              cmd: "/agent",
              name: "Agent Mode",
              desc: "Run multi-step autonomous coding task.",
              ex: "/agent add caching",
              badge: "wf",
              officialUrl: "https://docs.cursor.com"
            },
            {
              cmd: "/chat",
              name: "Agent Chat",
              desc: "Open contextual agent chat for questions and multi-step tasks.",
              ex: "/chat explain the auth middleware",
              badge: "chat",
              officialUrl: "https://cursor.com/docs/agent/overview"
            },
            {
              cmd: "/ask",
              name: "Quick Ask",
              desc: "Ask a focused question about selected code or the current file.",
              ex: "/ask what does this regex match?",
              badge: "chat",
              officialUrl: "https://cursor.com/docs"
            },
            {
              cmd: "/generate",
              name: "Generate Code",
              desc: "Generate code from a natural-language description in context.",
              ex: "/generate a Zod schema for UserProfile",
              badge: "ide",
              officialUrl: "https://cursor.com/docs"
            },
            {
              cmd: "/fix",
              name: "Fix Issues",
              desc: "Propose fixes for errors, lints, or failing tests in selection.",
              ex: "/fix the type error on line 42",
              badge: "wf",
              officialUrl: "https://cursor.com/docs"
            }
          ]
        },
        {
          id: "context",
          label: "Context & Search",
          entries: [
            {
              cmd: "@codebase",
              name: "Codebase Context",
              desc: "Include semantic search results from the full workspace.",
              ex: "@codebase where is rate limiting configured?",
              badge: "chat",
              officialUrl: "https://cursor.com/docs/context/codebase"
            },
            {
              cmd: "@docs",
              name: "Documentation Context",
              desc: "Attach indexed documentation to the current prompt.",
              ex: "@docs Next.js App Router caching",
              badge: "chat",
              officialUrl: "https://cursor.com/docs/context/docs"
            },
            {
              cmd: "@web",
              name: "Web Search",
              desc: "Search the web and include results in the agent context.",
              ex: "@web latest React 19 migration guide",
              badge: "chat",
              officialUrl: "https://cursor.com/docs/context/web"
            },
            {
              cmd: "@file",
              name: "File Context",
              desc: "Attach a specific file or folder to the conversation.",
              ex: "@file src/lib/auth.ts",
              badge: "chat",
              officialUrl: "https://cursor.com/docs/context/symbols"
            }
          ]
        }
      ],
      skills: [
        {
          cmd: "@refactor-flow",
          name: "Refactor Flow",
          auto: false,
          desc: "Guides larger refactors with checkpoints and validation.",
          ex: "@refactor-flow split auth service",
          trigger: "When user asks for multi-file structural refactors",
          officialUrl: "https://docs.cursor.com"
        },
        {
          cmd: "/create-skill",
          name: "Create Skill",
          auto: false,
          desc: "Walk through creating a new Agent Skill with SKILL.md structure.",
          ex: "/create-skill for API endpoint testing",
          trigger: "When user wants to add a reusable agent workflow",
          officialUrl: "https://cursor.com/docs/skills"
        },
        {
          cmd: "/create-rule",
          name: "Create Rule",
          desc: "Create Cursor rules with appropriate scope and instructions.",
          auto: false,
          ex: "/create-rule enforce TypeScript strict mode",
          trigger: "When user wants persistent project conventions",
          officialUrl: "https://cursor.com/docs/context/rules"
        },
        {
          cmd: "/create-hook",
          name: "Create Hook",
          auto: false,
          desc: "Create lifecycle hooks and update hooks.json for agent events.",
          ex: "/create-hook format files after edits",
          trigger: "When automating agent lifecycle behavior",
          officialUrl: "https://cursor.com/docs/hooks"
        },
        {
          cmd: "/create-subagent",
          name: "Create Subagent",
          auto: false,
          desc: "Create custom subagents with focused roles and delegation rules.",
          ex: "/create-subagent for security reviews",
          trigger: "When delegating specialized tasks to subagents",
          officialUrl: "https://cursor.com/docs/agent/subagents"
        },
        {
          cmd: "/migrate-to-skills",
          name: "Migrate to Skills",
          auto: false,
          desc: "Convert eligible dynamic rules and slash commands into Agent Skills.",
          ex: "/migrate-to-skills",
          trigger: "When modernizing rules and commands to the skills format",
          officialUrl: "https://cursor.com/docs/skills"
        },
        {
          cmd: "/loop",
          name: "Loop Skill",
          auto: false,
          desc: "Run a prompt or skill repeatedly at a specified interval.",
          ex: "/loop 10m check CI status",
          trigger: "When recurring polling or maintenance is needed",
          officialUrl: "https://cursor.com/docs/skills"
        },
        {
          cmd: "/automate",
          name: "Create Automation",
          auto: false,
          desc: "Create Cursor Automations triggered by schedules, Slack, or GitHub.",
          ex: "/automate daily dependency audit",
          trigger: "When setting up event-driven agent workflows",
          officialUrl: "https://cursor.com/docs/skills"
        },
        {
          cmd: "/sdk",
          name: "Cursor SDK Guide",
          auto: true,
          desc: "Guidance for building programmatic agents with the Cursor TypeScript SDK.",
          ex: "/sdk set up a cloud agent",
          trigger: "When building agents with @cursor/sdk",
          officialUrl: "https://cursor.com/docs/cloud-agent/api/endpoints"
        }
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
          officialUrl: "https://docs.cursor.com"
        },
        {
          name: "Explore",
          badge: "Read-only · Fast",
          color: "#0EA5E9",
          desc: "Fast codebase exploration without making edits.",
          tools: "Search, Read, Grep",
          model: "Composer",
          invoke: "Automatic",
          when: "When broad context gathering is needed before changes",
          officialUrl: "https://cursor.com/docs/agent/subagents"
        },
        {
          name: "Shell",
          badge: "Terminal · Focused",
          color: "#F59E0B",
          desc: "Runs terminal commands and inspects output for build and test tasks.",
          tools: "Shell, Read",
          model: "Composer",
          invoke: "On demand",
          when: "When tasks require command execution and log analysis",
          officialUrl: "https://cursor.com/docs/agent/subagents"
        },
        {
          name: "Browser",
          badge: "Web · Interactive",
          color: "#8B5CF6",
          desc: "Controls a browser to test web apps and verify UI behavior.",
          tools: "Browser, Screenshot",
          model: "Composer",
          invoke: "On demand",
          when: "When validating frontend changes in a running app",
          officialUrl: "https://cursor.com/docs/agent/browser"
        }
      ],
      hooks: [
        {
          cmd: "pre-command",
          name: "Pre-command Validation",
          auto: true,
          desc: "Validates command intent against workspace rules.",
          ex: "check .cursor/rules",
          trigger: "Runs before command execution",
          officialUrl: "https://docs.cursor.com"
        },
        {
          cmd: "sessionStart",
          name: "Session Start",
          auto: true,
          desc: "Run commands when an agent session begins or ends.",
          ex: "inject project env vars on sessionStart",
          trigger: "Fires at sessionStart or sessionEnd",
          officialUrl: "https://cursor.com/docs/hooks"
        },
        {
          cmd: "preToolUse",
          name: "Pre-Tool Use",
          auto: true,
          desc: "Validate or block tool calls before the agent executes them.",
          ex: "deny writes outside src/ on preToolUse",
          trigger: "Fires before any agent tool call",
          officialUrl: "https://cursor.com/docs/hooks"
        },
        {
          cmd: "postToolUse",
          name: "Post-Tool Use",
          auto: true,
          desc: "Observe or react after a tool call completes successfully.",
          ex: "log tool usage on postToolUse",
          trigger: "Fires after successful tool execution",
          officialUrl: "https://cursor.com/docs/hooks"
        },
        {
          cmd: "afterFileEdit",
          name: "After File Edit",
          auto: true,
          desc: "Run formatters or linters after the agent edits a file.",
          ex: ".cursor/hooks/format.sh on afterFileEdit",
          trigger: "Fires after agent file modifications",
          officialUrl: "https://cursor.com/docs/hooks"
        },
        {
          cmd: "beforeSubmitPrompt",
          name: "Before Submit Prompt",
          auto: true,
          desc: "Inspect or modify prompts before they are sent to the agent.",
          ex: "redact secrets in beforeSubmitPrompt",
          trigger: "Fires before user prompt is submitted",
          officialUrl: "https://cursor.com/docs/hooks"
        }
      ]
    },
    copilot: {
      maker: "Microsoft/GitHub",
      subtitle: "Slash commands, reusable skills, and quality workflows for GitHub Copilot in VS Code.",
      officialDocs: [
        "https://code.visualstudio.com/docs/copilot"
      ],
      groups: [
        {
          id: "chat",
          label: "Chat Commands",
          entries: [
            {
              cmd: "/explain",
              name: "Explain Code",
              desc: "Explain selected code behavior.",
              ex: "/explain this module",
              badge: "chat",
              officialUrl: "https://code.visualstudio.com/docs/copilot"
            },
            {
              cmd: "/fix",
              name: "Fix Issues",
              desc: "Fixes current diagnostics with proposed edits.",
              ex: "/fix this file",
              badge: "wf",
              officialUrl: "https://code.visualstudio.com/docs/copilot"
            },
            {
              cmd: "/tests",
              name: "Create Tests",
              desc: "Generate tests from context.",
              ex: "/tests for auth",
              badge: "wf",
              officialUrl: "https://code.visualstudio.com/docs/copilot"
            },
            {
              cmd: "/tests",
              name: "Generate Tests",
              desc: "Create unit tests for selected functions using detected framework.",
              ex: "/tests for validateEmail",
              badge: "wf",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/doc",
              name: "Add Documentation",
              desc: "Generate documentation comments for selected code symbols.",
              ex: "/doc DeleteBasketAsync method",
              badge: "ide",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/help",
              name: "Copilot Help",
              desc: "Quick reference for using GitHub Copilot in the editor.",
              ex: "/help",
              badge: "chat",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/clear",
              name: "Clear Chat",
              desc: "Start a new chat session with empty context.",
              ex: "/clear",
              badge: "chat",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/new",
              name: "New Project",
              desc: "Scaffold a new project from a technology stack description.",
              ex: "/new Node.js Express TypeScript API",
              badge: "wf",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/optimize",
              name: "Optimize Code",
              desc: "Analyze and improve runtime performance of selected code.",
              ex: "/optimize the sortUsers function",
              badge: "wf",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/simplify",
              name: "Simplify Code",
              desc: "Refactor selected code to be clearer and more concise.",
              ex: "/simplify this nested conditional",
              badge: "wf",
              officialUrl: "https://docs.github.com/en/copilot/reference/chat-cheat-sheet"
            },
            {
              cmd: "/fixTestFailure",
              name: "Fix Test Failure",
              desc: "Diagnose and suggest fixes for a failing test.",
              ex: "/fixTestFailure",
              badge: "wf",
              officialUrl: "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
            },
            {
              cmd: "/setupTests",
              name: "Setup Tests",
              desc: "Recommend and configure a testing framework for the project.",
              ex: "/setupTests",
              badge: "wf",
              officialUrl: "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
            }
          ]
        },
        {
          id: "workspace",
          label: "Workspace Commands",
          entries: [
            {
              cmd: "@workspace",
              name: "Workspace Agent",
              desc: "Ask questions scoped to the entire workspace with semantic search.",
              ex: "@workspace where is authentication configured?",
              badge: "chat",
              officialUrl: "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            },
            {
              cmd: "@vscode",
              name: "VS Code Agent",
              desc: "Get help with VS Code features, settings, and commands.",
              ex: "@vscode how do I enable format on save?",
              badge: "chat",
              officialUrl: "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            },
            {
              cmd: "@terminal",
              name: "Terminal Context",
              desc: "Include terminal output and shell context in the chat prompt.",
              ex: "@terminal explain this build error",
              badge: "chat",
              officialUrl: "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
            }
          ]
        }
      ],
      skills: [
        {
          cmd: "/tests",
          name: "Test Scaffolding Skill",
          auto: false,
          desc: "Builds baseline unit and integration tests from local context.",
          ex: "/tests for notify route",
          trigger: "When user asks for test generation",
          officialUrl: "https://code.visualstudio.com/docs/copilot"
        },
        {
          cmd: "/setupTests",
          name: "Test Framework Setup",
          auto: false,
          desc: "Guide through choosing and configuring a project test framework.",
          ex: "/setupTests for a React TypeScript app",
          trigger: "When user needs test infrastructure from scratch",
          officialUrl: "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
        },
        {
          cmd: "/savePrompt",
          name: "Save Prompt",
          auto: false,
          desc: "Save a reusable prompt to .github/prompts as a .prompt.md file.",
          ex: "/savePrompt",
          trigger: "When capturing a workflow prompt for reuse",
          officialUrl: "https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context"
        },
        {
          cmd: "copilot-debug",
          name: "Copilot Debug",
          auto: false,
          desc: "Start a debugging session by prefixing a run command with copilot-debug.",
          ex: "copilot-debug python app.py",
          trigger: "When debugging programs with AI-assisted launch configs",
          officialUrl: "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
        }
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
          officialUrl: "https://code.visualstudio.com/docs/copilot"
        },
        {
          name: "Coding Agent",
          badge: "Autonomous · Full workspace",
          color: "#2563EB",
          desc: "Multi-step agent that edits files, runs terminal commands, and iterates.",
          tools: "Edit, Terminal, Search",
          model: "Copilot Agent",
          invoke: "On demand",
          when: "When implementing features across multiple files",
          officialUrl: "https://code.visualstudio.com/docs/copilot/copilot-coding-agent"
        },
        {
          name: "Workspace",
          badge: "Search · Read-only",
          color: "#0EA5E9",
          desc: "Answers questions using semantic search across the entire workspace.",
          tools: "Search, Read",
          model: "GPT-4o",
          invoke: "Via @workspace",
          when: "When locating code or understanding project structure",
          officialUrl: "https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context"
        },
        {
          name: "PR Review Agent",
          badge: "Review · GitHub",
          color: "#10B981",
          desc: "Reviews pull requests and suggests improvements via GitHub integration.",
          tools: "GitHub API, Diff",
          model: "Copilot Agent",
          invoke: "On PR",
          when: "When reviewing code changes before merge",
          officialUrl: "https://docs.github.com/en/copilot/using-github-copilot/code-review"
        }
      ],
      hooks: [
        {
          cmd: "diagnostic-sync",
          name: "Diagnostics Hook",
          auto: true,
          desc: "Synchronizes diagnostic context into chat responses.",
          ex: "read Problems panel before /fix",
          trigger: "Runs when diagnostics update",
          officialUrl: "https://code.visualstudio.com/docs/copilot"
        },
        {
          cmd: "test-coverage",
          name: "Test Coverage (Experimental)",
          auto: true,
          desc: "Generate tests for functions not yet covered by existing tests.",
          ex: "trigger from Testing view coverage gaps",
          trigger: "When uncovered functions are detected",
          officialUrl: "https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features"
        },
        {
          cmd: "inline-chat",
          name: "Inline Chat Hook",
          auto: true,
          desc: "Context from cursor position and selection flows into inline chat.",
          ex: "Ctrl+I with selection for /explain",
          trigger: "Fires when inline chat opens with editor context",
          officialUrl: "https://code.visualstudio.com/docs/copilot/chat/getting-started-chat"
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
    });
  }

  return warnings;
}
