# Database Migrations

This directory contains SQL migration files for the BBQ Buddy application.

## How to Apply Migrations

### Using Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Verify success message

### Migration Files

#### `supabase_migration_follows.sql`
**Purpose**: Adds the friends/following feature

**What it does**:
- Creates `follows` table with relationship constraints
- Adds indexes for performance
- Sets up RLS policies
- Adds helper functions for follower counts
- Adds `created_at` to profiles table
- Updates the `handle_new_user()` trigger

**Status**: ✅ Apply this first

---

#### `fix_sessions_rls_public_read.sql`
**Purpose**: Fixes the bug where user profile stats show 0

**What it does**:
- Changes the `sessions` table SELECT policy from owner-only to public
- Keeps INSERT/UPDATE/DELETE restricted to owner
- Enables viewing other users' BBQ statistics

**Why needed**:
- Users couldn't see others' stats because RLS blocked access
- Stats always showed 0 on other profiles

**Status**: ✅ **CRITICAL - Apply this to fix stats visibility**

---

## Verification

After applying migrations, verify they worked:

### Test 1: Check RLS Policies

```sql
-- Should return policy "Anyone can view sessions."
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'sessions';
```

Expected: You should see:
- "Anyone can view sessions." for SELECT (qual: `true`)
- "Users can insert their own sessions." for INSERT
- "Users can update their own sessions." for UPDATE
- "Users can delete their own sessions." for DELETE

### Test 2: Check Follows Table

```sql
-- Should return data about the follows table
SELECT * FROM information_schema.tables
WHERE table_name = 'follows';
```

Expected: Table exists with columns: id, follower_id, following_id, created_at

### Test 3: Test Stats Visibility

1. Sign in as User A
2. Navigate to User B's profile (someone with sessions)
3. Check if stats show correctly (not 0)
4. ✅ Stats should display User B's actual session count

## Rollback (if needed)

If you need to revert the public read access:

```sql
-- Revert sessions to owner-only read
drop policy if exists "Anyone can view sessions." on public.sessions;
create policy "Users can view their own sessions."
  on public.sessions for select
  using (auth.uid() = user_id);
```

⚠️ **Note**: This will break the feature where users view others' profiles.

## Migration Order

Apply in this order:
1. `supabase_migration_follows.sql` (if not already applied)
2. `fix_sessions_rls_public_read.sql` (to fix stats bug)

## Questions?

- Check the requirements doc: `/requirements/friends-following-feature.md`
- Check the implementation plan: `~/.claude/plans/joyful-whistling-adleman.md`
- Review Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security
