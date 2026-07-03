# Operations Guide

Operator handbook for maintaining the AI Dev Reference catalog, subscribers, and broadcast workflows.

## Architecture

Catalog source priority:

1. PostgreSQL snapshot table (`catalog_snapshots`, row `id=active`)
2. In-code fallback (`baseCatalog` in `src/lib/catalog.ts`)

Catalog update model:

1. Add entries in `data/catalog.pending.json`
2. Call `POST /api/catalog/sync` with `x-admin-key`
3. Server validates/merges unique entries into DB snapshot
4. Pending file is cleared
5. UI reads latest catalog from `GET /api/catalog`

## Environment Variables

See [.env.example](../.env.example) for the complete template.

Core application and mail settings:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `MAIL_TO`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`

Security settings:

- `ADMIN_BROADCAST_KEY` for `POST /api/notify/broadcast` and `POST /api/catalog/sync`
- `CRON_BROADCAST_KEY` for `POST /api/notify/auto-broadcast`

Deprecated/removed variables:

- `CATALOG_FEEDS` (removed; dynamic feed merge is no longer used)

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

- `ADMIN_BROADCAST_KEY`
- `CRON_BROADCAST_KEY`

For **Auto Broadcast Feed Updates**, GitHub sends both `x-cron-key` and `x-admin-key`. At least one must match the corresponding Vercel environment variable. If you only maintain one key, set `ADMIN_BROADCAST_KEY` in both GitHub and Vercel and leave `CRON_BROADCAST_KEY` empty in GitHub (or set both to the same value).

## Resolving Feedback Requests

When a user submits feedback, the admin email includes a **Mark resolved and notify** button.

1. Fix the catalog entry or content issue.
2. Open the resolve link from the admin email (or call the API).
3. The requester receives a **Request resolved** email with a link back to the site.

### Backfill for requests submitted before deploy

Older requests were emailed but not stored with a resolve token. After deploy, notify them with:

```bash
curl -X POST "https://your-domain.com/api/feedback/resolve" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{
    "email": "requester@example.com",
    "name": "Nuthan",
    "tool": "Cursor",
    "type": "Missing command",
    "note": "Added the missing command to the catalog."
  }'
