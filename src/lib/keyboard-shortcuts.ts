/**
 * Keyboard shortcuts sourced from official documentation only.
 * Last verified against vendor docs — see sourceUrl on each tool.
 */

export type ShortcutTool = "claude" | "cursor" | "copilot";

export type KeyboardShortcut = {
  action: string;
  mac: string;
  winLinux: string;
};

export type ShortcutSection = {
  title: string;
  shortcuts: KeyboardShortcut[];
};

export type ToolShortcuts = {
  label: string;
  sourceUrl: string;
  sourceLabel: string;
  sections: ShortcutSection[];
};

export const KEYBOARD_SHORTCUTS: Record<ShortcutTool, ToolShortcuts> = {
  claude: {
    label: "Claude Code",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode",
    sourceLabel: "Anthropic — Interactive mode",
    sections: [
      {
        title: "General controls",
        shortcuts: [
          { action: "Interrupt, or clear input", mac: "Ctrl+C", winLinux: "Ctrl+C" },
          { action: "Exit Claude Code session", mac: "Ctrl+D", winLinux: "Ctrl+D" },
          { action: "Redraw screen", mac: "Ctrl+L", winLinux: "Ctrl+L" },
          { action: "Toggle transcript viewer", mac: "Ctrl+O", winLinux: "Ctrl+O" },
          { action: "Reverse search command history", mac: "Ctrl+R", winLinux: "Ctrl+R" },
          { action: "Background running tasks", mac: "Ctrl+B", winLinux: "Ctrl+B" },
          { action: "Toggle task checklist", mac: "Ctrl+T", winLinux: "Ctrl+T" },
          { action: "Interrupt Claude mid-turn", mac: "Esc", winLinux: "Esc" },
          { action: "Clear input draft, or rewind", mac: "Esc + Esc", winLinux: "Esc + Esc" },
          { action: "Cycle permission modes", mac: "Shift+Tab or Option+M", winLinux: "Shift+Tab or Alt+M" },
          { action: "Switch model", mac: "Option+P", winLinux: "Alt+P" },
          { action: "Toggle extended thinking", mac: "Option+T", winLinux: "Alt+T" },
          { action: "Toggle fast mode", mac: "Option+O", winLinux: "Alt+O" },
          { action: "Paste image from clipboard", mac: "Ctrl+V or Cmd+V (iTerm2)", winLinux: "Ctrl+V or Alt+V (WSL)" },
        ],
      },
      {
        title: "Text editing",
        shortcuts: [
          { action: "Move cursor to start of line", mac: "Ctrl+A", winLinux: "Ctrl+A" },
          { action: "Move cursor to end of line", mac: "Ctrl+E", winLinux: "Ctrl+E" },
          { action: "Delete to end of line", mac: "Ctrl+K", winLinux: "Ctrl+K" },
          { action: "Delete from cursor to line start", mac: "Ctrl+U", winLinux: "Ctrl+U" },
          { action: "Delete previous word", mac: "Ctrl+W", winLinux: "Ctrl+W or Ctrl+Backspace" },
          { action: "Paste deleted text", mac: "Ctrl+Y", winLinux: "Ctrl+Y" },
          { action: "Move cursor back one word", mac: "Option+B", winLinux: "Alt+B" },
          { action: "Move cursor forward one word", mac: "Option+F", winLinux: "Alt+F" },
        ],
      },
      {
        title: "Multiline input",
        shortcuts: [
          { action: "Quick escape (all terminals)", mac: "\\ + Enter", winLinux: "\\ + Enter" },
          { action: "New line (native terminals)", mac: "Shift+Enter", winLinux: "Shift+Enter" },
          { action: "New line (any terminal)", mac: "Ctrl+J", winLinux: "Ctrl+J" },
          { action: "New line (Option as Meta)", mac: "Option+Enter", winLinux: "—" },
        ],
      },
      {
        title: "Quick commands",
        shortcuts: [
          { action: "Command or skill", mac: "/ at start", winLinux: "/ at start" },
          { action: "Shell mode", mac: "! at start", winLinux: "! at start" },
          { action: "File path mention", mac: "@", winLinux: "@" },
        ],
      },
    ],
  },
  cursor: {
    label: "Cursor",
    sourceUrl: "https://cursor.com/docs/reference/keyboard-shortcuts",
    sourceLabel: "Cursor — Keyboard Shortcuts reference",
    sections: [
      {
        title: "General",
        shortcuts: [
          { action: "Toggle Sidepanel", mac: "Cmd+I or Cmd+L", winLinux: "Ctrl+I or Ctrl+L" },
          { action: "Toggle Agent layout", mac: "Cmd+E", winLinux: "Ctrl+E" },
          { action: "Mode Menu", mac: "Cmd+.", winLinux: "Ctrl+." },
          { action: "Loop between AI models", mac: "Cmd+/", winLinux: "Ctrl+/" },
          { action: "Cursor settings", mac: "Cmd+Shift+J", winLinux: "Ctrl+Shift+J" },
          { action: "Command palette", mac: "Cmd+Shift+P", winLinux: "Ctrl+Shift+P" },
          { action: "General settings", mac: "Cmd+,", winLinux: "Ctrl+," },
        ],
      },
      {
        title: "Chat",
        shortcuts: [
          { action: "Nudge (default send)", mac: "Return", winLinux: "Return" },
          { action: "Queue message", mac: "Ctrl+Return", winLinux: "Ctrl+Return" },
          { action: "Force send message while typing", mac: "Cmd+Return", winLinux: "Ctrl+Return" },
          { action: "Cancel generation", mac: "Cmd+Shift+Backspace", winLinux: "Ctrl+Shift+Backspace" },
          { action: "Add selected code as context", mac: "Cmd+Shift+L", winLinux: "Ctrl+Shift+L" },
          { action: "Accept all suggested changes", mac: "Cmd+Return", winLinux: "Ctrl+Return" },
          { action: "Reject all suggested changes", mac: "Cmd+Backspace", winLinux: "Ctrl+Backspace" },
          { action: "Rotate between Agent modes", mac: "Shift+Tab", winLinux: "Shift+Tab" },
          { action: "New chat", mac: "Cmd+N or Cmd+R", winLinux: "Ctrl+N or Ctrl+R" },
          { action: "Close chat", mac: "Cmd+W", winLinux: "Ctrl+W" },
          { action: "Unfocus field", mac: "Escape", winLinux: "Escape" },
        ],
      },
      {
        title: "Inline edit",
        shortcuts: [
          { action: "Open inline edit", mac: "Cmd+K", winLinux: "Ctrl+K" },
          { action: "Submit", mac: "Return", winLinux: "Return" },
          { action: "Cancel", mac: "Cmd+Shift+Backspace", winLinux: "Ctrl+Shift+Backspace" },
          { action: "Ask quick question", mac: "Option+Return", winLinux: "Alt+Return" },
        ],
      },
      {
        title: "Tab completion",
        shortcuts: [
          { action: "Accept suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "Accept next word", mac: "Cmd+→", winLinux: "Ctrl+→" },
        ],
      },
    ],
  },
  copilot: {
    label: "GitHub Copilot",
    sourceUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    sourceLabel: "GitHub Docs — Copilot in the IDE",
    sections: [
      {
        title: "Inline suggestions (VS Code)",
        shortcuts: [
          { action: "Accept an inline suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "Dismiss an inline suggestion", mac: "Esc", winLinux: "Esc" },
          { action: "Show next inline suggestion", mac: "Option+]", winLinux: "Alt+]" },
          { action: "Show previous inline suggestion", mac: "Option+[", winLinux: "Alt+[" },
          { action: "Trigger inline suggestion", mac: "Option+\\", winLinux: "Alt+\\" },
          {
            action: "Open Copilot (additional suggestions in separate pane)",
            mac: "Ctrl+Return",
            winLinux: "Ctrl+Enter",
          },
        ],
      },
      {
        title: "Inline suggestions (JetBrains IDEs)",
        shortcuts: [
          { action: "Accept an inline suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "Dismiss an inline suggestion", mac: "Esc", winLinux: "Esc" },
          { action: "Show next inline suggestion", mac: "Option+]", winLinux: "Alt+]" },
          { action: "Show previous inline suggestion", mac: "Option+[", winLinux: "Alt+[" },
          { action: "Trigger inline suggestion", mac: "Option+|", winLinux: "Alt+|" },
          {
            action: "Open Copilot (additional suggestions in separate pane)",
            mac: "Option+Return",
            winLinux: "Alt+Enter",
          },
        ],
      },
    ],
  },
};

export const SHORTCUT_TOOL_ORDER: ShortcutTool[] = ["claude", "cursor", "copilot"];

export function shortcutTextForTool(tool: ShortcutTool): string {
  const data = KEYBOARD_SHORTCUTS[tool];
  const lines = [`Keyboard shortcuts — ${data.label}`, `Source: ${data.sourceUrl}`, ""];

  for (const section of data.sections) {
    lines.push(section.title);
    for (const row of section.shortcuts) {
      lines.push(`${row.action}\tMac: ${row.mac}\tWin/Linux: ${row.winLinux}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
