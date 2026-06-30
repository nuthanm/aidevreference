import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Release Notes",
  "Latest updates for AI Developer Tools Reference.",
  "/release-notes",
);

export default function ReleaseNotesPage() {
  return <ReferenceShell />;
}
