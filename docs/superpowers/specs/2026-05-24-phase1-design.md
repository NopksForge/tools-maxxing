# Phase 1 — Core Catalog Loop: Design Spec

**Date:** 2026-05-24  
**Status:** Approved  
**Scope:** Phase 1 of [task.md](../../../task.md) — the minimum product that delivers value.

---

## 1. Goals & Constraints

Build the core catalog loop: submit → catalog → search → fav/upvote → review/comment → profile → collections. No fast drop, no scraper, no triage queue — those are Phase 2.

**Done when:** users can submit a tool, browse/search the catalog, upvote/favorite, write reviews and comments, and curate collections.

**Out of scope for Phase 1:**
- Fast drop / scrape_jobs
- Triage queue
- Suggested edits
- Reputation events
- Notifications / webhook_events
- Storage file uploads (media stored as URLs only)

---

## 2. Architecture

**Pattern: RSC catalog reads + thin optimistic client shell for social writes.**

- All catalog reads (browse, search, detail, profile, collections) are React Server Components using `'use cache'` with named cache tags.
- Social interactions (upvote, fav, post comment, post review) are thin `'use client'` components using `useOptimistic` for instant feedback, backed by Server Actions. On action settle, the relevant cache tag is revalidated.
- Submit is a multi-step client wizard that calls Server Actions at each step boundary.
- No Supabase JS client on social/submit paths — all Server Actions use the server Supabase client (cookie-based, RLS enforced). The browser Supabase client is used only for auth state.
- Server Actions return `{ error: string } | { data: T }` discriminated unions; errors surface via the existing toast system.

---

## 3. Data Layer

### 3.1 Migrations

**`supabase/migrations/004_catalog.sql`**

Tables:
- `tools` — `id uuid`, `slug text unique`, `name text`, `description text`, `homepage_url text`, `repo_url text`, `logo_url text`, `normalized_url text unique`, `pricing_model text` (check: `open_source|freemium|paid|free`), `deployment text[]`, `is_byok boolean default false`, `has_api boolean default false`, `submitted_by uuid` (FK → profiles), `is_pinned boolean default false`, `pin_order int`, `upvote_count int default 0`, `search_vector tsvector`, `created_at`
- `tags` — `id uuid`, `name text`, `slug text unique`, `type text default 'community'`, `created_at`
- `tool_tags` — `tool_id uuid` (FK → tools), `tag_id uuid` (FK → tags), unique (tool_id, tag_id)
- `tool_media` — `id uuid`, `tool_id uuid` (FK → tools), `type text` (check: `image|video`), `url text`, `added_by uuid` (FK → profiles), `created_at`

Functions & triggers:
- `canonicalize_url(url text) → text` — lowercase host, strip `www.` / trailing slashes / `utm_*` / `ref` / `fbclid`, collapse GitHub to `github.com/owner/repo`
- `update_search_vector()` trigger — fires on `tools` insert/update and `tool_tags` insert/delete; populates `search_vector` from `name` (weight A) + `description` (weight C) + joined tag names (weight B)

Indexes:
- GIN on `tools.search_vector`
- `pg_trgm` trigram index on `tools.name`
- B-tree on `tools.upvote_count desc` (for sort)
- B-tree on `tools.created_at desc` (for sort)

**`supabase/migrations/005_social.sql`**

Tables:
- `upvotes` — `user_id uuid` (FK → profiles), `tool_id uuid` (FK → tools), unique (user_id, tool_id)
- `favorites` — `user_id uuid` (FK → profiles), `tool_id uuid` (FK → tools), unique (user_id, tool_id)
- `reviews` — `id uuid`, `tool_id uuid`, `user_id uuid`, `rating int` (check: 1–5), `body text`, `created_at`; unique (tool_id, user_id) — one review per user per tool
- `comments` — `id uuid`, `tool_id uuid`, `parent_id uuid` (nullable, self-FK for threading), `user_id uuid`, `body text`, `created_at`
- `collections` — `id uuid`, `owner_id uuid` (FK → profiles), `name text`, `slug text unique`, `description text`, `is_public boolean default false`, `created_at`
- `collection_items` — `collection_id uuid` (FK → collections), `tool_id uuid` (FK → tools), `position int`, unique (collection_id, tool_id)

