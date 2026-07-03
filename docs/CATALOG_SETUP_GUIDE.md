# Catalog Setup Guide — Step-by-Step Runbook

This document records exactly how the catalog was populated, validated, merged, and verified. Use it as a repeatable playbook when adding or refreshing catalog data.

---

## Overview of the 4 tasks

| # | Task | Outcome |
|---|------|---------|
| 1 | Gather data from official docs | 102 entries across Claude, Cursor, Copilot |
| 2 | Create `data/catalog.pending.json` | Staging queue for new entries |
| 3 | Validate, merge, check duplicates | 0 warnings, 0 duplicates |
| 4 | Verify API + UI + build | Site shows full catalog locally |

---

## Three storage layers (read this first)

```mermaid
flowchart LR
  PENDING["catalog.pending.json\n(staging draft)"] -->|sync| DB[("PostgreSQL")]
  BASE["baseCatalog in catalog.ts\n(code fallback)"] -->|seed-db| DB
  DB -->|GET /api/catalog| API["JSON response"]
  BASE -->|if DB down| API
```

| Layer | Location | Read by live site? | Purpose |
|-------|----------|-------------------|---------|
| **Pending** | `data/catalog.pending.json` | **No** | Draft queue for *new* entries only |
| **Base catalog** | `src/lib/catalog.ts` | Only if DB unavailable | Backup + seed source |
| **Database** | PostgreSQL `catalog_snapshots` | **Yes** (primary) | Live production catalog |

`/api/catalog` always returns JSON. Check `"sourceFeeds"`:

- `["database-snapshot"]` → data from PostgreSQL
- `["json-seed-cache"]` → fallback from code (DB not connected)

### Reset pending after seed

Once data is in `baseCatalog` and the database, clear the staging file:

```bash
npm run catalog:reset-pending
```

Or seed and reset in one step (default):

```bash
npm run catalog:seed-db
```

`catalog:seed-db` automatically resets `catalog.pending.json` unless you pass `--keep-pending`.

Commit the emptied `catalog.pending.json` so the repo matches production state.

---

## Task 1 — Gather required information

### Sources used

| Tool | Official documentation |
|------|------------------------|
| Claude | [code.claude.com/docs](https://code.claude.com/docs/en/commands) — commands, skills, subagents, hooks |
| Cursor | [cursor.com/docs](https://cursor.com/docs/skills) — skills, hooks, agent commands |
| Copilot | [GitHub Copilot cheat sheet](https://docs.github.com/en/copilot/reference/chat-cheat-sheet) + [VS Code Copilot features](https://code.visualstudio.com/docs/agents/reference/copilot-vscode-features) |

### Data collected per entry type

| Type | Required fields | Identity key (for dedup) |
|------|-----------------|--------------------------|
| Commands | `cmd`, `name`, `desc`, `ex` | `cmd\|name` |
| Skills | `cmd`, `name`, `auto`, `desc`, `ex`, `trigger` | `cmd\|name` |
| Agents | `name`, `badge`, `color`, `desc`, `tools`, `model`, `invoke`, `when` | `name` |
| Hooks | `cmd`, `name`, `auto`, `desc`, `ex`, `trigger` | `cmd\|name` |

### Final counts after merge

| Tool | Commands | Skills | Agents | Hooks | Total |
|------|----------|--------|--------|-------|-------|
| Claude | 29 | 8 | 3 | 6 | 46 |
| Cursor | 11 | 9 | 4 | 6 | 30 |
| Copilot | 15 | 4 | 4 | 3 | 26 |
| **All** | **55** | **21** | **11** | **15** | **102** |

---

## Task 2 — Create the JSON staging file

### File location

```
data/catalog.pending.json
```

### Validate JSON syntax

```bash
node -e "JSON.parse(require('fs').readFileSync('data/catalog.pending.json','utf8')); console.log('JSON OK')"
```

### Base shape

```json
{
  "tools": {
    "claude": { "groups": [], "skills": [], "agents": [], "hooks": [] },
    "cursor": { "groups": [], "skills": [], "agents": [], "hooks": [] },
    "copilot": { "groups": [], "skills": [], "agents": [], "hooks": [] }
  }
}
```

### Example: add a Claude command

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
              "cmd": "/init",
              "name": "Initialize Project",
              "desc": "Generate a starter CLAUDE.md guide for the current repository.",
              "ex": "/init",
              "badge": "wf"
            }
          ]
        }
      ]
    }
  }
}
```

Full examples for skills, agents, and hooks are in [OPERATIONS.md](./OPERATIONS.md).

---

## Task 3 — Validate, merge, and check duplicates

### Scripts added

| Script | npm command | Purpose |
|--------|-------------|---------|
| `scripts/merge-catalog.ts` | `npm run catalog:validate` | Validate + report duplicates without writing |
| `scripts/merge-catalog.ts --write` | `npm run catalog:merge` | Merge pending into baseCatalog, write `data/catalog.merged.json` |
| `scripts/seed-catalog-db.ts` | `npm run catalog:seed-db` | Seed PostgreSQL from baseCatalog (production) |

### Step 3a — Install dependencies

```bash
npm install
npm install -D tsx
```

### Step 3b — Run validation (no writes)

```bash
npm run catalog:validate
```

**Expected output:**

```
=== Catalog Merge Report ===

Inserted from pending:
  claude: 25 commands, 7 skills, 2 agents, 5 hooks
  cursor: 8 commands, 8 skills, 3 agents, 5 hooks
  copilot: 12 commands, 3 skills, 3 agents, 2 hooks

