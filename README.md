# AI Developer Tools Reference (Next.js)

[![Build](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/auto-broadcast-feed-updates.yml?label=auto-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/auto-broadcast-feed-updates.yml)
[![Broadcast Workflow](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/broadcast-release.yml?label=manual-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/broadcast-release.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/nuthan-murarysetty/ai-dev-ref)](LICENSE)

Production-oriented Next.js migration of the AI command reference app.

## Highlights

- Server API forms (no Formspree dependency)
- Schema validation with zod + React Hook Form
- Cloudflare Turnstile support
- SMTP email templates for request, confirm, and broadcast flows
- Subscriber registry with double opt-in and unsubscribe links
- Catalog sync from configured feed URLs
- Combined release timeline: GitHub releases + feed updates
- Manual and auto broadcast workflows with delivery stats

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Copy environment file.

```bash
copy .env.example .env.local
```

3. Fill required values in .env.local.

4. Run development server.

```bash
cmd /c npm run dev
```

5. Open http://localhost:3000

## Environment Variables

See [.env.example](.env.example) for the complete template.

Core app and mail settings:

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- MAIL_FROM, MAIL_TO
- NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL
- DATABASE_URL
- CATALOG_FEEDS (optional comma-separated feed URLs)

Broadcast security settings:

- ADMIN_BROADCAST_KEY for POST /api/notify/broadcast
- CRON_BROADCAST_KEY for POST /api/notify/auto-broadcast

## How To Generate Keys

Use one secure random value per key. Minimum recommendation: 32 bytes.

PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

OpenSSL:

```bash
openssl rand -base64 48
```

Then set both app and GitHub secrets to the same exact values:

- ADMIN_BROADCAST_KEY
- CRON_BROADCAST_KEY

## Database Setup

Use PostgreSQL (Neon recommended).

1. Run [db/subscribers.sql](db/subscribers.sql) in your database.
2. Set DATABASE_URL in your environment.

## API Endpoints

- GET /api/catalog: merged base + feed catalog (with dev diagnostics)
- GET /api/releases: GitHub + feed update timeline and feed-state metadata
- POST /api/feedback: validated request submission
- POST /api/notify: newsletter subscribe flow with verification email
- GET /api/notify/confirm?token=...: confirm subscriber
- GET /api/notify/unsubscribe?token=...: unsubscribe subscriber
- GET /api/notify/stats: confirmed/pending/total counters
- POST /api/notify/broadcast: manual release/feed broadcast (admin key)
- POST /api/notify/auto-broadcast: scheduled feed broadcast (cron key)

## Routes

- /
- /claude
- /cursor
- /copilot
- /feedback
- /privacy-policy
- /terms-and-conditions
- /release-notes

## GitHub Actions Workflows

Manual broadcast workflow:

- [broadcast-release.yml](.github/workflows/broadcast-release.yml)
- Requires secrets:
  - BROADCAST_ENDPOINT_URL (example: https://your-domain.com/api/notify/broadcast)
  - ADMIN_BROADCAST_KEY

Auto broadcast scheduler workflow:

- [auto-broadcast-feed-updates.yml](.github/workflows/auto-broadcast-feed-updates.yml)
- Runs every 6 hours and supports manual workflow dispatch
- Requires secrets:
  - AUTO_BROADCAST_ENDPOINT_URL (example: https://your-domain.com/api/notify/auto-broadcast)
  - CRON_BROADCAST_KEY

## Deploy To Vercel

Use repository root as project root. Do not set Root Directory to web.

Recommended settings:

- Framework Preset: Next.js
- Root Directory: repository root
- Install Command: npm install
- Build Command: npm run build
- Output Directory: leave empty

If you see a 404 on /, re-check Root Directory and redeploy.
