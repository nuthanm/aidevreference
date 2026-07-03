import Link from "next/link";

export function AboutContent() {
  return (
    <section className="policy-page">
      <h1>About AI Dev Reference</h1>
      <p>
        AI Dev Reference is a free, searchable guide to commands, skills, agents, and hooks for{" "}
        <strong>Claude</strong>, <strong>Cursor</strong>, and <strong>GitHub Copilot</strong>. Every
        entry includes a short description and a copy-paste example so you can use it without digging
        through scattered docs.
      </p>
      <h2>Why this site exists</h2>
      <p>
        AI coding tools ship new slash commands, skills, and workflows often. Official documentation
        is spread across vendor sites and changes frequently. This reference brings the essentials
        into one place — with search, side-by-side comparison, and update notifications when the
        catalog grows.
      </p>
      <h2>Who maintains it</h2>
      <p>
        The site is built and maintained by{" "}
        <Link href="https://www.linkedin.com/in/nuthanm/?skipRedirect=true" target="_blank" rel="noreferrer">
          Nuthan Murarysetty
        </Link>
        . It is a community project, not official product documentation. Suggestions and corrections
        from readers help keep entries accurate and up to date.
      </p>
      <h2>Not affiliated with vendors</h2>
      <p>
        AI Dev Reference is independent. It is not affiliated with, endorsed by, or operated by
        Anthropic, Anysphere (Cursor), Microsoft, or GitHub. Product names and trademarks belong to
        their respective owners and are used here for identification and educational purposes only.
      </p>
      <h2>How the catalog stays current</h2>
      <p>
        Entries are curated from official vendor documentation and community feedback. When commands
        change upstream, the catalog is updated and subscribers can be notified via email. See{" "}
        <Link href="/whats-new">What&apos;s new</Link> for recently added entries.
      </p>
      <h2>Contact</h2>
      <p>
        The best way to reach us is the{" "}
        <Link href="/feedback">feedback form</Link>. Select <strong>General</strong> as the tool and{" "}
        <strong>I want to contact</strong> as the type, then include your name, email, and message.
        Use the same form for privacy requests, catalog corrections, or general questions.
      </p>
      <p>
        You can also find the maintainer on{" "}
        <Link href="https://github.com/nuthanm" target="_blank" rel="noreferrer">
          GitHub
        </Link>
        ,{" "}
        <Link href="https://www.linkedin.com/in/nuthanm/?skipRedirect=true" target="_blank" rel="noreferrer">
          LinkedIn
        </Link>
        , or{" "}
        <Link href="https://x.com/nuthanmurari" target="_blank" rel="noreferrer">
          X
        </Link>
        .
      </p>
      <p>
        To report a security vulnerability, see our{" "}
        <Link href="https://github.com/nuthanm/aidevreference/blob/main/SECURITY.md" target="_blank" rel="noreferrer">
          security policy
        </Link>
        . Do not use the public feedback form for sensitive exploit details unless private advisory access is unavailable.
      </p>
      <p className="policy-nav-links">
        <Link href="/">Back to home</Link> · <Link href="/privacy-policy">Privacy Policy</Link> ·{" "}
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
      </p>
    </section>
  );
}

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
        and <strong>I want to contact</strong> as the type. You can also visit the{" "}
        <Link href="/about">About</Link> page for maintainer links.
      </p>
      <p className="policy-nav-links">
        <Link href="/">Back to home</Link> · <Link href="/about">About</Link> ·{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>
      </p>
    </section>
  );
}

export function PrivacyContent() {
  return (
    <section className="policy-page">
      <h1>Privacy Policy</h1>
      <p>
        This policy explains what information AI Dev Reference collects, how it is used, and the
        choices you have. By using the site, you agree to this policy.
      </p>
      <h2>Data We Collect</h2>
      <p>
        When you use forms on this site, we may collect your name, email address, request metadata,
        and message content. If you subscribe to updates, we store your email for delivery and
        confirmation.
      </p>
      <h2>How We Use Data</h2>
      <p>
        Submitted data is used to respond to requests, improve the reference catalog, prevent abuse,
        and send update notifications to opted-in subscribers.
      </p>
      <h2>Cookies and Similar Technologies</h2>
      <p>
        We use cookies and local storage for essential site features (for example, remembering cookie
        preferences and catalog review state) and for abuse prevention (such as CAPTCHA). When
        advertising is enabled, third-party cookies and similar technologies may also be used for
        ads and measurement.
      </p>
      <h2>Advertising (Google AdSense)</h2>
      <p>
        This site may display ads served by Google AdSense or related Google advertising services.
        Google and its partners may use cookies and device identifiers to show personalized or
        non-personalized ads based on your visits to this and other sites. You can learn more and
        manage ad settings at{" "}
        <Link href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
          Google&apos;s Advertising policies
        </Link>{" "}
        and{" "}
        <Link href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
          Google Ad Settings
        </Link>
        .
      </p>
      <p>
        If you choose <strong>Essential only</strong> in our cookie banner, we will not treat that
        as consent for non-essential advertising cookies. Essential site features and security
        checks may still run.
      </p>
      <h2>Data Retention</h2>
      <p>
        Subscriber emails are stored in server data storage for update delivery. Request records may
        be retained for product support and abuse prevention. Cookie preferences are stored in your
        browser until you clear site data.
      </p>
      <h2>Third Parties</h2>
      <p>
        We use third-party providers only as needed to operate the service, including SMTP providers
        for email delivery, CAPTCHA providers for abuse prevention, hosting and infrastructure
        providers, and — when ads are enabled — Google advertising services. Those providers process
        data under their own policies.
      </p>
      <h2>Your Rights</h2>
      <p>
        For anything related to your data — including access or deletion requests — submit a{" "}
        <Link href="/feedback">support request</Link>. Select <strong>General</strong> as the tool
        and <strong>I want to contact</strong> as the type, then include your name, email, and
        details in the message. More contact options are listed on the{" "}
        <Link href="/about">About</Link> page.
      </p>
      <p className="policy-nav-links">
        <Link href="/">Back to home</Link> · <Link href="/about">About</Link> ·{" "}
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
      </p>
    </section>
  );
}
