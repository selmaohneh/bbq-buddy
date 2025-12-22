-- ============================================
-- BBQ Buddy - Fix Sessions RLS for Public Stats
-- ============================================
-- This migration makes sessions publicly readable while keeping
-- INSERT/UPDATE/DELETE restricted to the owner.
--
-- WHY: To enable viewing other users' BBQ statistics on their profiles
-- SECURITY: Sessions are read-only for others; only owners can modify
--
-- Run this in the Supabase SQL Editor
-- This migration is idempotent and safe to run multiple times

-- 1. Drop the restrictive SELECT policy
drop policy if exists "Users can view their own sessions." on public.sessions;

-- 2. Create new public SELECT policy
-- Anyone (authenticated or not) can view all sessions
create policy "Anyone can view sessions."
  on public.sessions for select
  using (true);

-- 3. Ensure INSERT policy restricts to owner (should already exist)
drop policy if exists "Users can insert their own sessions." on public.sessions;
create policy "Users can insert their own sessions."
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- 4. Ensure UPDATE policy restricts to owner
drop policy if exists "Users can update their own sessions." on public.sessions;
create policy "Users can update their own sessions."
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Ensure DELETE policy restricts to owner
drop policy if exists "Users can delete their own sessions." on public.sessions;
create policy "Users can delete their own sessions."
  on public.sessions for delete
  using (auth.uid() = user_id);

-- Done! Sessions are now publicly readable but owner-only writable.
--
-- To verify:
-- 1. As User A, try: SELECT * FROM sessions WHERE user_id = '<User B ID>';
-- 2. Should see User B's sessions
-- 3. Try to INSERT/UPDATE/DELETE User B's session → Should fail (permission denied)
