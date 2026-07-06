import fs from "node:fs";
import path from "node:path";
import { releaseBroadcastTemplate } from "../src/emails/templates";

const notes = [
  "Site: Keyboard Shortcuts — press ? or use the Shortcuts button in the top bar",
  "Site: Browse Claude, Cursor, and Copilot shortcuts in one modal",
  "Site: Print-friendly shortcut sheet included",
  "Added /trace command to Claude Code",
  "Commit abc1234 — fix catalog sync edge case",
];

const template = releaseBroadcastTemplate(
  "2026.07.06",
  notes,
  "https://example.com/api/notify/unsubscribe?token=preview-token",
  "https://aidevreference.com",
);

const outputDir = path.join(process.cwd(), "tmp");
fs.mkdirSync(outputDir, { recursive: true });
const htmlPath = path.join(outputDir, "broadcast-preview.html");
fs.writeFileSync(htmlPath, template.html, "utf8");

console.log(`Wrote ${htmlPath}`);
console.log(`Subject: ${template.subject}`);
