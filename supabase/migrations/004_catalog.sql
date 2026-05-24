-- ============================================================
-- Phase 1 — Catalog tables
-- ============================================================

-- tools
create table if not exists public.tools (
  id             uuid        primary key default gen_random_uuid(),
  slug           text        not null unique,
  name           text        not null,
  description    text        not null default '',
  homepage_url   text        not null,
  repo_url       text,
  logo_url       text,
  normalized_url text        not null unique,
  pricing_model  text        not null default 'free'
                             check (pricing_model in ('open_source','freemium','paid','free')),
  deployment     text[]      not null default '{}',
  is_byok        boolean     not null default false,
  has_api        boolean     not null default false,
  submitted_by   uuid        references public.profiles(id) on delete set null,
  is_pinned      boolean     not null default false,
  pin_order      int,
  upvote_count   int         not null default 0,
  search_vector  tsvector,
  updated_at     timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- tags
create table if not exists public.tags (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  slug       text        not null unique,
  type       text        not null default 'community',
  created_at timestamptz not null default now()
);

-- tool_tags
create table if not exists public.tool_tags (
  tool_id uuid not null references public.tools(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (tool_id, tag_id)
);

-- tool_media
create table if not exists public.tool_media (
  id         uuid        primary key default gen_random_uuid(),
  tool_id    uuid        not null references public.tools(id) on delete cascade,
  type       text        not null check (type in ('image','video')),
  url        text        not null,
  added_by   uuid        references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- canonicalize_url
-- ============================================================
create or replace function public.canonicalize_url(url text)
returns text
language plpgsql
immutable
as $$
declare
  v_url text;
  v_scheme text;
  v_host text;
  v_path text;
begin
  v_url := lower(trim(url));

  -- extract scheme (default https)
  if v_url like 'http://%' then
    v_scheme := 'https';
    v_url := substring(v_url from 8);
  elsif v_url like 'https://%' then
    v_scheme := 'https';
    v_url := substring(v_url from 9);
  else
    v_scheme := 'https';
  end if;

  -- strip trailing slash and query string for normalization base
  v_url := regexp_replace(v_url, '[?#].*$', '');
  v_url := rtrim(v_url, '/');

  -- extract host and path
  v_host := split_part(v_url, '/', 1);
  v_path := substring(v_url from length(v_host) + 1);

  -- strip www
  v_host := regexp_replace(v_host, '^www\.', '');

  -- collapse GitHub URLs to owner/repo form
  if v_host = 'github.com' then
    v_path := regexp_replace(v_path, '^(/[^/]+/[^/]+).*$', '\1');
  end if;

  return v_scheme || '://' || v_host || v_path;
end;
$$;

-- ============================================================
-- update_search_vector trigger
-- ============================================================
create or replace function public.update_search_vector()
returns trigger
language plpgsql
as $$
declare
  v_tags text;
begin
  select coalesce(string_agg(t.name, ' '), '')
    into v_tags
    from public.tool_tags tt
    join public.tags t on t.id = tt.tag_id
   where tt.tool_id = new.id;

  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(v_tags, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');

  return new;
end;
$$;

drop trigger if exists tools_search_vector_update on public.tools;
create trigger tools_search_vector_update
  before insert or update on public.tools
  for each row execute function public.update_search_vector();

-- refresh search vector when tags change
create or replace function public.refresh_tool_search_vector()
returns trigger
language plpgsql
as $$
declare
  v_tool_id uuid;
begin
  v_tool_id := coalesce(new.tool_id, old.tool_id);
  update public.tools set updated_at = now() where id = v_tool_id;
  return null;
end;
$$;

drop trigger if exists tool_tags_refresh_vector on public.tool_tags;
create trigger tool_tags_refresh_vector
  after insert or delete on public.tool_tags
  for each row execute function public.refresh_tool_search_vector();

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists tools_search_vector_gin on public.tools using gin(search_vector);
create index if not exists tools_name_trgm on public.tools using gin(name gin_trgm_ops);
create index if not exists tools_upvote_count_idx on public.tools (upvote_count desc);
create index if not exists tools_created_at_idx on public.tools (created_at desc);
