import type { Metadata } from "next";
import { ReferenceShell } from "@/features/reference/reference-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Terms and Conditions",
  "Terms and conditions for AI Dev Reference.",
  "/terms-and-conditions",
);

export default function TermsAndConditionsPage() {
  return <ReferenceShell />;
}
