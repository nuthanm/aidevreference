/**
 * Keyboard shortcuts sourced from official documentation only.
 * Last verified against vendor docs — see sourceUrl on each tool.
 */

import {
  COPILOT_KEYBOARD_SHORTCUTS_DOCS,
  copilotKeyboardShortcutsUrl,
} from "@/lib/copilot-keyboard-shortcuts";

export type ShortcutTool = "claude" | "cursor" | "copilot";

export type KeyboardShortcut = {
  action: string;
  mac: string;
  winLinux: string;
};

export type ShortcutSection = {
  title: string;
  sourceUrl?: string;
  sourceLabel?: string;
  shortcuts: KeyboardShortcut[];
};

export type ToolShortcuts = {
  label: string;
  sourceUrl: string;
  sourceLabel: string;
  surfaceNote: string;
  sections: ShortcutSection[];
};

export const KEYBOARD_SHORTCUTS: Record<ShortcutTool, ToolShortcuts> = {
  claude: {
    label: "Claude Code",
    sourceUrl: "https://code.claude.com/docs/en/interactive-mode",
    sourceLabel: "Claude Code — Interactive mode",
    surfaceNote:
      "These shortcuts apply to Claude Code interactive terminal sessions (CLI). They are not claude.ai web chat shortcuts.",
    sections: [
      {
        title: "General controls",
        shortcuts: [
          { action: "Interrupt, or clear input", mac: "Ctrl+C", winLinux: "Ctrl+C" },
          {
            action: "Stop all running background subagents (press twice within 3s)",
            mac: "Ctrl+X Ctrl+K",
            winLinux: "Ctrl+X Ctrl+K",
          },
          { action: "Exit Claude Code session", mac: "Ctrl+D", winLinux: "Ctrl+D" },
          {
            action: "Open in default text editor",
            mac: "Ctrl+G or Ctrl+X Ctrl+E",
            winLinux: "Ctrl+G or Ctrl+X Ctrl+E",
          },
          { action: "Redraw screen", mac: "Ctrl+L", winLinux: "Ctrl+L" },
          { action: "Toggle transcript viewer", mac: "Ctrl+O", winLinux: "Ctrl+O" },
          { action: "Reverse search command history", mac: "Ctrl+R", winLinux: "Ctrl+R" },
          {
            action: "Paste image from clipboard",
            mac: "Ctrl+V or Cmd+V (iTerm2)",
            winLinux: "Ctrl+V or Alt+V (WSL)",
          },
          { action: "Background running tasks", mac: "Ctrl+B", winLinux: "Ctrl+B" },
          { action: "Toggle Claude's task checklist", mac: "Ctrl+T", winLinux: "Ctrl+T" },
          { action: "Cycle dialog tabs", mac: "Left/Right arrows", winLinux: "Left/Right arrows" },
          {
            action: "Move cursor or navigate command history",
            mac: "Up/Down or Ctrl+P/Ctrl+N",
            winLinux: "Up/Down or Ctrl+P/Ctrl+N",
          },
          { action: "Interrupt Claude mid-turn", mac: "Esc", winLinux: "Esc" },
          { action: "Clear input draft, or rewind", mac: "Esc + Esc", winLinux: "Esc + Esc" },
          {
            action: "Cycle permission modes",
            mac: "Shift+Tab or Option+M",
            winLinux: "Shift+Tab or Alt+M",
          },
          { action: "Switch model", mac: "Option+P", winLinux: "Alt+P" },
          { action: "Toggle extended thinking", mac: "Option+T", winLinux: "Alt+T" },
          { action: "Toggle fast mode", mac: "Option+O", winLinux: "Alt+O" },
        ],
      },
      {
        title: "Text editing",
        shortcuts: [
          { action: "Move cursor to start of line", mac: "Ctrl+A", winLinux: "Ctrl+A" },
          { action: "Move cursor to end of line", mac: "Ctrl+E", winLinux: "Ctrl+E" },
          { action: "Delete to end of line", mac: "Ctrl+K", winLinux: "Ctrl+K" },
          { action: "Delete from cursor to line start", mac: "Ctrl+U", winLinux: "Ctrl+U" },
          {
            action: "Delete previous word",
            mac: "Ctrl+W",
            winLinux: "Ctrl+W or Ctrl+Backspace",
          },
          { action: "Paste deleted text", mac: "Ctrl+Y", winLinux: "Ctrl+Y" },
          { action: "Cycle paste history (after Ctrl+Y)", mac: "Alt+Y", winLinux: "Alt+Y" },
          { action: "Move cursor back one word", mac: "Alt+B", winLinux: "Alt+B" },
          { action: "Move cursor forward one word", mac: "Alt+F", winLinux: "Alt+F" },
        ],
      },
      {
        title: "Multiline input",
        shortcuts: [
          { action: "Quick escape (all terminals)", mac: "\\ + Enter", winLinux: "\\ + Enter" },
          { action: "New line (Option as Meta)", mac: "Option+Enter", winLinux: "—" },
          {
            action: "New line (native terminals)",
            mac: "Shift+Enter",
            winLinux: "Shift+Enter",
          },
          { action: "New line (any terminal)", mac: "Ctrl+J", winLinux: "Ctrl+J" },
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
      {
        title: "Reverse search (Ctrl+R)",
        shortcuts: [
          { action: "Start reverse history search", mac: "Ctrl+R", winLinux: "Ctrl+R" },
          { action: "Cycle older matches", mac: "Ctrl+R", winLinux: "Ctrl+R" },
          { action: "Cycle search scope", mac: "Ctrl+S", winLinux: "Ctrl+S" },
          { action: "Accept match and continue editing", mac: "Tab or Esc", winLinux: "Tab or Esc" },
          { action: "Accept match and run", mac: "Enter", winLinux: "Enter" },
          { action: "Cancel search", mac: "Ctrl+C or Backspace on empty", winLinux: "Ctrl+C or Backspace on empty" },
        ],
      },
      {
        title: "Transcript viewer (Ctrl+O)",
        shortcuts: [
          { action: "Toggle shortcut help panel", mac: "?", winLinux: "?" },
          { action: "Jump to previous/next user prompt", mac: "{ / }", winLinux: "{ / }" },
          { action: "Toggle show all content", mac: "Ctrl+E", winLinux: "Ctrl+E" },
          { action: "Write conversation to terminal scrollback", mac: "[", winLinux: "[" },
          { action: "Open conversation in $EDITOR", mac: "v", winLinux: "v" },
          { action: "Exit transcript view", mac: "q, Ctrl+C, or Esc", winLinux: "q, Ctrl+C, or Esc" },
        ],
      },
      {
        title: "/btw overlay",
        shortcuts: [
          { action: "Dismiss answer", mac: "Space, Enter, or Esc", winLinux: "Space, Enter, or Esc" },
          { action: "Scroll answer", mac: "Up / Down", winLinux: "Up / Down" },
          { action: "Step between prior /btw answers", mac: "Left / Right", winLinux: "Left / Right" },
          { action: "Copy answer as Markdown", mac: "c", winLinux: "c" },
          { action: "Fork into new session", mac: "f", winLinux: "f" },
          { action: "Clear earlier /btw list", mac: "x", winLinux: "x" },
        ],
      },
      {
        title: "Prompt suggestions",
        shortcuts: [
          { action: "Accept gray suggestion into input", mac: "Tab or Right arrow", winLinux: "Tab or Right arrow" },
        ],
      },
      {
        title: "Voice input",
        shortcuts: [
          {
            action: "Voice dictation (hold or tap-to-toggle)",
            mac: "Hold or tap Space",
            winLinux: "Hold or tap Space",
          },
        ],
      },
      {
        title: "Vim — mode switching",
        shortcuts: [
          { action: "Enter NORMAL mode", mac: "Esc", winLinux: "Esc" },
          { action: "Insert before cursor", mac: "i", winLinux: "i" },
          { action: "Insert at beginning of line", mac: "I", winLinux: "I" },
          { action: "Insert after cursor", mac: "a", winLinux: "a" },
          { action: "Insert at end of line", mac: "A", winLinux: "A" },
          { action: "Open line below", mac: "o", winLinux: "o" },
          { action: "Open line above", mac: "O", winLinux: "O" },
          { action: "Character-wise visual selection", mac: "v", winLinux: "v" },
          { action: "Line-wise visual selection", mac: "V", winLinux: "V" },
        ],
      },
      {
        title: "Vim — navigation (NORMAL)",
        shortcuts: [
          { action: "Move left/down/up/right", mac: "h / j / k / l", winLinux: "h / j / k / l" },
          { action: "Move right", mac: "Space", winLinux: "Space" },
          { action: "Next / end / previous word", mac: "w / e / b", winLinux: "w / e / b" },
          { action: "Beginning / end of line", mac: "0 / $", winLinux: "0 / $" },
          { action: "First non-blank / start / end of input", mac: "^ / gg / G", winLinux: "^ / gg / G" },
          { action: "Jump to character", mac: "f{char} / F{char} / t{char} / T{char}", winLinux: "f{char} / F{char} / t{char} / T{char}" },
          { action: "Repeat / reverse last motion", mac: "; / ,", winLinux: "; / ," },
          { action: "Reverse history search", mac: "/", winLinux: "/" },
        ],
      },
      {
        title: "Vim — editing (NORMAL)",
        shortcuts: [
          { action: "Delete character / line", mac: "x / dd", winLinux: "x / dd" },
          { action: "Delete to end of line", mac: "D", winLinux: "D" },
          { action: "Change line / to end / word", mac: "cc / C / cw,ce,cb", winLinux: "cc / C / cw,ce,cb" },
          { action: "Yank line / word", mac: "yy,Y / yw,ye,yb", winLinux: "yy,Y / yw,ye,yb" },
          { action: "Paste after / before cursor", mac: "p / P", winLinux: "p / P" },
          { action: "Indent / dedent line", mac: ">> / <<", winLinux: ">> / <<" },
          { action: "Join lines / undo / repeat", mac: "J / u / .", winLinux: "J / u / ." },
        ],
      },
    ],
  },
  cursor: {
    label: "Cursor",
    sourceUrl: "https://cursor.com/docs/reference/keyboard-shortcuts",
    sourceLabel: "Cursor — Keyboard Shortcuts reference",
    surfaceNote:
      "Cursor IDE shortcuts. macOS uses Cmd; Windows and Linux use Ctrl. All keybindings can be remapped in Keyboard Shortcuts settings.",
    sections: [
      {
        title: "General",
        shortcuts: [
          { action: "Toggle Sidepanel", mac: "Cmd+I or Cmd+L", winLinux: "Ctrl+I or Ctrl+L" },
          { action: "Toggle Agent layout", mac: "Cmd+E", winLinux: "Ctrl+E" },
          { action: "Mode Menu", mac: "Cmd+.", winLinux: "Ctrl+." },
          { action: "Loop between AI models", mac: "Cmd+/", winLinux: "Ctrl+/" },
          { action: "Toggle Voice Mode", mac: "Cmd+Shift+Space", winLinux: "Ctrl+Shift+Space" },
          { action: "Cursor settings", mac: "Cmd+Shift+J", winLinux: "Ctrl+Shift+J" },
          { action: "General settings", mac: "Cmd+,", winLinux: "Ctrl+," },
          { action: "Command palette", mac: "Cmd+Shift+P", winLinux: "Ctrl+Shift+P" },
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
          {
            action: "Add clipboard as context",
            mac: "Cmd+V (code or log in clipboard)",
            winLinux: "Ctrl+V (code or log in clipboard)",
          },
          {
            action: "Add clipboard to input box",
            mac: "Cmd+Shift+V",
            winLinux: "Ctrl+Shift+V",
          },
          { action: "Accept all suggested changes", mac: "Cmd+Return", winLinux: "Ctrl+Return" },
          { action: "Reject all suggested changes", mac: "Cmd+Backspace", winLinux: "Ctrl+Backspace" },
          { action: "Cycle to next message", mac: "Tab", winLinux: "Tab" },
          { action: "Rotate between Agent modes", mac: "Shift+Tab", winLinux: "Shift+Tab" },
          { action: "Model toggle", mac: "Cmd+Option+/", winLinux: "Ctrl+Alt+/" },
          { action: "New chat", mac: "Cmd+N or Cmd+R", winLinux: "Ctrl+N or Ctrl+R" },
          { action: "New chat tab", mac: "Cmd+T", winLinux: "Ctrl+T" },
          { action: "Previous chat", mac: "Cmd+[", winLinux: "Ctrl+[" },
          { action: "Next chat", mac: "Cmd+]", winLinux: "Ctrl+]" },
          { action: "Close chat", mac: "Cmd+W", winLinux: "Ctrl+W" },
          { action: "Unfocus field", mac: "Escape", winLinux: "Escape" },
        ],
      },
      {
        title: "Inline edit",
        shortcuts: [
          { action: "Open inline edit", mac: "Cmd+K", winLinux: "Ctrl+K" },
          { action: "Toggle input focus", mac: "Cmd+Shift+K", winLinux: "Ctrl+Shift+K" },
          { action: "Submit", mac: "Return", winLinux: "Return" },
          { action: "Cancel", mac: "Cmd+Shift+Backspace", winLinux: "Ctrl+Shift+Backspace" },
          { action: "Ask quick question", mac: "Option+Return", winLinux: "Alt+Return" },
        ],
      },
      {
        title: "Code selection & context",
        shortcuts: [
          { action: "@-mentions", mac: "@", winLinux: "@" },
          { action: "Shortcut commands", mac: "/", winLinux: "/" },
          { action: "Add selection to Chat", mac: "Cmd+Shift+L", winLinux: "Ctrl+Shift+L" },
          { action: "Add selection to Edit", mac: "Cmd+Shift+K", winLinux: "Ctrl+Shift+K" },
          { action: "Add selection to new chat", mac: "Cmd+L", winLinux: "Ctrl+L" },
          { action: "Toggle file reading strategies", mac: "Cmd+M", winLinux: "Ctrl+M" },
          { action: "Accept next word of suggestion", mac: "Cmd+→", winLinux: "Ctrl+→" },
          { action: "Search codebase in chat", mac: "Cmd+Return", winLinux: "Ctrl+Return" },
          {
            action: "Add copied reference code as context",
            mac: "Select code, Cmd+C, Cmd+V",
            winLinux: "Select code, Ctrl+C, Ctrl+V",
          },
          {
            action: "Add copied code as text context",
            mac: "Select code, Cmd+C, Cmd+Shift+V",
            winLinux: "Select code, Ctrl+C, Ctrl+Shift+V",
          },
        ],
      },
      {
        title: "Tab completion",
        shortcuts: [
          { action: "Accept suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "Accept next word", mac: "Cmd+→", winLinux: "Ctrl+→" },
        ],
      },
      {
        title: "Terminal",
        shortcuts: [
          { action: "Open terminal prompt bar", mac: "Cmd+K", winLinux: "Ctrl+K" },
          { action: "Run generated command", mac: "Cmd+Return", winLinux: "Ctrl+Return" },
          { action: "Accept command", mac: "Escape", winLinux: "Escape" },
        ],
      },
    ],
  },
  copilot: {
    label: "GitHub Copilot",
    sourceUrl: COPILOT_KEYBOARD_SHORTCUTS_DOCS,
    sourceLabel: "GitHub Docs — Copilot keyboard shortcuts",
    surfaceNote:
      "Inline-suggestion shortcuts vary by IDE. Chat slash commands in this catalog target VS Code unless noted otherwise.",
    sections: [
      {
        title: "Visual Studio Code",
        sourceUrl: copilotKeyboardShortcutsUrl("vscode"),
        sourceLabel: "GitHub Docs — VS Code",
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
          {
            action: "Toggle Copilot on/off",
            mac: "No default shortcut",
            winLinux: "No default shortcut",
          },
        ],
      },
      {
        title: "Visual Studio",
        sourceUrl: copilotKeyboardShortcutsUrl("visualstudio"),
        sourceLabel: "GitHub Docs — Visual Studio",
        shortcuts: [
          { action: "Show next inline suggestion", mac: "Alt+.", winLinux: "Alt+." },
          { action: "Show previous inline suggestion", mac: "Alt+,", winLinux: "Alt+," },
        ],
      },
      {
        title: "JetBrains IDEs (IntelliJ, PyCharm, WebStorm, …)",
        sourceUrl: copilotKeyboardShortcutsUrl("jetbrains"),
        sourceLabel: "GitHub Docs — JetBrains",
        shortcuts: [
          { action: "Accept an inline suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "Dismiss an inline suggestion", mac: "Esc", winLinux: "Esc" },
          { action: "Show next inline suggestion", mac: "Option+]", winLinux: "Alt+]" },
          { action: "Show previous inline suggestion", mac: "Option+[", winLinux: "Alt+[" },
          { action: "Trigger inline suggestion", mac: "Option+\\", winLinux: "Alt+\\" },
          {
            action: "Open Copilot (additional suggestions in separate pane)",
            mac: "Option+Return",
            winLinux: "Alt+Enter",
          },
        ],
      },
      {
        title: "Eclipse",
        sourceUrl: copilotKeyboardShortcutsUrl("eclipse"),
        sourceLabel: "GitHub Docs — Eclipse",
        shortcuts: [
          { action: "Accept an inline suggestion", mac: "Tab", winLinux: "Tab" },
          {
            action: "Accept next word of an inline suggestion",
            mac: "Command+→",
            winLinux: "Ctrl+→",
          },
          { action: "Dismiss an inline suggestion", mac: "Esc", winLinux: "Esc" },
          {
            action: "Trigger inline suggestion",
            mac: "Option+Command+/",
            winLinux: "Alt+Ctrl+/",
          },
        ],
      },
      {
        title: "Vim / Neovim",
        sourceUrl: copilotKeyboardShortcutsUrl("vimneovim"),
        sourceLabel: "GitHub Docs — Vim / Neovim",
        shortcuts: [
          {
            action: "Default keybindings",
            mac: "Rebind via :map — see Neovim docs",
            winLinux: "Rebind via :map — see Neovim docs",
          },
        ],
      },
      {
        title: "Xcode",
        sourceUrl: copilotKeyboardShortcutsUrl("xcode"),
        sourceLabel: "GitHub Docs — Xcode",
        shortcuts: [
          { action: "Accept the first line of a suggestion", mac: "Tab", winLinux: "Tab" },
          { action: "View full suggestion", mac: "Hold Option", winLinux: "Hold Option" },
          { action: "Accept full suggestion", mac: "Option+Tab", winLinux: "Option+Tab" },
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