Triggers:
- `maintain_upvote_count()` — fires on `upvotes` insert/delete; increments/decrements `tools.upvote_count`

**`supabase/migrations/006_rls_catalog.sql`**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| tools | everyone (anon) | `auth.uid() is not null` | `auth.uid() = submitted_by` OR role = admin | — |
| tags | everyone | `auth.uid() is not null` | — | — |
| tool_tags | everyone | `auth.uid() is not null` | — | `auth.uid()` submitted the tool |
| tool_media | everyone | `auth.uid() is not null` | — | `auth.uid() = added_by` |
| upvotes | everyone | `auth.uid() = user_id` | — | `auth.uid() = user_id` |
| favorites | everyone | `auth.uid() = user_id` | — | `auth.uid() = user_id` |
| reviews | everyone | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| comments | everyone | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| collections | public rows + own | `auth.uid() = owner_id` | `auth.uid() = owner_id` | `auth.uid() = owner_id` |
| collection_items | via collection policy | owner of parent collection | — | owner of parent collection |

### 3.2 Type Definitions

`lib/supabase/types.ts` — manually extended with `Tool`, `Tag`, `ToolTag`, `ToolMedia`, `Upvote`, `Favorite`, `Review`, `Comment`, `Collection`, `CollectionItem` types matching the above schema.

---

## 4. Routes

Build order: data layer → submit → browse/search/detail → social → identity surfaces.

| Route | Rendering | Cache tag | Notes |
|-------|-----------|-----------|-------|
| `/submit` | Client wizard | — | Member-gated; redirect to `/login` if anon |
| `/browse` | RSC + `'use cache'` | `catalog` | Grid default, left rail filters, list/grid toggle, featured row, sort |
| `/search` | RSC + `'use cache'` | `catalog` | `?q=&pricing=&deployment=&tags=` in URL; left rail filters; applied chips |
| `/tools/[slug]` | RSC + `'use cache'` | `tool-${toolId}` | Header, badges, links, description, tags, media gallery, social client shell |
| `/profile/[username]` | RSC | — | Submitted tools, bio, avatar; own view shows edit link |
| `/collections` | RSC | — | Own collections list; "New collection" action |
| `/collections/[slug]` | RSC | — | Shareable; public if `is_public`; add/remove/reorder for owner |
| `/settings` | Client | — | Connected providers, profile edit; Server Action on save |

---

## 5. Component Architecture

### Catalog (`components/catalog/`)