```

This sends the resolved email even when no earlier resolve link exists.

### Pending notify subscribers before deploy

Resend confirmation emails so they can verify and receive future updates:

```bash
curl -X POST "https://your-domain.com/api/notify/resend-confirm" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"email":"subscriber@example.com"}'
```

Resend to all pending subscribers:

```bash
curl -X POST "https://your-domain.com/api/notify/resend-confirm" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"allPending":true}'
```

Optional resolution note (GET):

```text
/api/feedback/resolve?token=<token>&note=Added%20missing%20command%20to%20catalog
```

Programmatic resolve (POST):

```bash
curl -X POST "https://your-domain.com/api/feedback/resolve" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"token":"<resolve-token>","note":"Optional note for the requester"}'
```

## Database Setup

Use PostgreSQL (Neon recommended).

1. Run [db/subscribers.sql](../db/subscribers.sql) in your database.
2. Run [db/feedback_requests.sql](../db/feedback_requests.sql) for request resolution tracking.
3. Set `DATABASE_URL` in your environment.

### Scripts reference

| Script | npm command | When to run |
|--------|-------------|-------------|
| `scripts/merge-catalog.ts` | `npm run catalog:validate` | Before every catalog PR |
| `scripts/merge-catalog.ts --write` | `npm run catalog:merge` | Local dev without DB |
| `scripts/seed-catalog-db.ts` | `npm run catalog:seed-db` | First deploy or full DB refresh |
| `scripts/reset-pending.ts` | `npm run catalog:reset-pending` | After seed, or stale pending file |
| API route | `POST /api/catalog/sync` | Incremental new entries in pending |

See [CATALOG_SETUP_GUIDE.md](./CATALOG_SETUP_GUIDE.md) for the full decision guide and scenario walkthroughs.

---

## Catalog Flows

### 1. Read Catalog Flow (UI/API)

1. UI calls `GET /api/catalog` or `GET /api/catalog?tool=claude|cursor|copilot`.
2. API tries DB snapshot first.
3. If DB snapshot is unavailable, API falls back to in-code `baseCatalog`.

### 2. Add or Update Entries Flow

**When:** Adding new commands after initial deploy (production is already live).

1. Add pending records into `data/catalog.pending.json`.
2. Run `npm run catalog:validate` locally or open a PR (Catalog Validate workflow runs).
3. Call `POST /api/catalog/sync` with `x-admin-key` — or merge to `main` and let Catalog Deploy run.
4. API merges entries by identity keys and prevents duplicates.
5. API persists merged snapshot in DB and clears pending file (when inserts > 0).

### 2b. First Deploy or Full Refresh Flow

**When:** Empty database, or you need to push entire `baseCatalog` to PostgreSQL.

1. Ensure `DATABASE_URL` is set in `.env.local` (local) or Vercel (production).
2. Run `db/subscribers.sql` once if tables do not exist.
3. Run `npm run catalog:seed-db` — writes full catalog to DB and resets pending.
4. Verify `GET /api/catalog` returns `"sourceFeeds":["database-snapshot"]`.

Do **not** use `POST /api/catalog/sync` for first-time setup if pending is empty or already merged into `baseCatalog`.

### 2c. Reset Stale Pending File

**When:** `catalog.pending.json` is full but data is already in DB and `baseCatalog`.

```bash
npm run catalog:reset-pending
git add data/catalog.pending.json && git commit -m "Reset catalog pending"
```

The live site does **not** read pending — resetting is safe and keeps the repo clean.

### 3. Large Catalog Efficiency Flow

1. Use tool-scoped calls (`?tool=claude`, `?tool=cursor`, `?tool=copilot`).
2. Cache headers and ETag reduce repeat transfer cost.
3. If catalog grows significantly, add server-side pagination/search endpoints.

## Pending Records Guide

File location: `data/catalog.pending.json`

Use this file as a temporary queue for new records. After sync succeeds, it is reset automatically.

Base shape:

```json
{
  "tools": {
    "claude": { "groups": [], "skills": [], "agents": [], "hooks": [] },
    "cursor": { "groups": [], "skills": [], "agents": [], "hooks": [] },
    "copilot": { "groups": [], "skills": [], "agents": [], "hooks": [] }
  }
}
```

### Flow A: Add Command Records (groups.entries)

```json
{
  "tools": {
    "claude": {
      "groups": [
        {
          "id": "core",
          "label": "Core Commands",
          "entries": [
            {
              "cmd": "/trace",
              "name": "Trace Request",
              "desc": "Inspect request and execution chain.",
              "ex": "/trace payment timeout",
              "badge": "wf"
            }
          ]
        }
      ]
    }
  }
}
```

### Flow B: Add Skill Records

```json
{
  "tools": {
    "cursor": {
      "skills": [
        {
          "cmd": "@api-hardening",
          "name": "API Hardening",
          "auto": false,
          "desc": "Adds validation, throttling, and safety checks.",
          "ex": "@api-hardening apply for feedback endpoint",
          "trigger": "When user asks for API robustness improvements"
        }
      ]
    }
  }
}
```

### Flow C: Add Agent Records

```json
{
  "tools": {
    "copilot": {
      "agents": [
        {
          "name": "Migration Assistant",
          "badge": "Workflow · Advanced",
          "color": "#10B981",
          "desc": "Guides cross-file migrations with verification steps.",
          "tools": "Edit, Search, Terminal",
          "model": "Copilot Agent",
          "invoke": "On demand",
          "when": "When refactoring multiple related modules"
        }
      ]
    }
  }
}
```

### Flow D: Add Hook Records

```json
{
  "tools": {
    "claude": {
      "hooks": [
        {
          "cmd": "post-response",
          "name": "Post Response Cleanup",
          "auto": true,
          "desc": "Applies cleanup rules after answer generation.",
          "ex": "trim temporary context buffers",
          "trigger": "Runs after a response is completed"
        }
      ]
    }
  }
}
```

### Apply Pending Records

Bash:

```bash
curl -X POST "http://localhost:3000/api/catalog/sync" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY"
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/catalog/sync" `
  -Headers @{ "x-admin-key" = "<ADMIN_BROADCAST_KEY>" }
