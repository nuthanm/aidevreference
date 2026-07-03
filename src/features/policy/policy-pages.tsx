import Link from "next/link";

export function TermsContent() {
  return (
    <section className="policy-page">
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
      <p className="policy-nav-links">
        <Link href="/">Back to home</Link> · <Link href="/privacy-policy">Privacy Policy</Link>
      </p>
    </section>
  );
}

export function PrivacyContent() {
  return (
    <section className="policy-page">
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
      <p className="policy-nav-links">
        <Link href="/">Back to home</Link> · <Link href="/terms-and-conditions">Terms and Conditions</Link>
      </p>
    </section>
  );
}
