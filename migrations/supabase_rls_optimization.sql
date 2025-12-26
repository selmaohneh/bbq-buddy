-- Migration: Optimize RLS Policies for Performance
-- This migration fixes auth_rls_initplan warnings by replacing auth.uid() with (select auth.uid())
-- to prevent unnecessary re-evaluation of auth functions for each row.
--
-- Based on current policy definitions from pg_policies query.
-- Safe to run - preserves all existing logic and only optimizes auth.uid() calls.

-- ====================
-- PROFILES TABLE
-- ====================

-- Drop and recreate policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = id);

-- ====================
-- FOLLOWS TABLE
-- ====================

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others"
  ON public.follows
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows
  FOR DELETE
  TO public
  USING ((select auth.uid()) = follower_id);

-- ====================
-- SESSIONS TABLE
-- ====================

DROP POLICY IF EXISTS "Users can insert their own sessions." ON public.sessions;
CREATE POLICY "Users can insert their own sessions."
  ON public.sessions
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions." ON public.sessions;
CREATE POLICY "Users can update their own sessions."
  ON public.sessions
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions." ON public.sessions;
CREATE POLICY "Users can delete their own sessions."
  ON public.sessions
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- ====================
-- YUMMIES TABLE
-- ====================

DROP POLICY IF EXISTS "Users can yummy sessions" ON public.yummies;
CREATE POLICY "Users can yummy sessions"
  ON public.yummies
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unyummy sessions" ON public.yummies;
CREATE POLICY "Users can unyummy sessions"
  ON public.yummies
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

-- ====================
-- VERIFICATION
-- ====================
-- After running this migration, you can verify the optimization by running:
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'follows', 'sessions', 'yummies')
-- ORDER BY tablename, policyname;
