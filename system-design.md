# Toolsmaxxing — System Design

A community-curated catalog of AI tools (GitHub repos, hosted products like Heygen, local LLM models). Users discover, submit, review, and curate tools; the community helps clean and maintain the catalog.

**Stack:** Next.js (frontend) · Supabase (Postgres + Auth + Storage + Edge Functions) · Postgres full-text search · Discord/Telegram webhooks for alerts.

---

## 1. Core mental model

Almost every feature reduces to one of three things acting on a **tool entry**:

1. **A tool entry** — the canonical record everyone sees.
2. **A contribution** to a tool entry — scrape, submit, triage cleanup, suggested edit.
3. **A social signal** on a tool entry — fav, upvote, comment, review, collection.

Keeping these three concerns separated in the schema is the single most important design decision. The trap to avoid: letting "scraped raw link," "user submission," and "published tool" share one table with a `status` column. It works at first and rots fast. Raw intake and the published catalog are different lifecycles and live in different tables.

---

## 2. Architecture overview

```
┌─────────────┐     ┌──────────────────────────────┐     ┌─────────────┐
│   Next.js   │────▶│          Supabase            │     │  Discord /  │
│  frontend   │     │                              │     │  Telegram   │
│             │◀────│  Postgres (RLS enforced)     │     └─────────────┘
└─────────────┘     │  Auth (GitHub/Google OAuth)  │            ▲
                    │  Storage (logos/media)       │            │
                    │  Edge Functions (workers)    │────────────┘
                    │  pg_cron + pg_net (schedule) │   webhook dispatch
                    └──────────────────────────────┘
```

**Intake** (fast drop, manual submit) → **Pipeline** (scrape_jobs, triage_queue, suggested_edits) → **Catalog** (tools). A **social layer** and **identity layer** wrap the catalog, and an **automation layer** fires external alerts.

Security boundary is **Row Level Security in Postgres**, not Next.js. Treat frontend permission checks as UX (hiding buttons); RLS is the actual wall.

---

## 3. Data model

Grouped by concern. Types are Postgres. `id` is `uuid default gen_random_uuid()` and `created_at timestamptz default now()` unless stated.

### 3.1 Identity & reputation

**profiles** — extends `auth.users` (1:1, shares the auth user id).
- `id uuid` (FK → auth.users.id, primary key)
- `username text unique`
- `avatar_url text`
- `bio text`
- `reputation_points int default 0` (denormalized cache; source of truth is the log below)
- `role text default 'member'` — enum-like: `member | trusted | admin` (guests are simply unauthenticated)
- `created_at`

**reputation_events** — append-only log. Never store only a running total.
- `id`, `user_id` (FK → profiles)
- `delta int` — positive or negative
- `reason text` — `edit_approved | triage_published | tool_submitted | approval_reverted | ...`
- `source_type text`, `source_id uuid` — what triggered it (a tool, an edit, etc.)
- `created_at`

`reputation_points` is recomputed as `SUM(delta)` and can be rebuilt from the log at any time.

### 3.2 Catalog (canonical, public-facing)

**tools** — the published record. The only table guests read heavily.
- `id`, `slug text unique`
- `name text`, `description text`
- `homepage_url text`, `repo_url text`, `logo_url text`
- `normalized_url text unique` — canonicalized homepage/repo URL, the dedup key (see §6)
- `pricing_model text` — `open_source | freemium | paid | free`
- `deployment text[]` — any of `local | cloud | hybrid`
- `is_byok boolean default false`
- `has_api boolean default false`
- `submitted_by uuid` (FK → profiles)
- `is_pinned boolean default false`, `pin_order int`
- `upvote_count int default 0` — denormalized cache, maintained by trigger
- `search_vector tsvector` — generated/maintained for full-text search (see §7)
- `created_at`

**Why pricing/deployment are columns, not tags:** if these live in a freeform tag table, someone creates "open-source", "OpenSource", and "FOSS" and the filters fragment. They are the product's signature feature and must stay a strict controlled vocabulary. Note the axes are independent — a tool can be Open Source *and* Local *and* API-Available simultaneously — so they're separate columns, not one dropdown.

**tags** — community vocabulary.
- `id`, `name text`, `slug text unique`
- `type text` — `community` (freeform) vs reserved/system if ever needed

**tool_tags** — join. `tool_id`, `tag_id`, unique together.

**tool_media** — images/videos showing usage.
- `id`, `tool_id` (FK), `type text` (`image | video`), `url text`, `added_by uuid`, `created_at`
- Files live in Supabase Storage; this row holds the reference.

### 3.3 Contribution pipeline

