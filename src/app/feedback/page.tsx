import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Feedback",
  "Submit support requests, report missing commands, or sign up for release notifications.",
  "/feedback",
);

export default function FeedbackPage() {
  return <ReferenceShell />;
}
