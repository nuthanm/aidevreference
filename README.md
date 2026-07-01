# AI Developer Tools Reference (Next.js)

Production-oriented Next.js migration of the AI command reference app with:

- Server API forms (no Formspree dependency)
- Schema validation with zod
- React Hook Form + zod client forms
- CAPTCHA support with Cloudflare Turnstile
- SMTP email templates with signature for requests and subscriptions
- Subscriber registry with double opt-in + unsubscribe links
- Official docs links per tool
- Automatic catalog sync from configured feed URLs
- Privacy Policy and Terms pages
- Metadata API + OpenGraph + Twitter + robots + sitemap

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env.local
```

3. Set SMTP and Turnstile keys in .env.local.

4. Start dev server:

```bash
cmd /c npm run dev
```

5. Open http://localhost:3000

## Deploy To Vercel

Use the repository root as the project root in Vercel. Do not set the Root Directory to `web`, because the Next.js app lives at the repository root under `src/app`.

Recommended project settings:

- Framework Preset: `Next.js`
- Root Directory: repository root
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

If an existing Vercel project shows a 404 for `/`, first verify the Root Directory setting and then redeploy.

## Environment Variables

See [.env.example](.env.example) for all variables.

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `MAIL_TO`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `CATALOG_FEEDS` (optional comma-separated list of JSON feeds)
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL` (Neon Postgres connection string for subscriber persistence)

## API Endpoints

- `GET /api/catalog`: merged catalog from base data + remote feeds
- `POST /api/feedback`: validated feature/issue request submission
- `POST /api/notify`: validated update subscription (sends confirmation email)
- `GET /api/notify/confirm?token=...`: confirms subscription token
- `GET /api/notify/unsubscribe?token=...`: unsubscribes recipient
- `GET /api/notify/stats`: public-safe subscription counters (confirmed, pending, total)
- `POST /api/notify/broadcast`: sends release notification to subscribers (requires `x-admin-key` header)

## Routes

- `/`
- `/claude`
- `/cursor`
- `/copilot`
- `/feedback`
- `/privacy-policy`
- `/terms-and-conditions`
- `/release-notes`

## Notification Data

Subscribers are stored in PostgreSQL (Neon recommended) using the `subscribers` table.

Create schema:

```sql
-- run db/subscribers.sql in your Neon SQL editor
```

Set environment variable:

```bash
DATABASE_URL=postgresql://user:password@ep-xxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Broadcast request example:

```json
POST /api/notify/broadcast
x-admin-key: your_admin_broadcast_key

{
	"version": "v1.2.0",
	"notes": [
		"Added new Claude command entries",
		"Updated Copilot quality commands"
	]
}
```

## One-Click Broadcast via GitHub Actions

Use workflow [.github/workflows/broadcast-release.yml](.github/workflows/broadcast-release.yml).

Required GitHub repository secrets:

- `BROADCAST_ENDPOINT_URL` (example: `https://your-domain.com/api/notify/broadcast`)
- `ADMIN_BROADCAST_KEY` (must match server env value)

How to trigger:

1. Open **Actions** tab in GitHub.
2. Select **Broadcast Release Email** workflow.
3. Click **Run workflow**.
4. Enter version and release notes (one note per line).

Only confirmed subscribers receive broadcast emails.
