import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Feedback",
  "Send feature requests and notification signup requests.",
  "/feedback",
);

export default function FeedbackPage() {
  return <ReferenceShell />;
}
