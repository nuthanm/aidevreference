import type { CatalogTool } from "@/lib/catalog-surfaces";

type FaqItem = { q: string; a: string };

type ToolIntroContent = {
  heading: string;
  lead: string;
  body: string[];
  bullets: { label: string; text: string }[];
  faq: FaqItem[];
};

const TOOL_INTRO: Record<CatalogTool, ToolIntroContent> = {
  claude: {
    heading: "About Claude Code commands, skills, agents, and hooks",
    lead: "Claude Code is Anthropic's terminal-native coding agent. Instead of copying answers out of a chat window, you run it inside your project and drive it with slash commands, reusable skills, subagents, and lifecycle hooks.",
    body: [
      "This page collects the slash commands and extension points that most Claude Code users reach for day to day, each with a short description of what it does and a copy-paste example. The goal is to save you from digging through release notes and scattered docs when you just need to remember how a command is invoked or what it expects.",
      "Slash commands cover the interactive basics — starting and clearing context, reviewing changes, and running focused edits. Skills package repeatable instructions that Claude can discover and apply automatically. Subagents let you hand a scoped task to a separate context so your main session stays clean, and hooks fire on events such as a permission prompt or an idle teammate so you can automate guardrails.",
    ],
    bullets: [
      { label: "Slash commands", text: "Interactive terminal commands for context, review, and edits." },
      { label: "Skills", text: "Reusable instruction packages Claude can auto-invoke by trigger." },
      { label: "Subagents", text: "Scoped helpers that run in a separate context for deep work." },
      { label: "Hooks", text: "Event-driven automation for permissions, lifecycle, and safety." },
    ],
    faq: [
      {
        q: "Where do Claude Code commands run?",
        a: "Most entries run in the Claude Code terminal. Some also work in the Desktop app, IDE extension, or Chrome extension — the surface tags on each card show where a command is available.",
      },
      {
        q: "Are these official Anthropic commands?",
        a: "Command names come from official Claude documentation and community usage, but this is an independent, community-maintained reference. Always confirm against Anthropic's docs before relying on a command in production.",
      },
      {
        q: "How often is the Claude catalog updated?",
        a: "Entries are refreshed as Anthropic ships changes. Check the What's new page for recently added commands, or subscribe on the feedback page to get an email when the catalog grows.",
      },
    ],
  },
  cursor: {
    heading: "About Cursor commands, automation, and hooks",
    lead: "Cursor is an AI-first code editor built on VS Code by Anysphere. Its commands, skills, agents, and hooks run inside the IDE — across Agent chat, Composer, and inline edit — so AI assistance stays next to the code you are editing.",
    body: [
      "This page catalogs the Cursor commands and workflows that speed up everyday editing: navigating a codebase, generating and refactoring code, running multi-file changes with Composer, and letting the Agent take autonomous passes. Each entry includes a plain-language description and an example so you can see exactly how it is used.",
      "Because Cursor is IDE-native, many of its most useful features are keyboard-driven or triggered from chat rather than typed as terminal commands. The reference groups these by purpose — editing, navigation, automation, and hooks — so you can scan to the task you have in mind instead of memorizing every shortcut.",
    ],
    bullets: [
      { label: "Composer", text: "Multi-file edits and generation from a single instruction." },
      { label: "Agent", text: "Autonomous coding passes that plan, edit, and verify." },
      { label: "IDE actions", text: "Inline edit, navigation, and context commands inside Cursor." },
      { label: "Hooks", text: "Automation that reacts to editor and agent events." },
    ],
    faq: [
      {
        q: "Do Cursor commands work outside the IDE?",
        a: "No — commands, skills, agents, and hooks run inside the Cursor IDE (Agent chat, Composer, and inline edit). They are not terminal commands.",
      },
      {
        q: "Is this reference affiliated with Cursor or Anysphere?",
        a: "No. This is an independent, community-maintained guide. Names and behavior are drawn from Cursor's documentation and may change when the editor updates.",
      },
      {
        q: "How do I find a specific Cursor command?",
        a: "Use the search box at the top, or filter by group. New additions appear on the What's new page as the catalog is updated.",
      },
    ],
  },
  copilot: {
    heading: "About GitHub Copilot chat commands and workflows",
    lead: "GitHub Copilot, from Microsoft and GitHub, brings workspace-aware chat and slash commands to your editor. It works across VS Code, Visual Studio, JetBrains, and more, helping with review, edits, tests, and documentation without leaving the IDE.",
    body: [
      "This page lists the Copilot chat slash commands and quality workflows that developers use most, each tagged with the IDEs that support it. VS Code has the fullest feature set, while JetBrains and Visual Studio share the core chat slash commands, so the reference notes availability on every card.",
      "Copilot is at its best on focused, workspace-aware tasks: explaining a selection, generating tests, proposing fixes, and drafting documentation. The entries here describe what each command does and show an example, so you can pick the right one for reviews, refactors, or writing tests instead of guessing at syntax.",
    ],
    bullets: [
      { label: "Chat commands", text: "Slash commands for explain, fix, tests, and docs." },
      { label: "Workspace-aware", text: "Context pulled from your open project and files." },
      { label: "Quality workflows", text: "Review, refactor, and test-generation helpers." },
      { label: "Hooks", text: "Automation around Copilot and editor events." },
    ],
    faq: [
      {
        q: "Which IDEs support these Copilot commands?",
        a: "Each entry is tagged with supported IDEs. VS Code has the most complete set; JetBrains and Visual Studio share the core chat slash commands. Availability is shown on every card.",
      },
      {
        q: "Is this an official GitHub Copilot resource?",
        a: "No. It is an independent, community-maintained reference. Command names follow GitHub Copilot documentation and can change as the product evolves.",
      },
      {
        q: "How do I keep up with new Copilot commands?",
        a: "Recently added entries appear on the What's new page, and you can subscribe on the feedback page for email updates.",
      },
    ],
  },
};

export function ToolIntro({ tool }: { tool: CatalogTool }) {
  const content = TOOL_INTRO[tool];

  return (
    <section className={`tool-intro tool-intro-${tool}`} aria-label={content.heading}>
      <h2>{content.heading}</h2>
      <p className="tool-intro-lead">{content.lead}</p>
      {content.body.map((paragraph) => (
        <p key={paragraph.slice(0, 32)}>{paragraph}</p>
      ))}

      <h3>What you&apos;ll find on this page</h3>
      <ul className="tool-intro-list">
        {content.bullets.map((item) => (
          <li key={item.label}>
            <strong>{item.label}:</strong> {item.text}
          </li>
        ))}
      </ul>

      <h3>Frequently asked questions</h3>
      <div className="tool-intro-faq">
        {content.faq.map((item) => (
          <div className="tool-intro-faq-item" key={item.q}>
            <h4>{item.q}</h4>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
