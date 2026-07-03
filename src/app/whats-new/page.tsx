import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "What's New",
  "See the latest commands, skills, agents, and hooks added to AI Dev Reference.",
  "/whats-new",
);

export default function WhatsNewPage() {
  return <ReferenceShell />;
}
