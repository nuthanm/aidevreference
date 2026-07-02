import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Release Notes",
  "Latest catalog updates for AI Dev Reference.",
  "/release-notes",
);

export default function ReleaseNotesPage() {
  return <ReferenceShell />;
}
