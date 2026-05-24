-- ============================================================
-- Phase 0 — Storage buckets (logos + media)
-- ============================================================

-- Create buckets (public = true means files are publicly readable via URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 2097152,  -- 2 MB
   array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('media', 'media', true, 10485760, -- 10 MB
   array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS policies
-- ============================================================

-- logos: public read
create policy "logos: public read"
  on storage.objects for select
  using (bucket_id = 'logos');

-- logos: authenticated users can upload
create policy "logos: authed insert"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

-- logos: owner can delete their own upload
create policy "logos: owner delete"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid() = owner);

-- media: public read
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- media: authenticated users can upload
create policy "media: authed insert"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- media: owner can delete their own upload
create policy "media: owner delete"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid() = owner);