**scrape_jobs** — fast-drop and background scraping intake.
- `id`, `source_url text`, `submitted_by uuid`
- `status text` — `pending | parsing | parsed | failed`
- `raw_payload jsonb` — whatever the scraper fetched
- `parsed_draft jsonb` — structured draft the worker produced
- `created_at`, `processed_at`

Fast drop writes a `pending` row and returns instantly. A background worker picks it up.

**triage_queue** — items the scraper couldn't parse cleanly ("the Review Box").
- `id`, `scrape_job_id uuid` (FK, nullable)
- `raw_url text`, `raw_payload jsonb`
- `claimed_by uuid` (nullable — who's working it now)
- `claimed_at timestamptz`
- `status text` — `open | claimed | resolved | rejected`
- `resolved_tool_id uuid` (FK → tools, set when published)
- `created_at`

A Trusted user claims an item, cleans it into a `tools` row, and the queue item flips to `resolved`.

**suggested_edits** — Git-PR-style community edits.
- `id`, `tool_id` (FK), `suggested_by uuid`
- `diff jsonb` — **field-level** changes only, e.g. `{"description": "new text", "tags": [...]}`. NOT a full copy of the tool.
- `base_snapshot jsonb` — the values of the changed fields *at the time the edit was created* (for conflict detection)
- `status text` — `open | approved | rejected | needs_rereview`
- `reviewed_by uuid`, `reviewed_at`
- `created_at`

Storing a diff (not a full copy) is what lets two pending edits to the same tool not clobber each other. See §8.

### 3.4 Social layer

**upvotes** — `user_id`, `tool_id`, unique together. Trigger maintains `tools.upvote_count`.

**favorites** — `user_id`, `tool_id`, unique together.

**reviews** — long-form "how I use this tool."
- `id`, `tool_id`, `user_id`, `rating int`, `body text`, `created_at`

**comments** — lighter threaded discussion, separate from reviews.
- `id`, `tool_id`, `parent_id uuid` (nullable, self-FK for threading), `user_id`, `body text`, `created_at`

**collections** — shareable groupings.
- `id`, `owner_id`, `name text`, `slug text`, `description text`, `is_public boolean default false`, `created_at`

**collection_items** — `collection_id`, `tool_id`, `position int`, unique (collection_id, tool_id).

### 3.5 Automation

**notifications** — in-app.
- `id`, `user_id`, `type text` (`edit_approved | tool_pinned | new_review | reputation_earned | ...`)
- `payload jsonb`, `read boolean default false`, `created_at`

**webhook_events** — outbox pattern for external alerts.
- `id`, `event_type text` (`tool_pinned | upvote_threshold_crossed`), `payload jsonb`
- `delivered_at timestamptz` (null until sent), `attempts int default 0`, `created_at`

Using an outbox table instead of firing webhooks inline means a Discord outage doesn't break the app, and you get retries for free.

---

## 4. Auth & roles

OAuth-only via GitHub + Google. No password flow.

| Role | How obtained | Can do |
|------|-------------|--------|
| **Guest** (anon) | not logged in | Read catalog, tags, reviews, comments, public collections. Search. Nothing else. |
| **Member** | any successful OAuth login | Fast-drop, submit, fav, upvote, comment, review, create collections, suggest edits. |
| **Trusted** | reputation ≥ threshold, or admin-granted | Everything Member can, plus work the triage queue and publish. |
| **Admin** | manually granted | Pin tools, manage roles, moderate, full access. |

**Role storage:** `role` lives on `profiles`. Simplest first version: RLS policies check role via a subquery on `profiles`. Performance-optimized later version: inject `role`/`reputation` into the JWT via a Supabase **custom access token hook**, so policies read the claim directly without a per-row subquery. Build the subquery version first; refactor only if it becomes a bottleneck.

---

## 5. Row Level Security (the actual security boundary)

Every table gets policies. Principles:

- **tools, tags, tool_tags, tool_media, reviews, comments, public collections** — `SELECT` allowed for everyone including `anon`.
- **Writes to social tables** (upvotes, favorites, reviews, comments) — `INSERT/UPDATE/DELETE` only where `auth.uid() = user_id`, i.e. you can only act as yourself.
- **tools** — `INSERT` by any authenticated user (submit); `UPDATE` only by `submitted_by` or admin (and via the approved-edit path). `is_pinned`/`pin_order` writable by admin only.
- **triage_queue** — `SELECT`/`UPDATE` gated to `role IN ('trusted','admin')`.
- **suggested_edits** — `INSERT` by any member; `UPDATE` (approve/reject) only by the target tool's `submitted_by` or admin.
- **reputation_events, webhook_events** — no client writes at all; written only by SECURITY DEFINER functions / workers.
- **profiles** — `SELECT` public; `UPDATE` only own row, and `role`/`reputation_points` columns not directly client-writable (lock via column-level policy or a SECURITY DEFINER function).

Rule of thumb: anything that grants power or points must be written by a trusted server-side function, never by the client directly.

---

## 6. Deduplication (build this from day one)

Fast-drop + manual-submit + triage means the *same tool* (e.g. Heygen) gets entered multiple ways. Without dedup, the catalog fills with duplicate entries and upvote counts split across them. Retrofitting dedup onto a polluted catalog is miserable.

**Canonicalization function** runs before any tool is created:
1. Lowercase the host.
2. Strip `www.`, trailing slashes, and tracking params (`utm_*`, `ref`, `fbclid`, etc.).
3. For GitHub URLs, reduce to `github.com/owner/repo`.
4. Produce `normalized_url`.

`tools.normalized_url` is `unique`. On submit/publish, look up by `normalized_url` first. If found, surface "this tool may already exist → [link]" instead of inserting. Applies equally to the manual Submit form, the scraper worker, and triage publishing.

---

## 7. Search

Postgres full-text search is sufficient at this scale — do not add a separate search service yet.

- `tools.search_vector tsvector`, populated from `name` (weight A) + `tags` (weight B) + `description` (weight C), maintained by a trigger on insert/update of tools and tool_tags.
- GIN index on `search_vector`.
- Add the `pg_trgm` extension and a trigram index on `name` for typo-tolerant / fuzzy matching.
- Filters (pricing, deployment, BYOK, API) are plain `WHERE` clauses on the indexed columns — they compose cleanly with the text query.

Only consider Typesense/Meilisearch if you genuinely outgrow this. Most catalogs never do.

---

## 8. The PR-style edit flow (conflict-safe)

The naive "approve overwrites the main entry" has a trap: if two people edit the same tool and the author approves both, the second approval can silently revert the first or apply to a field that no longer exists.

**Flow:**
1. User opens an edit on a tool. We snapshot the current values of the fields they're changing into `base_snapshot`, and store only the changed fields in `diff`.
2. Author sees pending edits as a list of diffs with Approve/Reject.
3. **On Approve**, a SECURITY DEFINER function checks: for each field in the diff, does the tool's *current* value still equal `base_snapshot`'s value?
   - If yes → apply the diff, mark `approved`, award reputation to the suggester via `reputation_events`.
   - If no (the field changed since the edit was created) → mark the edit `needs_rereview` and surface a conflict warning instead of blindly overwriting.

This keeps edits safe under concurrency and gives the author honest information.

---

## 9. Reputation (anti-gaming)

The moment points unlock triage powers, people farm them. Defenses:

- **Award on *approved* contributions, not submitted ones.** Submitting a tool or an edit earns nothing until it's accepted/approved.
- **Approvals are reversible.** Reverting an approval inserts a *negative* `reputation_events` row (`reason: approval_reverted`) — which is exactly why the log is append-only and the total is derived, never edited in place.
- Reputation total is always `SUM(delta)` over the log; the cache on `profiles` is rebuildable.

---

## 10. Background jobs (Supabase-native, no separate server)

**Scraper worker** — a Supabase **Edge Function**. Triggered either by `pg_cron` polling for `pending` scrape_jobs, or by a DB webhook on insert. It fetches the URL, attempts to parse a tool draft, and either:
- writes a clean `parsed_draft` and creates a deduped `tools` row, or
- on failure, pushes the item into `triage_queue` for human cleanup.

**Webhook dispatcher** — a `pg_cron` job (every minute) reads undelivered `webhook_events`, POSTs each to Discord/Telegram via `pg_net` (or an Edge Function), increments `attempts`, and sets `delivered_at` on success. Failed ones retry next tick.

**Event producers** — DB triggers enqueue `webhook_events`:
- on `tools.is_pinned` flipping true → `tool_pinned`
- on `upvote_count` crossing a configured threshold → `upvote_threshold_crossed`
Triggers also enqueue in-app `notifications` (edit approved, tool pinned, new review on your tool, reputation earned).

---

## 11. Scope guidance

Ship the **core loop first**: submit → catalog → search → fav/upvote → profile → comment/review. Get real tools and real users in. *Then* layer the curation machinery (triage queue, reputation gating, PR-style edits) once you know where the real bottleneck is. You can't know whether the triage queue is essential or unnecessary until tools are actually flowing — that depends entirely on how good the scraper turns out to be.

See `task.md` for the phased build plan.