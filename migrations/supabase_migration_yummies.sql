-- ============================================
-- BBQ Buddy - Yummies Feature Migration
-- ============================================
-- This migration adds the yummies (like/reaction) feature to BBQ Buddy
-- Pattern: Similar to follows table but for session engagement
-- Run this in the Supabase SQL Editor
-- This migration is idempotent and safe to run multiple times

-- 1. Create yummies table
create table if not exists public.yummies (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id bigint not null references public.sessions(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent duplicate yummies (one yummy per user per session)
  constraint unique_yummy unique (user_id, session_id)
);

-- 2. Create indexes for performance
create index if not exists idx_yummies_user_id on public.yummies(user_id);
create index if not exists idx_yummies_session_id on public.yummies(session_id);
create index if not exists idx_yummies_created_at on public.yummies(created_at desc);

-- 3. Enable Row Level Security
alter table public.yummies enable row level security;

-- 4. RLS Policies: Anyone can view yummies (for public engagement stats)
drop policy if exists "Anyone can view yummies" on public.yummies;
create policy "Anyone can view yummies"
  on public.yummies for select
  using (true);

-- 5. RLS Policies: Authenticated users can create yummies for any session
drop policy if exists "Users can yummy sessions" on public.yummies;
create policy "Users can yummy sessions"
  on public.yummies for insert
  with check (auth.uid() = user_id);

-- 6. RLS Policies: Users can only delete their own yummies
drop policy if exists "Users can unyummy sessions" on public.yummies;
create policy "Users can unyummy sessions"
  on public.yummies for delete
  using (auth.uid() = user_id);

-- 7. Helper function: Get yummy count for a session
create or replace function public.get_yummy_count(target_session_id bigint)
returns bigint
language sql
stable
as $$
  select count(*) from public.yummies where session_id = target_session_id;
$$;

-- 8. Helper function: Check if user has yummied a session
create or replace function public.has_yummied(target_user_id uuid, target_session_id bigint)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.yummies
    where user_id = target_user_id
      and session_id = target_session_id
  );
$$;

-- Done! The yummies feature database setup is complete.
--
-- To verify the migration:
-- 1. Check that the yummies table exists: SELECT * FROM public.yummies LIMIT 1;
-- 2. Test constraint: Attempt to insert duplicate yummy (should fail with error 23505)
-- 3. Test helper: SELECT get_yummy_count(1);