Final catalog totals:
  claude: 29 commands, 8 skills, 3 agents, 6 hooks (46 total)
  cursor: 11 commands, 9 skills, 4 agents, 6 hooks (30 total)
  copilot: 15 commands, 4 skills, 4 agents, 3 hooks (26 total)

Validation warnings: 0
Duplicates found: 0

Merge validation passed.
```

### Step 3c — Merge into baseCatalog

```bash
npm run catalog:merge
```

This updates `src/lib/catalog.ts` (`baseCatalog`) so the site works without a database.

### Step 3d — Sync to database (production)

Scripts load variables from `.env.local` automatically (same as `next dev`).

**Option A — API sync** (merges pending → DB, clears pending file):

```bash
curl -X POST "http://localhost:3000/api/catalog/sync" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY"
```

**Option B — Direct DB seed** (when pending is already merged into baseCatalog):

```bash
npm run catalog:seed-db
```

> **Note:** If all pending entries are already in `baseCatalog`, `POST /api/catalog/sync` returns `insertedTotal: 0` and does not write to the DB. Use `catalog:seed-db` for first-time production setup in that case.

---

## Task 4 — Verify API and UI

### Step 4a — Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Step 4b — Verify full catalog API

```bash
curl -s "http://localhost:3000/api/catalog" | node -e "
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  const data = JSON.parse(Buffer.concat(chunks).toString());
  for (const t of ['claude','cursor','copilot']) {
    const c = data.tools[t];
    const cmds = c.groups.reduce((s,g) => s + g.entries.length, 0);
    console.log(t + ':', cmds, 'commands,', c.skills?.length||0, 'skills,',
      c.agents?.length||0, 'agents,', c.hooks?.length||0, 'hooks');
  }
  console.log('warnings:', data.diagnostics?.validationWarnings?.length ?? 0);
});
"
```

**Expected:**

```
claude: 29 commands, 8 skills, 3 agents, 6 hooks
cursor: 11 commands, 9 skills, 4 agents, 6 hooks
copilot: 15 commands, 4 skills, 4 agents, 3 hooks
warnings: 0
```

### Step 4c — Verify tool-scoped API

```bash
curl -s "http://localhost:3000/api/catalog?tool=claude" | head -c 200
```

### Step 4d — Verify UI pages

```bash
curl -s -o /dev/null -w "/=%{http_code} /claude=%{http_code} /cursor=%{http_code} /copilot=%{http_code}\n" \
  http://localhost:3000/ \
  http://localhost:3000/claude \
  http://localhost:3000/cursor \
  http://localhost:3000/copilot
```

**Expected:** all `200`.

### Step 4e — Production build

```bash
npm run build
```

---

## Deploy and share publicly

### Environment variables (`.env.local` / Vercel)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Neon recommended) |
| `NEXT_PUBLIC_SITE_URL` | Public URL, no trailing slash |
| `ADMIN_BROADCAST_KEY` | Auth for `POST /api/catalog/sync` |
| `CRON_BROADCAST_KEY` | Auth for auto-broadcast cron |

Generate keys:

```bash
openssl rand -base64 48
```

### Database bootstrap

```bash
# Run db/subscribers.sql in your PostgreSQL instance
# Then seed the catalog:
npm run catalog:seed-db
```

### URLs to share

| URL | Purpose |
|-----|---------|
| `https://your-domain.vercel.app` | Landing page + tool comparison |
| `/claude`, `/cursor`, `/copilot` | Per-tool command browsers |
| `/api/catalog` | Public JSON API |
| `/whats-new` | Recently added entries |

---

## Why the landing page shows a comparison table

The table at the bottom of the homepage is **intentional**. It is a **side-by-side tool comparison**, not a git diff or error.

It is rendered in `src/features/reference/reference-shell.tsx` inside the `compare-wrap` section. The first row shows live command counts from the catalog:

- Claude: 29 commands
- Cursor: 11 commands
- Copilot: 15 commands

The counts differ because each vendor exposes a different number of documented slash commands. The remaining rows compare capabilities (skills/agents, MCP, memory files, code review, surfaces) across tools.

This is a feature of the site design — it helps users choose or compare tools at a glance.

---

## Quick command reference

```bash
# Full workflow (local)
npm install
npm run catalog:validate          # 1. Check pending JSON
npm run catalog:merge             # 2. Merge into baseCatalog
npm run dev                       # 3. Start server
curl http://localhost:3000/api/catalog   # 4. Verify API
npm run build                     # 5. Verify production build

# Production
npm run catalog:seed-db           # Seed DB (first deploy)
# OR
curl -X POST "$SITE_URL/api/catalog/sync" -H "x-admin-key: $ADMIN_BROADCAST_KEY"
```

---

## Files touched in this setup

| File | Role |
|------|------|
| `data/catalog.pending.json` | Staging queue for new entries |
| `src/lib/catalog.ts` | `baseCatalog` — in-code fallback + seed source |
| `scripts/merge-catalog.ts` | Validate, dedupe, merge |
| `scripts/seed-catalog-db.ts` | Write baseCatalog to PostgreSQL |
| `package.json` | `catalog:validate`, `catalog:merge`, `catalog:seed-db`, `catalog:reset-pending` scripts |
| `docs/OPERATIONS.md` | Maintainer handbook (API, broadcast, deploy) |
