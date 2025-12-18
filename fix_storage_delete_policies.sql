-- FIX: Add missing DELETE policies for storage buckets
-- Run this in Supabase SQL Editor to fix avatar/image deletion
-- This is a critical fix - without these policies, storage delete operations silently fail

-- Delete policy for session-images bucket
-- Files are stored as: {user_id}/{timestamp}-{random}.{ext}
-- The foldername function extracts the first folder (user_id)
drop policy if exists "Users can delete their own session images" on storage.objects;
create policy "Users can delete their own session images"
  on storage.objects for delete
  using (
    bucket_id = 'session-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- Delete policy for avatars bucket
-- Files are stored as: {user_id}-{random}.{ext}
-- We split on '-' and check the first part matches user_id
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '-', 1)
  );


-- Verify policies were created successfully
select policyname, tablename, cmd
from pg_policies
where tablename = 'objects'
  and (policyname like '%delete%' or policyname like '%Delete%');
