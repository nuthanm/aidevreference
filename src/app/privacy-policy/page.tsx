import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Privacy Policy",
  "Privacy policy for AI Dev Reference.",
  "/privacy-policy",
);

export default function PrivacyPolicyPage() {
  return <ReferenceShell />;
}
