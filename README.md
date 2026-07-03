# AI Dev Reference

> Searchable commands, skills, agents, and hooks for **Claude**, **Cursor**, and **GitHub Copilot** — with purpose and copy-paste examples for every entry.

[![Build](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/auto-broadcast-feed-updates.yml?label=auto-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/auto-broadcast-feed-updates.yml)
[![Broadcast Workflow](https://img.shields.io/github/actions/workflow/status/nuthan-murarysetty/ai-dev-ref/broadcast-release.yml?label=manual-broadcast&logo=github)](https://github.com/nuthan-murarysetty/ai-dev-ref/actions/workflows/broadcast-release.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/nuthan-murarysetty/ai-dev-ref)](LICENSE)

**Community-maintained reference. Not affiliated with Anthropic, Cursor, or Microsoft.**

## Live demo

Deploy your own instance or open your production URL after setup:

`https://your-domain.vercel.app`

## Why this exists

Developers switch between Claude Code, Cursor, and Copilot — but slash commands, skills, hooks, and subagents are scattered across different docs. **AI Dev Reference** puts them in one searchable place with:

- live command counts per tool,
- what each command does,
- copy-paste usage examples,
- and bundled skills, agents, and hooks.

## Features

- **Browse commands** for Claude, Cursor, and Copilot with purpose + example on every card
- **Skills, hooks, and subagents** with triggers, invoke patterns, and auto vs user-only flags
- **Global search** across command names, descriptions, and triggers
- **Compare tools** side-by-side on the landing page
- **Submit feedback** — report missing commands or suggest improvements (`/feedback`)
- **Subscribe for updates** — double opt-in email when new catalog entries are published
- **What's new** — see what was added recently (`/whats-new`)

## Screenshots

_Add screenshots of the landing page, command cards, and search after your first deploy._

## Quick start

```bash
git clone https://github.com/nuthan-murarysetty/ai-dev-ref.git
cd ai-dev-ref
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, SMTP, Turnstile, and admin keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, React 19 |
| Validation | Zod, React Hook Form |
| Database | PostgreSQL (Neon) |
| Email | Nodemailer + SMTP |
| Anti-abuse | Cloudflare Turnstile, honeypot, rate limiting |
| Hosting | Vercel |

## Project structure

```
src/
  app/              # Routes and API endpoints
  features/         # ReferenceShell UI and forms
  lib/              # Catalog, subscribers, mail, validation
data/
  catalog.pending.json   # Staging queue for new catalog entries
db/
  subscribers.sql        # PostgreSQL schema bootstrap
docs/
  OPERATIONS.md          # Maintainer handbook (sync, broadcast, deploy)
```

## For operators

Catalog updates, API keys, broadcast workflows, and deployment details are documented in **[docs/OPERATIONS.md](docs/OPERATIONS.md)**.

Quick overview:

1. Add entries to `data/catalog.pending.json`
2. `POST /api/catalog/sync` with `x-admin-key`
3. Subscribers are notified automatically when new entries appear (GitHub Actions cron)

## Contributing

- **Missing a command?** Use the [feedback form](/feedback) on the live site or open an issue.
- **Want to add catalog data?** Open a PR with entries in `data/catalog.pending.json` following the shape in [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Official documentation

Always verify against vendor docs before production use:

- [Claude Code docs](https://docs.anthropic.com/)
- [Cursor docs](https://docs.cursor.com/)
- [GitHub Copilot docs](https://code.visualstudio.com/docs/copilot)

## Disclaimer

This is an **unofficial, community-maintained** reference. Command names, behavior, and availability may change when vendors update their tools. We do our best to keep the catalog current, but always confirm against official documentation.

## License

[MIT](LICENSE) — Copyright (c) 2026 Nuthan Murarysetty
