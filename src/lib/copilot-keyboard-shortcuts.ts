export type KeyboardShortcutRow = {
  action: string;
  shortcut: string;
  commandName?: string;
};

export type KeyboardShortcutPlatformTable = {
  id: string;
  label: string;
  shortcuts: KeyboardShortcutRow[];
};

export type KeyboardShortcutIde = {
  id: string;
  label: string;
  note?: string;
  officialUrl?: string;
  platforms?: KeyboardShortcutPlatformTable[];
  shortcuts?: KeyboardShortcutRow[];
};

/** Generic GitHub Copilot keyboard shortcuts page (fallback when a per-IDE tab URL is unavailable). */
export const COPILOT_KEYBOARD_SHORTCUTS_DOCS =
  "https://docs.github.com/en/copilot/reference/keyboard-shortcuts";

/** Per-IDE GitHub Docs tabs — verified against docs.github.com. */
export const COPILOT_KEYBOARD_SHORTCUTS_BY_TOOL = {
  vscode: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=vscode`,
  visualstudio: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=visualstudio`,
  jetbrains: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=jetbrains`,
  eclipse: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=eclipse`,
  vimneovim: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=vimneovim`,
  xcode: `${COPILOT_KEYBOARD_SHORTCUTS_DOCS}?tool=xcode`,
} as const;

export type CopilotKeyboardShortcutsTool = keyof typeof COPILOT_KEYBOARD_SHORTCUTS_BY_TOOL;

export function copilotKeyboardShortcutsUrl(tool?: CopilotKeyboardShortcutsTool) {
  if (!tool) return COPILOT_KEYBOARD_SHORTCUTS_DOCS;
  return COPILOT_KEYBOARD_SHORTCUTS_BY_TOOL[tool] ?? COPILOT_KEYBOARD_SHORTCUTS_DOCS;
}
