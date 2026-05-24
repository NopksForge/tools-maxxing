-- ============================================================
-- Phase 1 — RLS for catalog and social tables
-- ============================================================

-- tools
alter table public.tools enable row level security;
create policy "tools_select_all" on public.tools for select using (true);
create policy "tools_insert_auth" on public.tools for insert with check (auth.uid() is not null);
-- submitters can update non-pin fields on their own tool
create policy "tools_update_owner" on public.tools for update
  using (auth.uid() = submitted_by)
  with check (
    is_pinned = (select is_pinned from public.tools where id = tools.id) and
    pin_order is not distinct from (select pin_order from public.tools where id = tools.id)
  );

-- admins can update anything including pin fields
create policy "tools_update_admin" on public.tools for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- tags
alter table public.tags enable row level security;
create policy "tags_select_all" on public.tags for select using (true);
create policy "tags_insert_auth" on public.tags for insert with check (auth.uid() is not null);

-- tool_tags
alter table public.tool_tags enable row level security;
create policy "tool_tags_select_all" on public.tool_tags for select using (true);
create policy "tool_tags_insert_auth" on public.tool_tags for insert with check (auth.uid() is not null);
create policy "tool_tags_delete_submitter" on public.tool_tags for delete
  using (auth.uid() = (select submitted_by from public.tools where id = tool_id));

-- tool_media
alter table public.tool_media enable row level security;
create policy "tool_media_select_all" on public.tool_media for select using (true);
create policy "tool_media_insert_auth" on public.tool_media for insert with check (auth.uid() is not null);
create policy "tool_media_delete_owner" on public.tool_media for delete using (auth.uid() = added_by);

-- upvotes
alter table public.upvotes enable row level security;
create policy "upvotes_select_all" on public.upvotes for select using (true);
create policy "upvotes_insert_own" on public.upvotes for insert with check (auth.uid() = user_id);
create policy "upvotes_delete_own" on public.upvotes for delete using (auth.uid() = user_id);

-- favorites
alter table public.favorites enable row level security;
create policy "favorites_select_all" on public.favorites for select using (true);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);

-- reviews
alter table public.reviews enable row level security;
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- comments
alter table public.comments enable row level security;
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_update_own" on public.comments for update using (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- collections
alter table public.collections enable row level security;
create policy "collections_select_public_or_own" on public.collections for select
  using (is_public = true or auth.uid() = owner_id);
create policy "collections_insert_own" on public.collections for insert with check (auth.uid() = owner_id);
create policy "collections_update_own" on public.collections for update using (auth.uid() = owner_id);
create policy "collections_delete_own" on public.collections for delete using (auth.uid() = owner_id);

-- collection_items
alter table public.collection_items enable row level security;
create policy "collection_items_select" on public.collection_items for select
  using (exists (
    select 1 from public.collections c
    where c.id = collection_id and (c.is_public = true or c.owner_id = auth.uid())
  ));
create policy "collection_items_insert_owner" on public.collection_items for insert
  with check (auth.uid() = (select owner_id from public.collections where id = collection_id));
create policy "collection_items_delete_owner" on public.collection_items for delete
  using (auth.uid() = (select owner_id from public.collections where id = collection_id));
