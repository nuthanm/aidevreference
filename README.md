# AI Developer Tools Reference (Next.js)

Production-oriented Next.js migration of the AI command reference app with:

- Server API forms (no Formspree dependency)
- Schema validation with zod
- React Hook Form + zod client forms
- CAPTCHA support with Cloudflare Turnstile
- SMTP email templates with signature for requests and subscriptions
- Subscriber registry for update notifications
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
npm run dev
```

5. Open http://localhost:3000

## Environment Variables

See [.env.example](.env.example) for all variables.

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `MAIL_TO`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `CATALOG_FEEDS` (optional comma-separated list of JSON feeds)
- `NEXT_PUBLIC_SITE_URL`

## API Endpoints

- `GET /api/catalog`: merged catalog from base data + remote feeds
- `POST /api/contact`: validated contact request submission
- `POST /api/feedback`: validated feature/issue request submission
- `POST /api/notify`: validated update subscription
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

Subscribers are stored at [data/subscribers.json](data/subscribers.json).

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
