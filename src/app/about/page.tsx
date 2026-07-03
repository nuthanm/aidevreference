import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "About",
  "About AI Dev Reference — a community-maintained command reference for Claude, Cursor, and GitHub Copilot.",
  "/about",
);

export default function AboutPage() {
  return <ReferenceShell />;
}
