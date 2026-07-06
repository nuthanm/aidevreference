import { releaseBroadcastTemplate } from "@/lib/email-templates";

const PREVIEW_NOTES = [
  "Site: Keyboard Shortcuts — press ? or use the Shortcuts button in the top bar",
  "Site: Browse Claude, Cursor, and Copilot shortcuts in one modal",
  "Site: Print-friendly shortcut sheet included",
  "Added /trace command to Claude Code",
  "Commit abc1234 — fix catalog sync edge case",
];

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <main style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
        <h1>Not available</h1>
        <p>Email preview is only available in development.</p>
      </main>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const template = releaseBroadcastTemplate(
    "2026.07.06",
    PREVIEW_NOTES,
    `${siteUrl}/api/notify/unsubscribe?token=preview-token`,
    siteUrl,
  );

  return (
    <main style={{ minHeight: "100vh", background: "#eceaf8", padding: "24px 12px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto 16px", fontFamily: "Inter, sans-serif" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 20 }}>Broadcast email preview</h1>
        <p style={{ margin: 0, color: "#5a5a7a", fontSize: 14 }}>
          Subject: <strong>{template.subject}</strong>
        </p>
      </div>
      <div
        style={{ maxWidth: 720, margin: "0 auto" }}
        dangerouslySetInnerHTML={{ __html: template.html }}
      />
    </main>
  );
}
