# Toolsmaxxing — Build Plan (task.md)

Phased, dependency-ordered task split. Each phase is shippable on its own. Reference: `design-system.md`.

Legend: `[ ]` todo · group by phase · indented items are subtasks.

---

## Phase 0 — Foundations

Get the skeleton standing before any feature work.

- [ ] Create Supabase project; enable `pg_trgm` and `pg_net` extensions
- [ ] Initialize Next.js app, wire Supabase client (server + browser)
- [ ] Configure GitHub + Google OAuth providers in Supabase Auth
- [ ] Create `profiles` table + trigger to auto-create a profile row on signup
- [ ] First-run flow: new user picks a username
- [ ] Base RLS posture: deny-by-default, then `SELECT`-for-all on public tables
- [ ] Set up Supabase Storage buckets (logos, media) with access policies
- [ ] Shared UI shell: nav bar, auth slot (guest vs avatar dropdown), toast system
- [ ] Define the global empty / loading / error state patterns

**Done when:** a user can log in with GitHub/Google, gets a profile, and sees an empty shell.

---

## Phase 1 — Core catalog loop (V1)

The minimum product that delivers value. No community machinery yet.

### Data
- [ ] `tools` table (incl. `pricing_model`, `deployment[]`, `is_byok`, `has_api`, `normalized_url`, `search_vector`)
- [ ] `tags` + `tool_tags`
- [ ] `tool_media`
- [ ] URL canonicalization function + unique `normalized_url` (dedup, §6 of design)
- [ ] `search_vector` trigger + GIN index + `pg_trgm` index on name
- [ ] RLS: tools/tags/media readable by all; insert by authed users; update by submitter/admin

### Submit & fast drop
- [ ] **Submit a tool** form (member-gated): name, URLs, description, logo, strict pricing/deployment/access selectors, tag picker with "create new tag"
- [ ] Inline duplicate-detection warning on URL entry
- [ ] Media upload (images/video) into Storage
- [ ] **Fast drop** lightweight intake (paste URL → instant confirm). Initial version may just create a `tools` draft or a `scrape_jobs` row processed minimally

### Browse, search, detail
- [ ] **Tool card** component (the most-reused UI — build it well)
- [ ] **Home / Browse** page: featured row, feed, sort (newest/upvoted/trending)
- [ ] Filter controls: pricing / deployment / access (strict) + secondary tag filter
- [ ] **Search results** page (name + tags + description, fuzzy), applied-filter chips, no-results state
- [ ] **Tool detail** page: header, badges, links, description, tags, media gallery/lightbox

### Social basics
- [ ] `upvotes` + `favorites` tables; trigger to maintain `upvote_count`
- [ ] Upvote + favorite buttons (guest → login prompt)
- [ ] `reviews` (rating + body) and `comments` (threaded) tables + RLS
- [ ] Reviews and comments UI on the tool detail page

### Identity surfaces
- [ ] **Profile** page (own vs others' view): submitted tools, basic info
- [ ] **Collections**: tables (`collections`, `collection_items`) + list view + single shareable view + add/remove/reorder
- [ ] **Settings** page: connected providers, profile edit, account

**Done when:** users can submit, browse, search, filter, favorite, upvote, review, comment, and curate collections.

---

## Phase 2 — Curation machinery (Later)

Layer this once Phase 1 has real usage and you can see the bottleneck.

### Reputation
- [ ] `reputation_events` append-only log + derived total + rebuild function
- [ ] Award on *approved* contributions only; reversible via negative deltas
- [ ] Reputation display on profiles
- [ ] Role escalation: member → trusted at threshold (or admin-granted)

### Scraper pipeline
- [ ] `scrape_jobs` table + statuses
- [ ] Scraper **Edge Function**: fetch, parse draft, dedup-and-create OR push to triage
- [ ] `pg_cron` polling (or DB-webhook trigger) to run the worker
- [ ] Upgrade Fast Drop to feed the real scrape pipeline

### Triage queue ("Review Box")
- [ ] `triage_queue` table + RLS gated to trusted/admin
- [ ] Triage workspace: list, claim/unclaim (collision-safe), cleanup form, publish/reject
- [ ] Gamified framing: points per published item, progress, optional leaderboard
- [ ] Locked-state view for members who haven't earned access

### Suggested edits ("Pull Requests")
- [ ] `suggested_edits` table (field-level `diff` + `base_snapshot`)
- [ ] Submit-an-edit UI from tool detail (before/after diff presentation)
- [ ] Author review UI: pending edits, Approve/Reject
- [ ] Conflict-safe approve function (`needs_rereview` when base changed, §8 of design)
- [ ] Reputation award on approved edit

**Done when:** the community can clean unparsed links and propose/approve edits safely.

---

## Phase 3 — Automation & admin (Later)

### Notifications
- [ ] `notifications` table + triggers (edit approved, tool pinned, new review, rep earned)
- [ ] Bell indicator + panel/page, read/unread, mark-all-read

### External alerts
- [ ] `webhook_events` outbox table
- [ ] Triggers enqueue on pin and on upvote-threshold crossing
- [ ] `pg_cron` dispatcher → Discord/Telegram via `pg_net`, with retries/attempts

### Admin
- [ ] Admin dashboard: pin/unpin + pin order, role management, content moderation
- [ ] Featured/pinned treatment surfaced on Browse and detail pages

**Done when:** admins can curate and the community Discord/Telegram gets automated alerts.

---

## Phase 4 — Hardening (ongoing)

- [ ] Audit every table's RLS policies against the role matrix (§5 of design)
- [ ] Lock `role` / `reputation_points` against direct client writes
- [ ] Rate-limit fast drop and submit to deter point/spam farming
- [ ] Consider JWT custom-claims hook for role/reputation if RLS subqueries get slow
- [ ] Mobile/responsive pass (decide desktop-first vs mobile-first early)
- [ ] Backfill/repair job for `normalized_url` and reputation totals

---

## Critical-path dependencies (don't reorder these)

1. **Auth + profiles** before anything member-gated.
2. **Dedup (`normalized_url`)** before any tool-creation path (submit, scrape, triage) — it's painful to add later.
3. **`tools` + RLS** before Browse/Search/Detail.
4. **Reputation log** before triage gating and edit rewards.
5. **`suggested_edits` diff + base_snapshot** before the approve flow — the conflict safety depends on the schema.
6. **`webhook_events` outbox** before wiring Discord/Telegram — never fire webhooks inline.

## Suggested first milestone

Phase 0 + Phase 1 = a genuinely useful product. Get it in front of users, collect real tools, and let the data tell you whether Phase 2's triage queue is urgent or optional.