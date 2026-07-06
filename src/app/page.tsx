import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Commands for Claude, Cursor & Copilot",
  "Searchable commands, skills, agents, and hooks for Claude, Cursor, and GitHub Copilot.",
  "/",
);

export default function HomePage() {
  return <ReferenceShell />;
}
