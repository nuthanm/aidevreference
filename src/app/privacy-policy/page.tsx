import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Privacy Policy",
  "Privacy policy for AI Dev Reference.",
  "/privacy-policy",
);

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      <h1>Privacy Policy</h1>
      <p>
        This application collects only the information required to process feature requests and
        notification subscriptions.
      </p>
      <h2>Data We Collect</h2>
      <p>Name, email, request metadata, and message content submitted through forms.</p>
      <h2>How We Use Data</h2>
      <p>
        Submitted data is used to respond to requests, improve the reference catalog, and send
        update notifications to opted-in subscribers.
      </p>
      <h2>Data Retention</h2>
      <p>
        Subscriber emails are stored in server data storage for update delivery. Request records
        may be retained for product support and abuse prevention.
      </p>
      <h2>Third Parties</h2>
      <p>
        SMTP providers and CAPTCHA verification providers are used only for delivery and abuse
        prevention.
      </p>
      <h2>Your Rights</h2>
      <p>
        For anything related to your data — including deletion requests — submit a{" "}
        <Link href="/feedback">support request</Link>. Select <strong>General</strong> as the tool
        and <strong>I want to contact</strong> as the type, then include your name, email, and
        details in the message.
      </p>
      <p>
        <Link href="/">Back to home</Link> · <Link href="/terms-and-conditions">Terms and Conditions</Link>
      </p>
    </main>
  );
}
