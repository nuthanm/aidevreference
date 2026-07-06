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

/** Reusable Copilot IDE sets — see GitHub Copilot chat cheat sheet (per-IDE tabs). */
export const COPILOT_SURFACES = {
  vscode: ["copilot-vscode"] as SurfaceId[],
  chatCore: ["copilot-vscode", "copilot-jetbrains", "copilot-visualstudio"] as SurfaceId[],
  vscodeVs: ["copilot-vscode", "copilot-visualstudio"] as SurfaceId[],
} as const;

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
    title: "IDE availability",
    description:
      "Each entry is tagged with supported IDEs. VS Code has the fullest feature set (agents, @workspace, smart actions). JetBrains and Visual Studio share core chat slash commands. Inline suggestions also work in Xcode, Eclipse, and Vim — see Keyboard shortcuts.",
  },
};

export function surfaceLabel(id: SurfaceId) {
  return SURFACE_LABELS[id] ?? id;
}

export function hasExplicitSurfaces(surfaces?: SurfaceId[]) {
  return Array.isArray(surfaces) && surfaces.length > 0;
}

export function effectiveSurfaces(tool: CatalogTool, surfaces?: SurfaceId[]): SurfaceId[] {
  if (hasExplicitSurfaces(surfaces)) return surfaces!;
  if (tool === "copilot") return [TOOL_CATALOG_SURFACE.copilot.defaultSurface];
  return [];
}

export function renderSurfaceLabels(tool: CatalogTool, surfaces?: SurfaceId[]) {
  return effectiveSurfaces(tool, surfaces).map((id) => surfaceLabel(id));
}