```

Expected result:

- inserted counts by tool,
- total inserted count,
- snapshot version and timestamp,
- validation diagnostics.

## Common Mistakes and Validation Checklist

Use this checklist before calling `POST /api/catalog/sync`.

### Common Mistakes

- Missing required keys (`cmd`, `name`, `desc`, `ex` for commands).
- Using the wrong section (for example, adding agents under `skills`).
- Duplicate entries in the same batch.
- Incorrect data types (`auto` must be boolean, not string).
- Empty strings for identifiers (`id`, `name`, `cmd`).
- Invalid tool keys (only `claude`, `cursor`, `copilot` are supported).

### Quick Validation Checklist

1. JSON is valid and formatted correctly.
2. Top-level shape contains `tools`.
3. Tool keys are only `claude`, `cursor`, `copilot`.
4. Each group has `id`, `label`, and `entries` array.
5. Each command entry has non-empty `cmd`, `name`, `desc`, `ex`.
6. Each skill/hook has non-empty `cmd`, `name`, `desc`, `ex`, `trigger` and valid `auto`.
7. Each agent has non-empty `name`, `badge`, `color`, `desc`, `tools`, `model`, `invoke`, `when`.
8. No duplicates by identity key:
   - command: `cmd|name`
   - skill: `cmd|name`
   - hook: `cmd|name`
   - agent: `name`
9. Optional values (like `badge`) are from expected values where applicable.
10. File is committed/reviewed before sync in production.

### Recommended Team Process

1. Prepare entries in a feature branch.
2. Run peer review for `data/catalog.pending.json`.
3. Execute sync in staging first.
4. Verify `GET /api/catalog` and UI pages.
5. Run sync in production with admin key.
6. Confirm response inserted counts and snapshot version.

## API Endpoints

- `GET /api/catalog`
- `GET /api/catalog?tool=claude|cursor|copilot`
- `POST /api/catalog/sync`
- `GET /api/releases`
- `POST /api/feedback`
- `GET /api/feedback/resolve?token=...`
- `POST /api/feedback/resolve` (admin key)
- `POST /api/notify/resend-confirm` (admin key)
- `POST /api/notify`
- `GET /api/notify/confirm?token=...`
- `GET /api/notify/unsubscribe?token=...`
- `GET /api/notify/stats`
- `POST /api/notify/broadcast`
- `POST /api/notify/auto-broadcast`

## Routes

- `/`
- `/claude`
- `/cursor`
- `/copilot`
- `/feedback`
- `/privacy-policy`
- `/terms-and-conditions`
- `/whats-new`

## GitHub Actions Workflows

Catalog automation:

- [catalog-validate.yml](../.github/workflows/catalog-validate.yml) — validates catalog JSON and checks duplicates on every PR
- [catalog-deploy.yml](../.github/workflows/catalog-deploy.yml) — auto-syncs/seeds production DB on push to `main` (manual dispatch supported)

Manual broadcast workflow:

- [broadcast-release.yml](../.github/workflows/broadcast-release.yml)
- Requires secrets:
  - `BROADCAST_ENDPOINT_URL` (example: `https://your-domain.com/api/notify/broadcast`)
  - `ADMIN_BROADCAST_KEY`

Auto broadcast scheduler workflow:

- [auto-broadcast-feed-updates.yml](../.github/workflows/auto-broadcast-feed-updates.yml)
- Runs every 6 hours and supports manual workflow dispatch
- Requires secrets:
  - `AUTO_BROADCAST_ENDPOINT_URL` (example: `https://your-domain.com/api/notify/auto-broadcast`)
  - `CRON_BROADCAST_KEY`

### Catalog automation secrets

Add these GitHub Actions secrets for hands-free catalog deploys:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Direct DB seed via `catalog:seed-db` |
| `SYNC_ENDPOINT_URL` | Production sync endpoint (e.g. `https://your-domain.com/api/catalog/sync`) |
| `ADMIN_BROADCAST_KEY` | Auth header for sync API |
| `SITE_URL` | Post-deploy verification (e.g. `https://your-domain.com`) |

When `catalog.pending.json` or `src/lib/catalog.ts` changes on `main`, the **Catalog Deploy** workflow runs automatically.

## Deploy to Vercel

Use repository root as project root. Do not set Root Directory to `web`.

Recommended settings:

- Framework Preset: Next.js
- Root Directory: repository root
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

If you see a 404 on `/`, re-check Root Directory and redeploy.

## Operational Notes

- Always review pending records before sync in production.
- Restrict `POST /api/catalog/sync` to trusted operators and environments.
- Keep `data/catalog.pending.json` in version control for traceability.
- Never commit `data/subscribers.json` — subscribers live in PostgreSQL only.
- Add audit logging and dry-run sync mode if you expect high update frequency.
- Use tool-scoped fetches in UI for better network efficiency.
