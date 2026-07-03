# User Testing Observations

Living log of UX observations, usability feedback, and user-testing suggestions for AI Dev Reference. Use this file to capture findings from reviews and testing sessions before or after implementation.

**How to maintain**

1. Add new entries under the relevant section with date, source (if known), and status.
2. Status values: `open` · `in-progress` · `done` · `won't-fix` · `deferred`
3. When an item is implemented, note the status, date, and primary files touched.
4. Keep original wording where possible so intent is preserved.

---

## Support form (`/feedback`)

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| 2026-07-03 | Add **Other** as a request type in the Type dropdown (alongside Bug report, Missing command, Content update, Feature request). | done | `forms.tsx`, `validators.ts`, `types/forms.ts`. Page copy directs general/privacy requests to **General** tool + **Other** type. |

**Open suggestions**

- _(none)_

---

## What's new (`/whats-new`)

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| 2026-07-03 | When there is no new data, do not show empty-state chrome (hero text, chips like “Recent updates” / “Total catalog items”, empty panel). | done | Sidebar link only appears when unseen updates exist. `/whats-new` redirects home when nothing is new. “Mark as reviewed” returns to home. `reference-shell.tsx`. |

**Open suggestions**

- _(none)_

---

## Tool pages — commands, skills, agents, hooks

### Command vs example display

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| 2026-07-03 | Showing a full invocation (e.g. `/plan add billing retry`) in the command area reads like the entire string is the command. Prefer a pattern placeholder such as `/plan <Add_What_you_want>` with a separate **Example** below. | done | `commandUsage()` in `reference-shell.tsx`; optional `usage` field on `CommandEntry` in `catalog.ts`. |
| 2026-07-03 | Always show **Command** and **Example** sections even when values are identical (e.g. `/help`), for consistency. | done | `renderCommandCard()`, skills, and hooks sections in `reference-shell.tsx`. |

### Filters and legend

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| 2026-07-03 | Do not use a separate Type dropdown filter; it feels redundant with category pills. | done | No type dropdown added; pill nav retained. |
| 2026-07-03 | Badge legend was too large and clumsy when shown as a full-width bar. Make it smaller and place it on the side. | done | Compact sticky `badge-legend-aside` on tool pages. Styles in `sitename.css`. |
| 2026-07-03 | Legend should be a **common** element across command, skills, agents, and hooks views (not only command groups). | done | `renderBadgeLegend()` rendered for all tool page layouts in `renderToolPage()`. Categories: CHAT, SKILL, IDE, WORKFLOW, OTHER. |

### Read more / expanded content

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| 2026-07-03 | A “Read more” modal is not helpful; show additional content inline in the same place when there is more to read. | done | No read-more modal existed in app code; cards already render full descriptions inline. Unused `.modal-*` CSS remains in `sitename.css` (candidate for cleanup). |

**Open suggestions**

- Consider per-command `usage` overrides in `catalog.ts` where `<Add_What_you_want>` is too generic (e.g. `/mcp reconnect <server_name>`).
- Remove orphaned `.modal-*` styles if no modal is planned.

---

## Template for new entries

Copy this block when logging a new observation:

```markdown
| YYYY-MM-DD | _Observation in the user's words_ | open | _Files, PR, or follow-up notes_ |
```

For a new topical section:

```markdown
## Section name (route or component)

| Date | Observation | Status | Notes |
|------|-------------|--------|-------|
| YYYY-MM-DD | ... | open | ... |

**Open suggestions**

- ...
```

---

## Changelog (implementation summary)

| Date | Summary |
|------|---------|
| 2026-07-03 | Initial log from user-testing session: feedback **Other** type, what's-new visibility rules, command/example split, compact side legend, no type dropdown, inline content over modals. |
