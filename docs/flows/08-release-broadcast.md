# Release broadcast flow

Email confirmed subscribers when the catalog changes.

## Two broadcast modes

```mermaid
flowchart TB
  subgraph Manual
    M1["GitHub: Broadcast Release Email\nor POST /api/notify/broadcast"] --> M2["Send to all confirmed subscribers"]
  end

  subgraph Auto
    A1["GitHub: Auto Broadcast Feed Updates\nevery 6 hours"] --> A2["POST /api/notify/auto-broadcast"]
    A2 --> A3{"New catalog entries\nsince last broadcast?"}
    A3 -->|yes| M2
    A3 -->|no| SKIP["Skip — no email"]
  end
```

## Manual broadcast flow

```mermaid
sequenceDiagram
  participant Op as Operator
  participant GHA as GitHub Actions
  participant API as POST /api/notify/broadcast
  participant DB as subscribers + broadcast_state
  participant SMTP as Mail

  Op->>GHA: workflow_dispatch version + notes
  GHA->>API: x-admin-key + payload
  API->>DB: read confirmed subscribers
  API->>SMTP: release email per subscriber
  API->>DB: update broadcast state
```

**Or curl directly:**

```bash
curl -X POST "https://your-domain.com/api/notify/broadcast" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"version":"2026.07.03","notes":["Added /trace command to Claude"]}'
```

If `notes` omitted, API builds notes from catalog diff.

## Auto-broadcast flow

```mermaid
sequenceDiagram
  participant Cron as GitHub schedule
  participant API as POST /api/notify/auto-broadcast
  participant Cat as catalog diff
  participant SMTP as Mail

  Cron->>API: x-cron-key and/or x-admin-key
  alt first run
    API->>API: baseline state, skip send
  else new entries detected
    API->>Cat: compare feed keys
    API->>SMTP: broadcast to confirmed subscribers
  else no changes
    API-->>Cron: skipped
  end
```

## Fixing HTTP 401 Unauthorized

If auto-broadcast fails with `{"ok":false,"error":"Unauthorized"}`:

```mermaid
flowchart TD
  A["401 on auto-broadcast"] --> B{"GitHub secret matches\nVercel env?"}
  B -->|CRON_BROADCAST_KEY mismatch| C["Align CRON_BROADCAST_KEY\nin GitHub + Vercel"]
  B -->|only ADMIN key set| D["Set ADMIN_BROADCAST_KEY\nin GitHub secrets too"]
  C --> E["Re-run workflow"]
  D --> E
```

The endpoint accepts **either**:

| Header | Env var |
|--------|---------|
| `x-cron-key` | `CRON_BROADCAST_KEY` |
| `x-admin-key` | `ADMIN_BROADCAST_KEY` |

GitHub workflow sends both when secrets exist.

## GitHub secrets

| Secret | Example |
|--------|---------|
| `AUTO_BROADCAST_ENDPOINT_URL` | `https://your-domain.com/api/notify/auto-broadcast` |
| `CRON_BROADCAST_KEY` | Same as Vercel |
| `ADMIN_BROADCAST_KEY` | Same as Vercel (fallback) |
| `BROADCAST_ENDPOINT_URL` | `https://your-domain.com/api/notify/broadcast` |

## Typical operator sequence

1. Merge catalog changes → [Catalog update](03-catalog-update.md)
2. Verify live site shows new entries
3. Run **Broadcast Release Email** workflow **or** wait for auto-broadcast (6h cron)
4. For individual requesters → [Feedback resolve](06-feedback-and-resolve.md) (not the same as broadcast)

## Related guides

- [CI/CD workflows](09-ci-cd.md)
- [Environment & keys](10-environment-and-keys.md)
- [Subscriber notify](07-subscriber-notify.md)
