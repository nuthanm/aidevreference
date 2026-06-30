import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Cursor Commands",
  "Cursor command, automation, and hooks reference.",
  "/cursor",
);

export default function CursorPage() {
  return <ReferenceShell />;
}
