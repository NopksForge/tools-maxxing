@AGENTS.md

# Toolmaxxing — System Design

> Status: design only. No implementation yet. Reference UI lives in `temp/app/` (Vite + shadcn) and is being ported to Next.js 16 App Router. The reference's MySQL/Drizzle/tRPC stack is **not** what we're building — we're going Next.js + Supabase.

---

## 1. Product summary

A discovery archive for AI tools. Anyone can browse and search; signed-in users can submit, upvote, bookmark, review, and comment. Submissions are auto-published (no approval queue). Only the admin (me) can delete tools.

### Core features
- **Browse / search**: full-text search on `name`, `description`, `tags`.
- **Filter**: by tag, by pricing, by category.
- **Auth**: OAuth via GitHub and Google (Supabase Auth).
- **Submit**: signed-in users post tools; published immediately.
- **Engage**: upvote, bookmark, review (1–5 + text), comment.
- **Admin**: delete any tool/comment/review (role = `admin`).

---

## 2. Tech stack

| Layer        | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 16 (App Router, RSC, Server Actions), React 19                 |
| Styling      | Tailwind v4 + shadcn/ui (port the components already in `temp/app/src/components/ui`) |
| Auth         | Supabase Auth — OAuth providers: GitHub, Google                        |
| Database     | Supabase Postgres                                                      |
| File storage | Supabase Storage (tool logos, screenshots, avatars)                    |
| Realtime     | Supabase Realtime (optional v2 — live vote/comment counts)             |
| Hosting      | Vercel (frontend) + Supabase managed (backend)                         |

> **Heed `AGENTS.md`**: this is Next.js 16. Read `node_modules/next/dist/docs/01-app/02-guides/{authentication,instant-navigation,rendering-philosophy}.md` before writing any route — `params` is a Promise, mutations go through Server Actions, cacheable reads use `'use cache'`, instantly-navigable routes export `unstable_instant`.

---

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (RSC + RCC)                     │
└──────────────┬──────────────────────────────────┬───────────────┘
               │ HTML / streamed RSC payload      │ Server Action POST
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js 16 (Vercel)                            │
│  app/                                                           │
│  ├─ (public)/         RSC reads via Supabase server client      │
│  ├─ (auth)/           login + OAuth callback                    │
│  ├─ (app)/            authed routes (submit, profile, bookmarks)│
│  ├─ admin/            role=admin only                           │
│  └─ actions/          'use server' mutations                    │
└──────────────┬──────────────────────────────────┬───────────────┘
               │ supabase-js (server, RLS as user)│ supabase-js (service role, server-only)
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                │
│  • Auth (GitHub, Google OAuth → JWT in HTTP-only cookie)        │
│  • Postgres (RLS on every table)                                │
│  • Storage buckets: tool-logos, tool-screenshots, avatars       │
│  • Edge Functions (optional: trending recompute cron)           │
└─────────────────────────────────────────────────────────────────┘
```

Two Supabase clients on the server:
- **anon client (with user cookie)** — used in RSC and Server Actions; RLS enforces who can read/write what.
- **service-role client** — used only in `actions/admin.ts` and trusted server code (e.g., denormalized counter updates). Never exposed to the browser.

---

## 4. Authentication

Use `@supabase/ssr` for cookie-based sessions that work across RSC, Route Handlers, and Server Actions.

### Flow
1. User clicks "Sign in with GitHub/Google" on `/login`.
2. Server Action calls `supabase.auth.signInWithOAuth({ provider, redirectTo: '/auth/callback' })` and returns the provider URL.
3. Provider redirects to `/auth/callback?code=...`.
4. Route Handler at `app/auth/callback/route.ts` exchanges the code for a session, sets cookies, redirects to `next` param (default `/`).
5. `middleware.ts` refreshes the session cookie on every request.

### Profile bootstrap
A Postgres trigger on `auth.users` insert creates a row in `public.profiles` (id = auth user id, role = `'user'`, name/avatar from OAuth metadata). My account is upgraded to `role = 'admin'` once via SQL.

### Authorization
- **Page guards**: RSC layouts under `(app)/` and `admin/` call `getUser()` server-side; redirect if missing or wrong role.
- **Data guards**: RLS on every table (see §6). Server Actions never trust client input for `user_id` — always read from session.

---

## 5. Data model (Postgres)

```
profiles
  id              uuid PK  → auth.users.id
  username        text unique
  display_name    text
  avatar_url      text
  role            text  default 'user'   -- 'user' | 'admin'
  created_at      timestamptz default now()

categories
  id              bigserial PK
  name            text unique
  slug            text unique
  description     text
  icon            text
  sort_order      int default 0

