import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "AI Developer Tools Reference",
  "Searchable command, skills, subagent, and hooks reference for Claude, Cursor, and Copilot.",
  "/",
);

export default function HomePage() {
  return <ReferenceShell />;
}