- **`ToolCard`** — accepts serialized tool props + `upvoted: boolean` + `favorited: boolean`. Renders in `grid` (default) or `list` mode via `variant` prop. Upvote and fav buttons are client sub-components with `useOptimistic`. Clicking as guest shows a login prompt.
- **`ToolCardGrid`** / **`ToolCardList`** — layout wrappers
- **`FilterRail`** — client; reads/writes filter state via URL search params (`useSearchParams` + `router.replace`; no push — filters don't create browser history entries)
- **`SortBar`** — client; same URL-param pattern; shows result count + layout toggle
- **`LayoutToggle`** — client; persists preference to `localStorage`; default = grid
- **`AppliedChips`** — client; renders active filters as dismissible chips

### Social (`components/social/`)

- **`UpvoteButton`** — `useOptimistic` on count + filled state; calls `toggleUpvote` Server Action
- **`FavoriteButton`** — same pattern; calls `toggleFavorite` Server Action
- **`ReviewForm`** — star rating picker + textarea; calls `postReview` Server Action
- **`CommentThread`** — renders threaded comments (max 2 levels); `CommentForm` at root + reply level; calls `postComment` Server Action

### Submit (`components/submit/`)

- **`SubmitWizard`** — manages step state (1 → 2 → success)
- **`StepUrl`** — URL input; on blur/continue calls `checkDuplicate` Server Action; shows non-blocking match warning with link to existing tool
- **`StepDetails`** — name, description, logo URL, pricing radio group, deployment checkboxes, BYOK/API toggles, tag picker with inline create-new; calls `submitTool` Server Action on submit

---

## 6. Server Actions (`lib/actions/`)

| Action | Auth required | What it does |
|--------|--------------|--------------|
| `checkDuplicate(url)` | No | Calls `canonicalize_url`, queries `tools.normalized_url`; returns `{ duplicate: Tool \| null }` |
| `submitTool(data)` | Member | Canonicalizes URL, inserts tool + tool_tags + tool_media rows, revalidates `catalog` tag; returns `{ slug }` |
| `toggleUpvote(toolId)` | Member | Upsert/delete upvote row; revalidates `tool-${slug}` |
| `toggleFavorite(toolId)` | Member | Upsert/delete favorite row |
| `postReview(toolId, rating, body)` | Member | Inserts review (one per user per tool); revalidates `tool-${slug}` |
| `postComment(toolId, parentId?, body)` | Member | Inserts comment; revalidates `tool-${slug}` |
| `updateProfile(username, bio, avatarUrl)` | Own row | Updates `profiles`; validates username uniqueness |
| `createCollection(name, description, isPublic)` | Member | Inserts collection with generated slug |
| `addToCollection(collectionId, toolId)` | Owner | Inserts collection_item at max(position)+1 |
| `removeFromCollection(collectionId, toolId)` | Owner | Deletes collection_item |

---

## 7. Key Implementation Details

### Dedup
`canonicalize_url` is a SQL function — Server Actions call it via `supabase.rpc('canonicalize_url', { url })`. It is the single source of truth: called by `checkDuplicate` at Step 1 and again inside `submitTool` before insert. The `normalized_url unique` constraint is the hard backstop; a duplicate URL returns a user-facing error, not a 500.

### Search
`/search` RSC builds: `search_vector @@ websearch_to_tsquery('english', q)` ranked by `ts_rank`, ANDed with `WHERE` clauses for `pricing_model`, `deployment @>`, `is_byok`, `has_api`. For queries ≤ 3 chars or if FTS returns nothing, fall back to `name % q` (trigram similarity). All filtering is server-side; no client-side data manipulation.

### Filter & sort state
Entirely in URL search params. `FilterRail` and `SortBar` use `router.replace` (not `push`) so filters don't pollute browser history. State is bookmarkable by default.

### Optimistic social
`UpvoteButton` and `FavoriteButton` use `useOptimistic`. On click: state flips instantly, Server Action fires in background, on settle real DB value wins. Guest click shows a login prompt modal; no action fires.

### Cache invalidation

Cache tags use `tool-${toolId}` (not slug) — Server Actions always have `toolId`, looking up slug would add a round-trip.

| Mutation | Revalidates |
|----------|------------|
| `submitTool` | `catalog` |
| `toggleUpvote`, `postReview`, `postComment` | `tool-${toolId}` |
| `toggleFavorite` | nothing — favorites aren't shown on cached pages |
| `updateProfile` | nothing — profile pages are not cached |

---

## 8. Visual Design Decisions

- **Tool card default layout:** Grid tiles; user can toggle to list via `LayoutToggle` (preference persisted in `localStorage`)
- **Filter layout:** Left sidebar rail (matches V2 reference design)
- **Submit form:** Two-step wizard — Step 1: URL + dedup check, Step 2: all other fields
- **Search:** Dedicated `/search` route with URL-param-driven filters; no inline search on browse
- **Media:** Full `tool_media` table (logo + screenshots + video); all stored as URLs, no Storage uploads in Phase 1

Visual source of truth: `reference-design/v2/` — match accent `#389B9B`, Inter + JetBrains Mono, card density, filter chips.
