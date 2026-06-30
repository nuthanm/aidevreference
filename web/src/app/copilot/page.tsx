import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Copilot Commands",
  "GitHub Copilot chat commands, quality workflows, and hooks reference.",
  "/copilot",
);

export default function CopilotPage() {
  return <ReferenceShell />;
}
