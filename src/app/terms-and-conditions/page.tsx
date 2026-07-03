import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Terms and Conditions",
  "Terms and conditions for AI Dev Reference.",
  "/terms-and-conditions",
);

export default function TermsAndConditionsPage() {
  return (
    <main className="policy-page">
      <h1>Terms and Conditions</h1>
      <p>
        This service is an educational reference and does not represent official product
        documentation from Anthropic, Anysphere, Microsoft, or GitHub.
      </p>
      <h2>Acceptable Use</h2>
      <p>
        You agree not to abuse submission forms, attempt unauthorized access, or use this service
        for harmful activity.
      </p>
      <h2>Accuracy</h2>
      <p>
        Command data is synchronized from configured feeds and official links but may lag upstream
        documentation. Verify critical details with official docs.
      </p>
      <h2>Intellectual Property</h2>
      <p>
        Trademarks and product names belong to their respective owners. This application references
        them for educational interoperability.
      </p>
      <h2>Liability</h2>
      <p>
        The service is provided as-is without warranties. Operators are not liable for losses
        resulting from command misuse or stale references.
      </p>
      <h2>Contact</h2>
      <p>
        For questions, privacy requests, or anything else, submit a{" "}
        <Link href="/feedback">support request</Link>. Select <strong>General</strong> as the tool
        and <strong>I want to contact</strong> as the type.
      </p>
      <p>
        <Link href="/">Back to home</Link> · <Link href="/privacy-policy">Privacy Policy</Link>
      </p>
    </main>
  );
}
