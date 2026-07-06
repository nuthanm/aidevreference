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

const JETBRAINS_MAC: KeyboardShortcutRow[] = [
  { action: "Accept an inline suggestion", shortcut: "Tab" },
  { action: "Dismiss an inline suggestion", shortcut: "Esc" },
  { action: "Show next inline suggestion", shortcut: "Option (⌥) or Alt + ]" },
  { action: "Show previous inline suggestion", shortcut: "Option (⌥) or Alt + [" },
  { action: "Trigger inline suggestion", shortcut: "Option (⌥) + \\" },
  { action: "Open GitHub Copilot (additional suggestions in separate pane)", shortcut: "Option (⌥) or Alt + Return" },
];

const JETBRAINS_WIN_LINUX: KeyboardShortcutRow[] = [
  { action: "Accept an inline suggestion", shortcut: "Tab" },
  { action: "Dismiss an inline suggestion", shortcut: "Esc" },
  { action: "Show next inline suggestion", shortcut: "Alt + ]" },
  { action: "Show previous inline suggestion", shortcut: "Alt + [" },
  { action: "Trigger inline suggestion", shortcut: "Alt + \\" },
  { action: "Open GitHub Copilot (additional suggestions in separate pane)", shortcut: "Alt + Enter" },
];

const VSCODE_MAC: KeyboardShortcutRow[] = [
  { action: "Accept an inline suggestion", shortcut: "Tab", commandName: "editor.action.inlineSuggest.commit" },
  { action: "Dismiss an inline suggestion", shortcut: "Esc", commandName: "editor.action.inlineSuggest.hide" },
  { action: "Show next inline suggestion", shortcut: "Option (⌥) + ]", commandName: "editor.action.inlineSuggest.showNext" },
  { action: "Show previous inline suggestion", shortcut: "Option (⌥) + [", commandName: "editor.action.inlineSuggest.showPrevious" },
  { action: "Trigger inline suggestion", shortcut: "Option (⌥) + \\", commandName: "editor.action.inlineSuggest.trigger" },
  { action: "Open GitHub Copilot (additional suggestions in separate pane)", shortcut: "Ctrl + Return", commandName: "github.copilot.generate" },
  { action: "Toggle GitHub Copilot on/off", shortcut: "No default shortcut", commandName: "github.copilot.toggleCopilot" },
];

const VSCODE_WIN_LINUX: KeyboardShortcutRow[] = [
  { action: "Accept an inline suggestion", shortcut: "Tab", commandName: "editor.action.inlineSuggest.commit" },
  { action: "Dismiss an inline suggestion", shortcut: "Esc", commandName: "editor.action.inlineSuggest.hide" },
  { action: "Show next inline suggestion", shortcut: "Alt + ]", commandName: "editor.action.inlineSuggest.showNext" },
  { action: "Show previous inline suggestion", shortcut: "Alt + [", commandName: "editor.action.inlineSuggest.showPrevious" },
  { action: "Trigger inline suggestion", shortcut: "Alt + \\", commandName: "editor.action.inlineSuggest.trigger" },
  { action: "Open GitHub Copilot (additional suggestions in separate pane)", shortcut: "Ctrl + Enter", commandName: "github.copilot.generate" },
  { action: "Toggle GitHub Copilot on/off", shortcut: "No default shortcut", commandName: "github.copilot.toggleCopilot" },
];

export const copilotKeyboardShortcuts: KeyboardShortcutIde[] = [
  {
    id: "jetbrains",
    label: "JetBrains IDE",
    note: "Default keyboard shortcuts for inline suggestions in JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.).",
    officialUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    platforms: [
      { id: "macos", label: "macOS", shortcuts: JETBRAINS_MAC },
      { id: "windows", label: "Windows", shortcuts: JETBRAINS_WIN_LINUX },
      { id: "linux", label: "Linux", shortcuts: JETBRAINS_WIN_LINUX },
    ],
  },
  {
    id: "visualstudio",
    label: "Visual Studio",
    note: "Search each shortcut by command name in the Keyboard Shortcuts editor.",
    officialUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    shortcuts: [
      { action: "Show next inline suggestion", shortcut: "Alt + .", commandName: "Edit.NextSuggestion" },
      { action: "Show previous inline suggestion", shortcut: "Alt + ,", commandName: "Edit.PreviousSuggestion" },
    ],
  },
  {
    id: "vscode",
    label: "Visual Studio Code",
    note: "Search keyboard shortcuts by command name in the Keyboard Shortcuts editor.",
    officialUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    platforms: [
      { id: "macos", label: "macOS", shortcuts: VSCODE_MAC },
      { id: "windows", label: "Windows", shortcuts: VSCODE_WIN_LINUX },
      { id: "linux", label: "Linux", shortcuts: VSCODE_WIN_LINUX },
    ],
  },
  {
    id: "xcode",
    label: "Xcode",
    note: "You can rebind these shortcuts to your preferred keybindings for each command.",
    officialUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    shortcuts: [
      { action: "Accept the first line of a suggestion", shortcut: "Tab" },
      { action: "View full suggestion", shortcut: "Hold Option" },
      { action: "Accept full suggestion", shortcut: "Option + Tab" },
    ],
  },
  {
    id: "eclipse",
    label: "Eclipse",
    note: "Default keyboard shortcuts for inline suggestions in Eclipse.",
    officialUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts",
    shortcuts: [
      { action: "Accept an inline suggestion", shortcut: "Tab" },
      { action: "Accept next word of an inline suggestion", shortcut: "Command + → (Mac) or Ctrl + → (Windows)" },
      { action: "Dismiss an inline suggestion", shortcut: "Esc" },
      { action: "Trigger inline suggestion", shortcut: "Option (⌥) + Command + / (Mac) or Alt + Ctrl + / (Windows)" },
    ],
  },
  {
    id: "vim",
    label: "Vim / Neovim",
    note: "Keyboard shortcuts can be rebound to your preferred mappings for each command. See the Neovim :map documentation for details.",
    officialUrl: "https://neovim.io/doc/user/map.html",
  },
];
