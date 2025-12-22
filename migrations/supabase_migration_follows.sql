-- ============================================
-- BBQ Buddy - Follows Feature Migration
-- ============================================
-- This migration adds the follows/following feature to BBQ Buddy
-- Run this in the Supabase SQL Editor
-- This migration is idempotent and safe to run multiple times

-- 1. Create follows table
create table if not exists public.follows (
  id bigserial primary key,
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Prevent self-follows
  constraint no_self_follow check (follower_id != following_id),

  -- Prevent duplicate follows
  constraint unique_follow unique (follower_id, following_id)
);

-- 2. Create indexes for performance
create index if not exists idx_follows_follower_id on public.follows(follower_id);
create index if not exists idx_follows_following_id on public.follows(following_id);
create index if not exists idx_follows_created_at on public.follows(created_at desc);

-- 3. Enable Row Level Security
alter table public.follows enable row level security;

-- 4. RLS Policies: Anyone can view follows (for public profiles)
drop policy if exists "Anyone can view follows" on public.follows;
create policy "Anyone can view follows"
  on public.follows for select
  using (true);

-- 5. RLS Policies: Users can only create follows for themselves
drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- 6. RLS Policies: Users can only delete their own follows
drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 7. Helper function: Get follower count for a user
create or replace function public.get_follower_count(user_id uuid)
returns bigint
language sql
stable
as $$
  select count(*) from public.follows where following_id = user_id;
$$;

-- 8. Helper function: Check if user A follows user B
create or replace function public.is_following(follower_id uuid, following_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.follows
    where follows.follower_id = is_following.follower_id
      and follows.following_id = is_following.following_id
  );
$$;

-- 9. Add created_at to profiles table (for "Member since" feature)
alter table public.profiles
add column if not exists created_at timestamp with time zone default now();

-- 10. Update handle_new_user trigger to include created_at
-- This ensures new users get their auth creation date stored in profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, created_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url',
    new.created_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Done! The follows feature database setup is complete.
--
-- To verify the migration:
-- 1. Check that the follows table exists: SELECT * FROM public.follows LIMIT 1;
-- 2. Test constraint: INSERT INTO follows (follower_id, following_id) VALUES ('test', 'test'); (should fail)
-- 3. Test helper: SELECT get_follower_count('your-user-id');
