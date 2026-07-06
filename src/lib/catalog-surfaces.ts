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

/** Short tags shown on catalog cards — Terminal / IDE where it helps visitors scan quickly. */
export const SURFACE_TAG_LABELS: Record<SurfaceId, string> = {
  "claude-code": "Terminal",
  "claude-desktop": "Desktop",
  "claude-ide": "IDE",
  "claude-chrome": "Chrome",
  "claude-mobile": "Mobile",
  "github-actions": "GitHub Actions",
  slack: "Slack",
  remote: "Remote",
  "cursor-ide": "IDE",
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
    title: "Default surface",
    description:
      "Most entries run in the Claude Code terminal. Additional tags show when the same command also targets Desktop, IDE, Chrome, or other integrations.",
  },
  cursor: {
    defaultSurface: "cursor-ide",
    title: "Default surface",
    description: "Commands, skills, agents, and hooks run inside the Cursor IDE (Agent chat, Composer, and inline edit).",
  },
  copilot: {
    defaultSurface: "copilot-vscode",
    title: "IDE availability",
    description:
      "Each entry is tagged with supported IDEs. VS Code has the fullest feature set. JetBrains and Visual Studio share core chat slash commands.",
  },
};

export function surfaceLabel(id: SurfaceId) {
  return SURFACE_LABELS[id] ?? id;
}

export function surfaceTagLabel(id: SurfaceId) {
  return SURFACE_TAG_LABELS[id] ?? surfaceLabel(id);
}

export function hasExplicitSurfaces(surfaces?: SurfaceId[]) {
  return Array.isArray(surfaces) && surfaces.length > 0;
}

export function effectiveSurfaces(tool: CatalogTool, surfaces?: SurfaceId[]): SurfaceId[] {
  if (tool === "claude") {
    const base: SurfaceId[] = ["claude-code"];
    if (hasExplicitSurfaces(surfaces)) {
      return [...new Set([...base, ...surfaces!])];
    }
    return base;
  }
  if (tool === "cursor") {
    if (hasExplicitSurfaces(surfaces)) return surfaces!;
    return ["cursor-ide"];
  }
  if (tool === "copilot") {
    if (hasExplicitSurfaces(surfaces)) return surfaces!;
    return [TOOL_CATALOG_SURFACE.copilot.defaultSurface];
  }
  return [];
}

export function renderSurfaceLabels(tool: CatalogTool, surfaces?: SurfaceId[]) {
  return effectiveSurfaces(tool, surfaces).map((id) => surfaceTagLabel(id));
}
