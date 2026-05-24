<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Toolsmaxxing — Agent Quick Reference

> **Token rule:** This file is the default context. Do **not** read `system-design.md` or `task.md` unless the task touches schema, RLS, reputation, triage, edits, webhooks, or phased scope. `CLAUDE.md` is **stale** — ignore it; `system-design.md` is canonical.

## What we're building

Community-curated AI tools catalog. Users discover, submit, review, and curate tools. **Stack:** Next.js 16 (App Router, RSC, Server Actions) · Supabase (Postgres + Auth + Storage + Edge Functions) · Postgres FTS · Discord/Telegram webhooks (Phase 3).

Reference UI to port: `temp/app/` (Vite + shadcn) — **not** its MySQL/Drizzle/tRPC backend.

## Core mental model (memorize this)

Almost everything is one of three concerns acting on a **tool entry**:

1. **Catalog** — published `tools` row (what guests browse)
2. **Contribution** — intake/pipeline: scrape, submit, triage, suggested edit
3. **Social signal** — fav, upvote, comment, review, collection

**Trap:** Do not merge raw intake, user submission, and published catalog into one table with a `status` column. Raw intake and catalog are different lifecycles → different tables.

```
Intake (fast drop, submit) → Pipeline (scrape_jobs, triage_queue, suggested_edits) → Catalog (tools)
                                    ↑ social + identity wrap the catalog
```

## Build phases (scope gate)

| Phase | Ship when | Key tables/features |
| ----- | --------- | ------------------- |
| **0** | Auth works | profiles, OAuth, Storage buckets, UI shell |
| **1** (V1) | Useful product | tools, tags, tool_tags, tool_media, upvotes, favorites, reviews, comments, collections, search, dedup |
| **2** | Real usage shows need | reputation_events, scrape_jobs, triage_queue, suggested_edits |
| **3** | Admin + alerts | notifications, webhook_events, pin/roles |
| **4** | Ongoing | RLS audit, rate limits, JWT claims if slow |

**Default to Phase 0–1** unless the task explicitly says Phase 2+. See `task.md` for checklists.

## Data model cheat sheet

All tables: `id uuid default gen_random_uuid()`, `created_at timestamptz default now()` unless noted.

**Identity:** `profiles` (extends auth.users; `role`: `member | trusted | admin`; `reputation_points` is denormalized cache), `reputation_events` (append-only log — **never** edit totals in place)

**Catalog:** `tools` (`slug`, `normalized_url` **unique** dedup key, `pricing_model`, `deployment[]`, `is_byok`, `has_api`, `search_vector`, `upvote_count`), `tags`, `tool_tags`, `tool_media`

**Pipeline (Phase 2):** `scrape_jobs`, `triage_queue`, `suggested_edits` (`diff` + `base_snapshot` — field-level, not full copy)

**Social:** `upvotes`, `favorites`, `reviews`, `comments` (threaded via `parent_id`), `collections`, `collection_items`

**Automation (Phase 3):** `notifications`, `webhook_events` (outbox — never fire webhooks inline)

**Pricing/deployment are columns on `tools`, not tags.** Strict vocab: `pricing_model`: `open_source | freemium | paid | free`; `deployment[]`: `local | cloud | hybrid`.

## Auth & roles

OAuth only (GitHub + Google). No passwords.

| Role | Can |
| ---- | --- |
| Guest | Read catalog, search, public collections |
| Member | Submit, fast-drop, fav, upvote, comment, review, collections, suggest edits |
| Trusted | + triage queue claim/publish |
| Admin | + pin tools, manage roles, moderate |

## Security (RLS is the wall)

- Frontend permission checks = UX only. **RLS in Postgres is the real boundary.**
- Public read: tools, tags, tool_tags, tool_media, reviews, comments, public collections
- Social writes: `auth.uid() = user_id` only
- tools INSERT: any authed user; UPDATE: submitter or admin (or approved-edit path); pin fields: admin only
- triage_queue: trusted/admin only
- suggested_edits approve/reject: tool submitter or admin
- reputation_events, webhook_events: **no client writes** — SECURITY DEFINER functions/workers only
- profiles: public SELECT; own UPDATE; `role`/`reputation_points` not client-writable

## Non-negotiable design rules

1. **Dedup from day one:** canonicalize URL → `normalized_url` (lowercase host, strip www/tracking, GitHub → `owner/repo`). Lookup before insert; warn on duplicate. Applies to submit, scraper, triage.
2. **Search:** Postgres FTS (`search_vector` + GIN) + `pg_trgm` on name. No separate search service yet. Filters = plain WHERE on indexed columns.
3. **Edits are diffs:** `suggested_edits.diff` holds changed fields only; `base_snapshot` for conflict detection. On approve, compare current value to snapshot — conflict → `needs_rereview`, not blind overwrite.
4. **Reputation:** award on *approved* contributions only; reversals = negative `reputation_events` row; total = `SUM(delta)`.
5. **Webhooks:** enqueue to `webhook_events`; cron/Edge Function dispatches with retries.
6. **Counters:** `upvote_count` etc. maintained by triggers, not client updates.

## Next.js 16 conventions

Before writing routes, read `node_modules/next/dist/docs/01-app/02-guides/{authentication,instant-navigation,rendering-philosophy}.md`.

- `params` / `searchParams` are **Promises** — await them
- Mutations → Server Actions (`'use server'`), not Route Handlers
- Cacheable reads → `'use cache'`; revalidate with tags after mutations
- Instant-nav routes → `export const unstable_instant = { prefetch: 'static' }`
- Two Supabase clients: **anon + user cookie** (RSC/actions, RLS applies) · **service role** (admin/trusted server code only, never browser)
- Session: `@supabase/ssr` cookies; middleware refreshes session; OAuth callback at `/auth/callback`

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only
NEXT_PUBLIC_SITE_URL=        # OAuth redirectTo base
```

## When to read the full docs

| Task involves… | Read |
| -------------- | ---- |
| Schema, RLS, dedup, search, edit conflicts, reputation | `system-design.md` §3–9 |
| What to build next, phase boundaries, dependencies | `task.md` |
| Route map, Server Action contracts (may be outdated) | `CLAUDE.md` — verify against `system-design.md` first |
| UI components | `temp/app/src/components/ui` |

## UPDATE THIS IF SOMETHING CHANGE