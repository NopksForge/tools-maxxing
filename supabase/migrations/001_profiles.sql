-- ============================================================
-- Phase 0 — Identity
-- Run in Supabase SQL editor (or via supabase db push)
-- ============================================================

-- Enable required extensions
create extension if not exists "pg_trgm";
-- pg_net is enabled via Supabase dashboard Extensions tab (requires elevated perms)

-- ============================================================
-- profiles — 1:1 with auth.users
-- ============================================================
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  username        text        unique,
  avatar_url      text,
  bio             text,
  reputation_points int       not null default 0,
  role            text        not null default 'member'
                              check (role in ('member', 'trusted', 'admin')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Trigger: auto-create profile row on new user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
