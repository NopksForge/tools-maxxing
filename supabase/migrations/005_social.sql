-- ============================================================
-- Phase 1 — Social tables
-- ============================================================

create table if not exists public.upvotes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

create table if not exists public.reviews (
  id         uuid        primary key default gen_random_uuid(),
  tool_id    uuid        not null references public.tools(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  rating     int         not null check (rating between 1 and 5),
  body       text        not null default '',
  created_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

create table if not exists public.comments (
  id         uuid        primary key default gen_random_uuid(),
  tool_id    uuid        not null references public.tools(id) on delete cascade,
  parent_id  uuid        references public.comments(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  body       text        not null,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references public.profiles(id) on delete cascade,
  name        text        not null,
  slug        text        not null unique,
  description text        not null default '',
  is_public   boolean     not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  tool_id       uuid not null references public.tools(id) on delete cascade,
  position      int  not null default 0,
  primary key (collection_id, tool_id)
);

-- ============================================================
-- maintain_upvote_count trigger
-- ============================================================
create or replace function public.maintain_upvote_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.tools set upvote_count = upvote_count + 1 where id = new.tool_id;
  elsif tg_op = 'DELETE' then
    update public.tools set upvote_count = greatest(0, upvote_count - 1) where id = old.tool_id;
  end if;
  return null;
end;
$$;

drop trigger if exists maintain_upvote_count on public.upvotes;
create trigger maintain_upvote_count
  after insert or delete on public.upvotes
  for each row execute function public.maintain_upvote_count();
