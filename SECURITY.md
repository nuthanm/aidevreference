# Security Policy

AI Dev Reference takes security reports seriously. If you believe you have found a vulnerability, please follow this policy so we can investigate and respond quickly.

## How to report

**Preferred:** Open a [GitHub Security Advisory](https://github.com/nuthan-murarysetty/ai-dev-ref/security/advisories/new) (private disclosure).

**Alternative:** Use the [feedback form](https://aidevreference.vercel.app/feedback) on the live site. Select **General** as the tool and **I want to contact** as the type. Include **Security report** in the subject or message so it is routed correctly.

Please do **not** open a public GitHub issue for security vulnerabilities.

## What to include

Reports that are easiest to act on include:

1. **Clear reproduction steps** — step-by-step instructions to trigger the issue.
2. **Proof of concept** — code, HTTP requests, screenshots, or a short video showing the behavior.
3. **Realistic attack scenario and impact** — who could exploit it, what data or systems are affected, and what an attacker could achieve in practice.

Reports without enough detail to reproduce the issue may be closed as invalid.

## In scope

The following areas are in scope when they demonstrate a real security or privacy risk:

### Authentication and authorization

- Bypassing or guessing `x-admin-key` or `x-cron-key` protection on admin or cron endpoints, including:
  - `POST /api/catalog/sync`
  - `POST /api/notify/broadcast`
  - `POST /api/notify/auto-broadcast`
  - `POST /api/feedback/resolve` (admin JSON API)
  - `POST /api/notify/resend-confirm`
- Unauthorized catalog updates, release broadcasts, or feedback resolution

### Token and link security

- Abuse of confirmation, unsubscribe, or feedback resolve tokens to affect another person’s subscription or request
- Predictable, enumerable, or reusable magic-link tokens
- IDOR-style access to subscriber or feedback records via tokens or identifiers

### Data exposure

- Unauthorized access to subscriber email addresses or feedback content stored in PostgreSQL
- Leakage of environment secrets, API keys, SMTP credentials, or database connection strings through the application or its responses
- Exposure of private operational data that is not intended to be public (for example, pending catalog drafts served to visitors)

### Input handling and injection

- SQL injection or unsafe query construction against PostgreSQL tables (`subscribers`, `feedback_requests`, `catalog_snapshots`, and related tables)
- Stored or reflected cross-site scripting (XSS) with a realistic exploit path
- HTML or email injection that leads to phishing or script execution in a user’s browser or mail client

### Abuse prevention bypass

- Bypassing Cloudflare Turnstile, rate limits, honeypot checks, or other anti-abuse controls on public forms (`POST /api/feedback`, `POST /api/notify`) to send spam or flood the service at scale
- Triggering unauthorized or excessive outbound email (confirmation floods, broadcast abuse)

### Server-side request and execution risks

- Server-side request forgery (SSRF) through application-controlled URL fetching
- Remote code execution on application infrastructure
- Unsafe deserialization or template injection with demonstrable impact

### Infrastructure and deployment (application layer)

- Misconfigurations in this repository’s application code or documented deployment that directly expose production data or admin capabilities
- Broken access control on API routes that should require authentication

## Out of scope

The following are generally **not** accepted unless you can show a concrete exploit with user impact:

- Findings that apply only to third-party vendors (hosting, DNS, SMTP provider, CAPTCHA provider) without a flaw in this application
- Missing security headers, cookie flags, or TLS settings with no demonstrated exploit
- Theoretical vulnerabilities without a working proof of concept
- Social engineering, phishing, or physical access attacks
- Denial-of-service or resource exhaustion at infrastructure scale
- Issues in upstream AI tool documentation referenced by the catalog (Anthropic, Cursor, GitHub Copilot, and similar)
- Vulnerabilities in dependencies with no exploitable path in this application
- Automated scanner output without manual validation and impact analysis
- Typos, cosmetic UI bugs, or stale catalog content that does not create a security risk

## Safe harbor

We support good-faith security research on in-scope systems. When you follow this policy — including avoiding privacy violations, data destruction, and service disruption beyond what is needed to demonstrate the issue — we will not pursue legal action against you for your research.

Do not:

- Access, modify, or delete data belonging to other users beyond what is necessary to demonstrate the issue
- Perform testing that degrades service availability for other visitors
- Publicly disclose the issue before we have had a reasonable time to fix it

## Response expectations

We aim to acknowledge reports within **5 business days**. Resolution time depends on severity and complexity. We may ask for clarification or additional steps to reproduce the issue.

We do not operate a paid bug bounty program at this time. We appreciate responsible disclosure and will credit reporters by name in release notes or advisories when they request it and the report leads to a fix.

## Supported versions

Security fixes are applied to the latest version on the default branch and deployed to production. Older deployments are not supported.

## Related documentation

- [Environment variables and keys](docs/flows/10-environment-and-keys.md)
- [Operations handbook](docs/OPERATIONS.md)
- [Terms and Conditions](https://aidevreference.vercel.app/terms-and-conditions)
