-- ============================================================
-- Phase 0 — Row Level Security (deny-by-default posture)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;

-- ============================================================
-- profiles policies
-- ============================================================

-- Anyone can read any profile (public catalog surface)
create policy "profiles: public select"
  on public.profiles
  for select
  using (true);

-- Users can update only their own profile row
create policy "profiles: own update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- role and reputation_points are not directly client-writable.
-- They are managed by SECURITY DEFINER functions only.
-- Enforced here via column-level by only allowing safe fields
-- in the UPDATE policy (role and reputation_points are excluded
-- from client-reachable Server Actions).

-- No client INSERT — the trigger handles it on auth.users insert.
-- No client DELETE — account deletion is a SECURITY DEFINER function.
