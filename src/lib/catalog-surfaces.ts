export type SurfaceId =
  | "claude-code"
  | "claude-desktop"
  | "claude-ide"
  | "claude-chrome"
  | "claude-mobile"
  | "github-actions"
  | "slack"
  | "remote"
  | "cursor-ide"
  | "copilot-vscode"
  | "copilot-jetbrains"
  | "copilot-visualstudio"
  | "copilot-xcode"
  | "copilot-eclipse"
  | "copilot-vim";

export type CatalogTool = "claude" | "cursor" | "copilot";

export const SURFACE_LABELS: Record<SurfaceId, string> = {
  "claude-code": "Claude Code",
  "claude-desktop": "Desktop app",
  "claude-ide": "IDE extension",
  "claude-chrome": "Chrome extension",
  "claude-mobile": "Mobile app",
  "github-actions": "GitHub Actions",
  slack: "Slack",
  remote: "Remote session",
  "cursor-ide": "Cursor IDE",
  "copilot-vscode": "VS Code",
  "copilot-jetbrains": "JetBrains",
  "copilot-visualstudio": "Visual Studio",
  "copilot-xcode": "Xcode",
  "copilot-eclipse": "Eclipse",
  "copilot-vim": "Vim / Neovim",
};

export const TOOL_CATALOG_SURFACE: Record<
  CatalogTool,
  { defaultSurface: SurfaceId; title: string; description: string }
> = {
  claude: {
    defaultSurface: "claude-code",
    title: "Claude Code (terminal)",
    description:
      "Most commands, skills, agents, and hooks run in the Claude Code CLI. Entries tagged below also work on other surfaces.",
  },
  cursor: {
    defaultSurface: "cursor-ide",
    title: "Cursor IDE",
    description: "Commands, skills, and hooks are for the Cursor editor (Composer, chat, and agent).",
  },
  copilot: {
    defaultSurface: "copilot-vscode",
    title: "VS Code & compatible IDEs",
    description:
      "Chat slash commands target VS Code. Keyboard shortcuts vary by IDE — see the Shortcuts modal for JetBrains, Visual Studio, Xcode, Eclipse, and Vim.",
  },
};

export function surfaceLabel(id: SurfaceId) {
  return SURFACE_LABELS[id] ?? id;
}

export function hasExplicitSurfaces(surfaces?: SurfaceId[]) {
  return Array.isArray(surfaces) && surfaces.length > 0;
}

export function renderSurfaceLabels(tool: CatalogTool, surfaces?: SurfaceId[]) {
  if (!hasExplicitSurfaces(surfaces)) return [];
  return surfaces!.map((id) => surfaceLabel(id));
}
