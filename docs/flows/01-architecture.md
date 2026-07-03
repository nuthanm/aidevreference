# Architecture

High-level system design for AI Dev Reference.

## Component diagram

```mermaid
flowchart TB
  subgraph Client
    BROWSER["Browser"]
  end

  subgraph Next_js["Next.js app"]
    PAGES["App routes\n/, /claude, /cursor, /copilot, /feedback, /whats-new"]
    SHELL["ReferenceShell UI"]
    API["API routes\n/api/*"]
  end

  subgraph Data
  DB[("PostgreSQL\nsubscribers\ncatalog_snapshots\nfeedback_requests\nrelease_broadcast_state")]
  CODE["baseCatalog\nsrc/lib/catalog.ts"]
  PENDING["catalog.pending.json\n(staging only)"]
  end

  subgraph External
    SMTP["SMTP mail"]
    TURNSTILE["Cloudflare Turnstile"]
    GHA["GitHub Actions"]
  end

  BROWSER --> PAGES
  PAGES --> SHELL
  SHELL --> API
  API --> DB
  API --> CODE
  API --> SMTP
  API --> TURNSTILE
  GHA --> API
  PENDING -.->|sync only| API
```

## Data priority (catalog)

```mermaid
flowchart LR
  DB[("PostgreSQL\ncatalog_snapshots")] -->|primary| API["GET /api/catalog"]
  BASE["baseCatalog in code"] -->|fallback if DB down| API
  PEND["catalog.pending.json"] -.->|never read by UI| X["not used at runtime"]
```

| Layer | Read by live site? | Purpose |
|-------|-------------------|---------|
| PostgreSQL snapshot | **Yes** (primary) | Production catalog |
| `baseCatalog` in code | Only if DB unavailable | Seed source + fallback |
| `catalog.pending.json` | **No** | Draft queue before sync |

Check `sourceFeeds` in `/api/catalog` response:

| Value | Meaning |
|-------|---------|
| `["database-snapshot"]` | Live data from PostgreSQL |
| `["json-seed-cache"]` | DB unavailable — code fallback |

## Project layout

```
src/
  app/              Routes and API endpoints
  features/         ReferenceShell UI, forms
  lib/              Catalog, subscribers, mail, validation
  emails/           HTML email templates
data/
  catalog.pending.json   Staging queue (not served directly)
scripts/            catalog:validate, merge, seed-db, reset-pending
db/                 SQL bootstrap files
docs/flows/         Per-feature flow guides (this folder)
```

## API surface (summary)

| Area | Endpoints |
|------|-----------|
| Catalog | `GET /api/catalog`, `POST /api/catalog/sync` |
| Feedback | `POST /api/feedback`, `GET/POST /api/feedback/resolve` |
| Notify | `POST /api/notify`, `GET /api/notify/confirm`, `GET /api/notify/unsubscribe`, `POST /api/notify/resend-confirm` |
| Broadcast | `POST /api/notify/broadcast`, `POST /api/notify/auto-broadcast` |
| Releases | `GET /api/releases` |

Details: [Operations handbook](../OPERATIONS.md)

## Related guides

- [Site & catalog read](02-site-and-catalog-read.md)
- [Environment & keys](10-environment-and-keys.md)
- [CI/CD workflows](09-ci-cd.md)
