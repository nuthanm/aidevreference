# AI Dev Reference

> Searchable commands, skills, agents, and hooks for **Claude**, **Cursor**, and **GitHub Copilot** — with purpose and copy-paste examples for every entry.

[![Build](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/auto-broadcast-feed-updates.yml?label=auto-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/auto-broadcast-feed-updates.yml)
[![Broadcast Workflow](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/broadcast-release.yml?label=manual-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/broadcast-release.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/nuthan-murarysetty/ai-dev-ref)](LICENSE)

**Community-maintained reference. Not affiliated with Anthropic, Cursor, or Microsoft.**

---

## What this site does

Developers switch between Claude Code, Cursor, and Copilot — but slash commands, skills, hooks, and subagents are scattered across different docs. **AI Dev Reference** puts them in one searchable place:

| Capability | Description |
|------------|-------------|
| **Browse** | Commands, skills, agents, and hooks per tool |
| **Search** | Global search across names, descriptions, and triggers |
| **Compare** | Side-by-side tool comparison on the landing page |
| **Copy examples** | Every card includes a copy-paste usage example |
| **Subscribe** | Email alerts when new catalog entries are published |
| **What's new** | `/whats-new` shows recently added entries |

### Current catalog size

| Tool | Commands | Skills | Agents | Hooks | Total |
|------|----------|--------|--------|-------|-------|
| Claude | 29 | 8 | 3 | 6 | **46** |
| Cursor | 11 | 9 | 4 | 6 | **30** |
| Copilot | 15 | 4 | 4 | 3 | **26** |
| **All** | **55** | **21** | **11** | **15** | **102** |

---

## Site map

```mermaid
flowchart TB
  subgraph Public pages
    HOME["/  Landing + compare"]
    CLAUDE["/claude"]
    CURSOR["/cursor"]
    COPILOT["/copilot"]
    NEW["/whats-new"]
    FB["/feedback"]
  end

  subgraph API
    API_ALL["GET /api/catalog"]
    API_TOOL["GET /api/catalog?tool=claude|cursor|copilot"]
    API_SYNC["POST /api/catalog/sync"]
  end

  HOME --> CLAUDE & CURSOR & COPILOT
  API_ALL --> HOME & CLAUDE & CURSOR & COPILOT
  API_TOOL --> CLAUDE & CURSOR & COPILOT
```

| Route | What you see |
|-------|--------------|
| `/` | Tool cards, live entry counts, **comparison table** |
| `/claude` | Claude commands grouped by category + skills, agents, hooks |
| `/cursor` | Cursor commands, skills, agents, hooks |
| `/copilot` | Copilot chat commands, workspace agents, skills, hooks |
| `/whats-new` | Recently added catalog entries |
| `/feedback` | Submit support requests, report missing commands, or sign up for updates |
| `/api/catalog` | Public JSON API (cached, no auth) |

---

## Catalog workflows — when to do what

### Three storage layers

```mermaid
flowchart LR
  PENDING["catalog.pending.json\n(staging draft)"] -->|sync| DB[("PostgreSQL")]
  BASE["baseCatalog in catalog.ts\n(code fallback)"] -->|seed-db| DB
  DB -->|GET /api/catalog| API["JSON response"]
  BASE -->|if DB down| API
```

| Layer | File | Live site reads it? | When you touch it |
|-------|------|---------------------|-------------------|
| **Pending** | `data/catalog.pending.json` | **No** | When adding **new** commands only |
| **Base catalog** | `src/lib/catalog.ts` | Only if DB is down | After merge, or bulk initial setup |
| **Database** | PostgreSQL `catalog_snapshots` | **Yes** (primary) | First deploy + every production update |

`/api/catalog` always returns JSON. Check `"sourceFeeds"` in the response:

| Value | Meaning |
|-------|---------|
| `["database-snapshot"]` | Data is coming from **PostgreSQL** |
| `["json-seed-cache"]` | DB unavailable — using **code fallback** |

`/api/catalog/sync` in a browser shows **405 or help text** — that endpoint requires **POST**, not GET. Use the scripts or curl below instead.

---

### Scripts — what they do and when to run them

| Command | When to run | What it does | Clears pending? |
|---------|-------------|--------------|-----------------|
| `npm run catalog:validate` | **Before every PR** that changes catalog files | Checks JSON, required fields, duplicates | No |
| `npm run catalog:merge` | When developing **without a database** | Merges pending → `baseCatalog` in code | No |
| `npm run catalog:seed-db` | **First production deploy**, or full refresh from code | Writes `baseCatalog` → PostgreSQL | **Yes** (auto) |
| `npm run catalog:reset-pending` | After seed, or when pending is stale but DB is live | Empties `catalog.pending.json` | **Yes** |
| `POST /api/catalog/sync` | When adding **new entries** via pending (incremental) | Merges pending → PostgreSQL | Yes, if new rows inserted |
| `npm run dev` | Local preview anytime | Starts site; reads DB or fallback | No |
| `npm run build` | Before deploy | Production build check | No |

---

### Scenario A — First-time setup (you are here)

**When:** New project, empty database, catalog already in `baseCatalog`.

```mermaid
flowchart LR
  A["Run db/subscribers.sql"] --> B["Set DATABASE_URL in .env.local"]
  B --> C["npm run catalog:seed-db"]
  C --> D["Commit empty pending.json"]
  D --> E["Deploy to Vercel with same DATABASE_URL"]
  E --> F["Share public URL"]
```

```bash
# 1. Bootstrap DB schema (once, in Neon SQL editor)
#    Run db/subscribers.sql

# 2. Local seed
npm install
cp .env.example .env.local   # set DATABASE_URL
npm run catalog:seed-db      # writes DB + clears pending

# 3. Verify
npm run dev
# Open http://localhost:3000 — check sourceFeeds is database-snapshot

# 4. Deploy
# Set DATABASE_URL + NEXT_PUBLIC_SITE_URL on Vercel, then deploy
```

You do **not** need `POST /api/catalog/sync` for first-time setup if you used `catalog:seed-db`.

---

### Scenario B — Adding new commands later

**When:** Vendors release new slash commands; you want to add a few entries.

```mermaid
flowchart LR
  A["Add entries to catalog.pending.json"] --> B["npm run catalog:validate"]
  B --> C["Open PR"]
  C --> D["Merge to main"]
  D --> E["Catalog Deploy workflow OR POST sync"]
  E --> F["Pending cleared, DB updated"]
```

```bash
# 1. Add ONLY new entries to data/catalog.pending.json
npm run catalog:validate

# 2. Sync to production (pick one)
#    Option A — GitHub Actions (after secrets are set): merge PR → auto deploy
#    Option B — Manual API:
curl -X POST "https://aidevreference.vercel.app/api/catalog/sync" \
  -H "x-admin-key: YOUR_ADMIN_BROADCAST_KEY"

# 3. Verify
curl https://aidevreference.vercel.app/api/catalog
```

---

### Scenario C — Local development only (no database)

**When:** You want to preview the site without PostgreSQL.

```bash
npm run catalog:merge   # optional: merge pending into baseCatalog
npm run dev             # site reads baseCatalog fallback
```

No seed or sync needed.

---

### Scenario D — Pending file is full but DB is already seeded

**When:** You ran `catalog:seed-db` earlier and `catalog.pending.json` still has data.

This is normal — seed does not use pending. Reset it:

```bash
npm run catalog:reset-pending
git add data/catalog.pending.json
git commit -m "Reset catalog pending after seed"
```

Or re-run seed (also clears pending):

```bash
npm run catalog:seed-db
```

---

### Automated workflow (GitHub Actions)

**When:** After one-time GitHub secrets setup — runs on every catalog PR and merge.

```mermaid
flowchart LR
  PR["Open PR with catalog changes"] --> VAL["Catalog Validate"]
  VAL --> MERGE["Merge to main"]
  MERGE --> DEPLOY["Catalog Deploy"]
  DEPLOY --> SYNC["POST /api/catalog/sync"]
  DEPLOY --> SEED["npm run catalog:seed-db"]
  DEPLOY --> CHECK["Verify /api/catalog"]
```

| Workflow | When it runs | What it does |
|----------|--------------|--------------|
| **Catalog Validate** | Every PR touching catalog files | JSON check + duplicate detection |
| **Catalog Deploy** | Push to `main` or manual dispatch | Sync API + seed DB + verify live API |
| **Auto Broadcast** | Every 6 hours | Email subscribers about new entries |

#### One-time GitHub secrets (do this once before automation works)

| Secret | Example value |
|--------|---------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `SYNC_ENDPOINT_URL` | `https://aidevreference.vercel.app/api/catalog/sync` |
| `ADMIN_BROADCAST_KEY` | Same key as in Vercel env vars |
| `SITE_URL` | `https://aidevreference.vercel.app` |

**Manual trigger:** GitHub → Actions → **Catalog Deploy** → Run workflow → choose `auto`, `sync`, or `seed`.

> **Full runbook:** [docs/CATALOG_SETUP_GUIDE.md](docs/CATALOG_SETUP_GUIDE.md) · **Operator handbook:** [docs/OPERATIONS.md](docs/OPERATIONS.md)

---

## Architecture

```mermaid
flowchart TD
  PENDING["data/catalog.pending.json"] -->|POST /api/catalog/sync| SYNC["catalog-sync.ts"]
  BASE["baseCatalog in catalog.ts"] --> SYNC
  SYNC -->|merge + dedupe| DB[("PostgreSQL catalog_snapshots")]
  DB --> API["GET /api/catalog"]
  BASE -->|fallback if DB unavailable| API
  API --> UI["ReferenceShell UI"]
```

**Data priority:**

1. PostgreSQL snapshot (`catalog_snapshots`, row `id=active`) — **live site reads this**
2. In-code fallback (`baseCatalog` in `src/lib/catalog.ts`) — only if DB is unavailable

`catalog.pending.json` is **not** read by the site. It is a staging draft for new entries before sync.

After seeding, reset pending so the repo stays clean:

```bash
npm run catalog:reset-pending   # or included automatically in catalog:seed-db
```

**Dedup keys** (duplicates are silently skipped on sync):

| Type | Key |
|------|-----|
| Commands | `cmd\|name` |
| Skills / Hooks | `cmd\|name` |
| Agents | `name` |

---

## Why the landing page shows a comparison table

The table at the bottom of `/` is **intentional** — it is a **side-by-side tool comparison**, not a git diff or error.

| Row | What it shows |
|-----|---------------|
| Built-in commands count | Live counts from the catalog (e.g. Claude 29, Cursor 11, Copilot 15) |
| Bundled skills/agents | How each tool packages reusable workflows |
| Parallel execution | Whether the tool supports parallel agent/task flows |
| Context management | How each tool handles project memory and context |
| MCP support | Model Context Protocol availability |
| Memory/rules file | Where persistent instructions live per tool |
| Code review | Review workflows per tool |
| Surfaces | Where you use each tool (terminal, IDE, chat) |

Command counts differ because each vendor documents a different number of slash commands. That is expected and reflects real product differences.

---

## Quick start (local development)

```bash
git clone https://github.com/nuthan-murarysetty/ai-dev-ref.git
cd ai-dev-ref
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, SMTP, Turnstile, and admin keys (optional for local catalog browsing)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The catalog loads from `baseCatalog` even without a database configured.

---

## npm scripts

| Command | When to run | Purpose |
|---------|-------------|---------|
| `npm run dev` | Local preview anytime | Start dev server |
| `npm run build` | Before every deploy | Production build check |
| `npm run catalog:validate` | Before every catalog PR | Validate pending JSON + check duplicates |
| `npm run catalog:merge` | Local dev without DB | Merge pending into `baseCatalog` |
| `npm run catalog:seed-db` | **First deploy** or full DB refresh | Write `baseCatalog` → PostgreSQL + reset pending |
| `npm run catalog:reset-pending` | After seed, or when pending is stale | Clear `catalog.pending.json` |

---

## Project structure

```
src/
  app/              # Routes and API endpoints
  features/         # ReferenceShell UI and forms
  lib/              # Catalog, subscribers, mail, validation
data/
  catalog.pending.json   # Staging queue for new catalog entries
scripts/
  merge-catalog.ts       # Validate + merge + dedupe
  seed-catalog-db.ts     # Seed PostgreSQL from baseCatalog
  reset-pending.ts       # Clear staging file
db/
  subscribers.sql        # PostgreSQL schema bootstrap
docs/
  OPERATIONS.md          # Maintainer handbook (sync, broadcast, deploy)
  CATALOG_SETUP_GUIDE.md # Step-by-step catalog population runbook
```

---

## Environment variables

See [.env.example](.env.example) for the full template.

| Variable | Required for | Purpose |
|----------|--------------|---------|
| `DATABASE_URL` | Production sync | PostgreSQL catalog + subscribers |
| `NEXT_PUBLIC_SITE_URL` | Production | SEO, sitemap, email links |
| `ADMIN_BROADCAST_KEY` | Catalog sync | Auth for `POST /api/catalog/sync` |
| `CRON_BROADCAST_KEY` | Auto-broadcast | GitHub Actions cron |
| `SMTP_*`, `MAIL_*` | Email features | Feedback + subscriber notifications |
| `TURNSTILE_*` | Forms | Anti-abuse on feedback/subscribe |

Generate secure keys:

```bash
openssl rand -base64 48
```

---

## API endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/catalog` | None | Full catalog JSON |
| `GET` | `/api/catalog?tool=claude` | None | Single tool catalog |
| `POST` | `/api/catalog/sync` | `x-admin-key` | Merge pending → DB |
| `POST` | `/api/feedback` | Turnstile | User feedback |
| `POST` | `/api/notify` | Turnstile | Subscribe for updates |

---

## Contributing

- **Missing a command?** Use the [feedback form](/feedback) on the live site or open an issue.
- **Want to add catalog data?** Open a PR with entries in `data/catalog.pending.json` following [docs/OPERATIONS.md](docs/OPERATIONS.md).
- **Operator runbook:** [docs/CATALOG_SETUP_GUIDE.md](docs/CATALOG_SETUP_GUIDE.md)

---

## Official documentation

Always verify against vendor docs before production use:

- [Claude Code docs](https://code.claude.com/docs)
- [Cursor docs](https://cursor.com/docs)
- [GitHub Copilot docs](https://code.visualstudio.com/docs/copilot)

---

## Disclaimer

This is an **unofficial, community-maintained** reference. Command names, behavior, and availability may change when vendors update their tools. We do our best to keep the catalog current, but always confirm against official documentation.

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Nuthan Murarysetty