tags
  id              bigserial PK
  name            text unique
  slug            text unique

tools
  id              bigserial PK
  slug            text unique
  name            text
  description     text                       -- long
  short_description text                     -- card preview
  website_url     text
  logo_path       text                       -- Supabase Storage object path
  pricing         text                       -- 'free' | 'freemium' | 'paid' | 'enterprise'
  category_id     bigint → categories.id
  submitter_id    uuid   → profiles.id
  upvote_count    int default 0              -- denormalized; trigger-maintained
  bookmark_count  int default 0
  review_count    int default 0
  avg_rating      numeric(3,2)
  view_count      int default 0
  featured        boolean default false
  search_tsv      tsvector                   -- generated; GIN-indexed
  created_at      timestamptz default now()
  updated_at      timestamptz default now()

tool_tags                                     -- M:N
  tool_id  bigint → tools.id ON DELETE CASCADE
  tag_id   bigint → tags.id  ON DELETE CASCADE
  PK (tool_id, tag_id)

tool_screenshots
  id          bigserial PK
  tool_id     bigint → tools.id ON DELETE CASCADE
  image_path  text
  caption     text
  sort_order  int

votes
  tool_id  bigint → tools.id ON DELETE CASCADE
  user_id  uuid   → profiles.id ON DELETE CASCADE
  created_at timestamptz default now()
  PK (tool_id, user_id)

bookmarks
  tool_id  bigint → tools.id ON DELETE CASCADE
  user_id  uuid   → profiles.id ON DELETE CASCADE
  created_at timestamptz default now()
  PK (tool_id, user_id)

reviews
  id        bigserial PK
  tool_id   bigint → tools.id ON DELETE CASCADE
  user_id   uuid   → profiles.id ON DELETE CASCADE
  rating    int CHECK (rating BETWEEN 1 AND 5)
  content   text
  created_at timestamptz default now()
  UNIQUE (tool_id, user_id)

comments
  id         bigserial PK
  tool_id    bigint → tools.id ON DELETE CASCADE
  user_id    uuid   → profiles.id ON DELETE CASCADE
  parent_id  bigint → comments.id ON DELETE CASCADE   -- threading (nullable)
  content    text
  created_at timestamptz default now()
```

### Notes / decisions
- **One user table.** Drop the reference's split between `users` / `local_users` — Supabase Auth handles credentials, `profiles` mirrors it.
- **Denormalized counters** on `tools` (`upvote_count`, etc.) updated by Postgres triggers on insert/delete in `votes`/`bookmarks`/`reviews`. Keeps card lists cheap.
- **Full-text search** via a generated `search_tsv` column: `to_tsvector('english', name || ' ' || coalesce(short_description,'') || ' ' || description)`. GIN index. Tag names joined into the query at search time.
- **No approval queue.** Skip the `status` enum entirely. Admin delete is the moderation tool.
- **Storage paths** are stored, not URLs. We resolve to a signed/public URL at render time so we can rotate buckets later.

---

## 6. Row-Level Security (RLS)

Enable RLS on every table. Sketch:

| Table        | SELECT                  | INSERT                                  | UPDATE                                                    | DELETE                                  |
| ------------ | ----------------------- | --------------------------------------- | --------------------------------------------------------- | --------------------------------------- |
| `profiles`   | public                  | auto via trigger                        | self only                                                 | self or admin                           |
| `tools`      | public                  | authenticated (`submitter_id = auth.uid()`) | submitter (limited cols) or admin                     | admin only                              |
| `tool_tags`  | public                  | tool's submitter or admin               | —                                                         | tool's submitter or admin               |
| `tool_screenshots` | public            | tool's submitter or admin               | tool's submitter or admin                                 | tool's submitter or admin               |
| `votes`      | public (counts only via tools) | authenticated (`user_id = auth.uid()`) | —                                            | self                                    |
| `bookmarks`  | self only               | authenticated (`user_id = auth.uid()`)  | —                                                         | self                                    |
| `reviews`    | public                  | authenticated (`user_id = auth.uid()`)  | self                                                      | self or admin                           |
| `comments`   | public                  | authenticated (`user_id = auth.uid()`)  | self                                                      | self or admin                           |
| `categories` / `tags` | public         | admin                                   | admin                                                     | admin                                   |

Admin check: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` — wrap in a `SECURITY DEFINER` function `is_admin()` to keep policies readable.

---

## 7. Route map (App Router)

