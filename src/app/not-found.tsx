import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested could not be found on AI Dev Reference.",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="not-found-eyebrow">404</p>
      <h1>Page not found</h1>
      <p>
        That URL does not match any page on AI Dev Reference. The catalog may have moved, or the
        link may be outdated.
      </p>
      <div className="not-found-actions">
        <Link className="not-found-btn primary" href="/">
          Back to home
        </Link>
        <Link className="not-found-btn secondary" href="/feedback">
          Contact us
        </Link>
      </div>
      <p className="not-found-links">
        <Link href="/about">About</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/terms-and-conditions">Terms</Link>
      </p>
    </main>
  );
}
