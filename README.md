# AI Developer Tools Reference (Next.js)

[![Build](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/auto-broadcast-feed-updates.yml?label=auto-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/auto-broadcast-feed-updates.yml)
[![Broadcast Workflow](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/broadcast-release.yml?label=manual-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/broadcast-release.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/nuthan-murarysetty/ai-dev-ref)](LICENSE)

Production-ready Next.js application for managing and serving Claude, Cursor, and Copilot command references (commands, skills, agents, hooks) using a database-first catalog with JSON fallback.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Catalog Flows](#catalog-flows)
- [Pending Records Guide](#pending-records-guide)
- [Common Mistakes and Validation Checklist](#common-mistakes-and-validation-checklist)
- [API Endpoints](#api-endpoints)
- [Routes](#routes)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Deploy to Vercel](#deploy-to-vercel)
- [Operational Notes](#operational-notes)
- [Ending Note](#ending-note)

## Overview

This project provides a structured reference experience for AI developer tools and supports operational workflows for:

- serving catalog data to the UI,
- applying new entries safely,
- maintaining fallback behavior,
- and running broadcast/notification flows.

## Highlights

- Database snapshot as primary catalog source.
- JSON seed fallback and code fallback for resiliency.
- Pending record sync workflow for controlled catalog updates.
- Tool-scoped catalog fetch support for efficient payload delivery.
- Server API forms (no Formspree dependency).
- Zod + React Hook Form validation.
- Cloudflare Turnstile support.
- SMTP email templates for request, confirm, and broadcast flows.
- Subscriber registry with double opt-in and unsubscribe links.

## Architecture

Catalog source priority:

1. PostgreSQL snapshot table (`catalog_snapshots`, row `id=active`)
2. JSON cache file (`catalog.json`)
3. In-code fallback (`baseCatalog` in `src/lib/catalog.ts`)

Catalog update model:

1. Add entries in `data/catalog.pending.json`
2. Call `POST /api/catalog/sync`
3. Server validates/merges unique entries into DB snapshot
4. Pending file is cleared
5. UI reads latest catalog from `GET /api/catalog`

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

Core application and mail settings:

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- MAIL_FROM, MAIL_TO
- NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL
- DATABASE_URL

Security settings:

- ADMIN_BROADCAST_KEY for POST /api/notify/broadcast and POST /api/catalog/sync
- CRON_BROADCAST_KEY for POST /api/notify/auto-broadcast

Deprecated/removed variables:

- CATALOG_FEEDS (removed; dynamic feed merge is no longer used)

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

## Catalog Flows

### 1. Read Catalog Flow (UI/API)

1. UI calls `GET /api/catalog` or `GET /api/catalog?tool=claude|cursor|copilot`.
2. API tries DB snapshot first.
3. If DB snapshot is unavailable, API falls back to `catalog.json`.
4. If JSON is missing/invalid, API falls back to in-code base catalog.

### 2. Add or Update Entries Flow

1. Add pending records into `data/catalog.pending.json`.
2. Call `POST /api/catalog/sync` with `x-admin-key`.
3. API merges entries by identity keys and prevents duplicates.
4. API persists merged snapshot in DB and clears pending file.

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

PowerShell example:

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

### Invalid vs Valid Examples

Invalid command (missing `desc`, wrong `badge` type):

```json
{
  "cmd": "/trace",
  "name": "Trace Request",
  "ex": "/trace login",
  "badge": 10
}
```

Valid command:

```json
{
  "cmd": "/trace",
  "name": "Trace Request",
  "desc": "Inspect request and execution chain.",
  "ex": "/trace login",
  "badge": "wf"
}
```

Invalid skill (`auto` is string):

```json
{
  "cmd": "@api-hardening",
  "name": "API Hardening",
  "auto": "false",
  "desc": "Adds validation and safety checks.",
  "ex": "@api-hardening feedback",
  "trigger": "When API hardening is requested"
}
```

Valid skill:

```json
{
  "cmd": "@api-hardening",
  "name": "API Hardening",
  "auto": false,
  "desc": "Adds validation and safety checks.",
  "ex": "@api-hardening feedback",
  "trigger": "When API hardening is requested"
}
```

### Recommended Team Process

1. Prepare entries in a feature branch.
2. Run peer review for `data/catalog.pending.json`.
3. Execute sync in staging first.
4. Verify `GET /api/catalog` and UI pages.
5. Run sync in production with admin key.
6. Confirm response inserted counts and snapshot version.

## API Endpoints

- GET /api/catalog
- GET /api/catalog?tool=claude|cursor|copilot
- POST /api/catalog/sync
- GET /api/releases
- POST /api/feedback
- POST /api/notify
- GET /api/notify/confirm?token=...
- GET /api/notify/unsubscribe?token=...
- GET /api/notify/stats
- POST /api/notify/broadcast
- POST /api/notify/auto-broadcast

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

## Deploy to Vercel

Use repository root as project root. Do not set Root Directory to web.

Recommended settings:

- Framework Preset: Next.js
- Root Directory: repository root
- Install Command: npm install
- Build Command: npm run build
- Output Directory: leave empty

If you see a 404 on /, re-check Root Directory and redeploy.

## Operational Notes

- Always review pending records before sync in production.
- Restrict `POST /api/catalog/sync` to trusted operators and environments.
- Keep `data/catalog.pending.json` in version control for traceability.
- Add audit logging and dry-run sync mode if you expect high update frequency.
- Use tool-scoped fetches in UI for better network efficiency.

## Ending Note

This README is organized as an operator-first handbook: understand the flow, stage pending records, sync safely, and verify outcomes. If your catalog volume or team size grows, evolve this model with stricter schema checks, audit trails, and automation gates in CI/CD.
