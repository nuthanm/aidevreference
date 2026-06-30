import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Claude Commands",
  "Claude slash commands, skills, agents, and hooks reference.",
  "/claude",
);

export default function ClaudePage() {
  return <ReferenceShell />;
}