```
app/
├─ layout.tsx                      # root, theme, fonts
├─ middleware.ts                   # session cookie refresh
├─ (public)/
│  ├─ page.tsx                     # / — home: featured + trending tools
│  ├─ tools/
│  │  ├─ page.tsx                  # /tools — list + search + filter
│  │  └─ [slug]/page.tsx           # /tools/:slug — tool detail
│  └─ tags/[slug]/page.tsx         # /tags/:slug — tools by tag
├─ (auth)/
│  ├─ login/page.tsx               # /login — OAuth buttons
│  └─ auth/callback/route.ts       # OAuth code exchange (Route Handler)
├─ (app)/                          # requires session
│  ├─ submit/page.tsx              # /submit
│  ├─ bookmarks/page.tsx           # /bookmarks
│  └─ profile/[username]/page.tsx  # /profile/:username
├─ admin/
│  └─ tools/page.tsx               # admin moderation table
└─ actions/                        # 'use server' modules
   ├─ auth.ts                      # signInWithOAuth, signOut
   ├─ tools.ts                     # submitTool, updateTool
   ├─ engagement.ts                # toggleVote, toggleBookmark, addReview, addComment
   └─ admin.ts                     # deleteTool, deleteComment, deleteReview
```

### Caching & navigation
- `/` and `/tools/[slug]` export `unstable_instant = { prefetch: 'static' }`. Tool details cached with `'use cache'`; live counters streamed in a child Suspense boundary so cards render instantly.
- `/tools` is dynamic (search/filter params) — no `'use cache'` on the search results component, but the header/filter shell can cache.
- Server Actions call `revalidateTag('tool:'+slug)` and `revalidateTag('tools:list')` after mutations.

---

## 8. Server Actions — contracts

All inputs validated with Zod; all read `auth.uid()` from the session, never trust client.

```
submitTool({ name, websiteUrl, shortDescription, description,
             pricing, categoryId, tagIds[], logo: File?, screenshots: File[] })
  → { slug } | { error }

toggleVote({ toolId })       → { voted: boolean, count: number }
toggleBookmark({ toolId })   → { bookmarked: boolean }
addReview({ toolId, rating, content }) → { reviewId }
addComment({ toolId, content, parentId? }) → { commentId }

admin.deleteTool({ toolId })       → { ok }    -- service-role client
admin.deleteComment({ commentId }) → { ok }
```

Logo/screenshot uploads: upload to Supabase Storage from the Server Action using the user's session client; store the returned object path in `tools.logo_path` / `tool_screenshots.image_path`.

---

## 9. Search & filter

- Endpoint: `GET /tools?q=...&tag=ai-coding&pricing=free&sort=top` — read in the RSC, not a JSON API.
- Query: `WHERE search_tsv @@ websearch_to_tsquery('english', $q)` joined with `tool_tags` for tag filters.
- Sort options: `top` (upvote_count desc), `new` (created_at desc), `trending` (upvote_count over last 7d — materialized view refreshed hourly via Supabase cron).
- Pagination: keyset (`(upvote_count, id) < (last_upvote, last_id)`), 24/page.
- Tag filter UI is hydrated from `tags` (cached `'use cache'`, revalidated on tag mutations).

---

## 10. Storage layout

```
tool-logos/       {tool_id}/logo.{ext}           public bucket
tool-screenshots/ {tool_id}/{n}.{ext}            public bucket
avatars/          {user_id}/avatar.{ext}         public bucket
```

Storage RLS: insert/update/delete restricted to the owning user (or admin). Public read.

---

## 11. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only; admin actions
NEXT_PUBLIC_SITE_URL=             # for OAuth redirectTo
```

OAuth: configure GitHub + Google providers in the Supabase dashboard with redirect `https://<site>/auth/callback`.

---

## 12. Open questions / v2

- **Email/password auth** — out of scope for v1 (OAuth only).
- **Comment threading depth** — flat or 1-level nesting? Schema supports tree but UI may cap at 1.
- **Spam** — no captcha v1; rely on auth + admin delete. Add hCaptcha if it gets bad.
- **Trending algo** — start with 7-day upvote count, revisit (decay function, view weighting).
- **AI summaries** (the `aiTrendingSummaries` table from the reference) — defer until there's traffic worth summarizing.
- **Realtime** — defer; revalidation after Server Actions is enough for v1.

---

## 13. Build order (suggested)

1. Supabase project + schema + RLS + OAuth providers.
2. Next.js scaffold: `lib/supabase/{server,client,middleware}.ts`, root layout, `middleware.ts`.
3. `/login` + `/auth/callback` — verify session round-trip.
4. `/tools` list (read-only, no search) — proves RSC + Supabase read path.
5. `/tools/[slug]` detail + `submitTool` action + `/submit` form.
6. Engagement actions (vote, bookmark, review, comment) + denormalized counter triggers.
7. Search + tag filter.
8. Admin delete.
9. Polish: instant navigation, caching tags, storage uploads.
