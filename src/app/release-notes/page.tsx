import type { Metadata } from "next";
import { ReleaseNotesTable } from "./release-notes-table";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Release Notes",
  "Latest updates for AI Developer Tools Reference.",
  "/release-notes",
);

export default function ReleaseNotesPage() {
  return <ReleaseNotesTable />;
}
