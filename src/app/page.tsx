import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Home",
  "Searchable commands, skills, agents, and hooks for Claude, Cursor, and GitHub Copilot.",
  "/",
);

export default function HomePage() {
  return <ReferenceShell />;
}
