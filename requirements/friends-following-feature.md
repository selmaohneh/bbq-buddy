# Friends/Following Feature Requirements

## Feature Overview

This document specifies the requirements for implementing a social following system in BBQ Buddy, allowing users to discover, follow, and view profiles of other BBQ enthusiasts.

## User Stories

### US-1: Search for Users
**As a** BBQ Buddy user
**I want to** search for other users by username
**So that** I can discover and connect with other BBQ enthusiasts

**Acceptance Criteria:**
- Search is accessible via a friends icon in the top navbar (next to avatar) when on profile page
- Search supports partial username matching (case-insensitive)
- Search results update as I type (with debouncing)
- Search excludes my own profile from results
- Results are limited to 20 users for performance
- Clicking a result navigates to that user's profile

### US-2: Follow Users
**As a** BBQ Buddy user
**I want to** follow other users
**So that** I can keep track of BBQ enthusiasts I'm interested in

**Acceptance Criteria:**
- I can follow a user from their profile page
- Follow button shows "Follow" when not following
- Follow button shows "Following" when already following
- Following state updates immediately (optimistic update)
- I receive confirmation when follow succeeds
- I receive error message if follow fails
- I cannot follow myself
- I cannot follow the same user twice

### US-3: Unfollow Users
**As a** BBQ Buddy user
**I want to** unfollow users I'm no longer interested in
**So that** I can manage my following list

**Acceptance Criteria:**
- I can unfollow from the user's profile page
- Button shows "Unfollow" when following (clear action-oriented label)
- Unfollowing state updates immediately (optimistic update)
- I receive confirmation when unfollow succeeds
- I receive error message if unfollow fails

### US-4: View User Profiles
**As a** BBQ Buddy user
**I want to** view other users' profiles
**So that** I can learn about other BBQ enthusiasts and their BBQ activity

**Acceptance Criteria:**
- User profiles are accessible at `/profile/[userId]`
- Profile displays: avatar, username, member since date, follower count
- Profile displays BBQ statistics (same as own profile: total sessions, days this year)
- Profile is readonly (no editing capabilities for avatar/username)
- Follow/unfollow button is displayed on profile
- Accessing my own profile via `/profile/[myId]` redirects to `/profile`
- Accessing non-existent user shows friendly error message

### US-5: View Following List
**As a** BBQ Buddy user
**I want to** see a list of users I follow
**So that** I can quickly access their profiles

**Acceptance Criteria:**
- Following list is shown in the friends modal
- List displays: avatar, username for each followed user
- List shows "Following" indicator for each user
- Clicking a user navigates to their profile
- Empty state shown when not following anyone
- List is ordered by most recently followed first

### US-6: See Follower Counts
**As a** BBQ Buddy user
**I want to** see how many followers I have and how many others have
**So that** I can gauge popularity in the community

**Acceptance Criteria:**
- Follower count displayed below "Member since" on all profiles (own and others)
- Count shows singular "follower" or plural "followers"
- Count updates immediately after follow/unfollow
- Own profile shows follower count fetched from database
- Other profiles show follower count fetched from database

---

## Technical Specifications

### Database Schema

#### `follows` Table

```sql
create table public.follows (
  id bigserial primary key,
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint no_self_follow check (follower_id != following_id),
  constraint unique_follow unique (follower_id, following_id)
);

-- Indexes
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_follows_created_at on public.follows(created_at desc);
```

#### `profiles` Table Update

```sql
-- Add created_at for "Member since" feature
alter table public.profiles
add column if not exists created_at timestamp with time zone default now();
```

#### Row Level Security (RLS) Policies

```sql
-- Anyone can view all follows (for public profiles)
create policy "Anyone can view follows"
  on public.follows for select
  using (true);

-- Users can only create follows for themselves
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- Users can only delete their own follows
create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);
```

### API Contracts (Server Actions)

#### 1. `searchUsers(query: string): Promise<UserSearchResult[]>`

**Description:** Search for users by username (partial match, case-insensitive)

**Input:**
- `query`: Search term (minimum 2 characters)

**Output:**
```typescript
interface UserSearchResult {
  id: string
  username: string
  avatar_url: string | null
}
```

**Behavior:**
- Returns empty array if query < 2 characters
- Excludes current user from results
- Limits results to 20 users
- Orders by username alphabetically
- Returns empty array if not authenticated

#### 2. `followUser(followingId: string): Promise<{success: boolean, error?: string}>`

**Description:** Create a follow relationship

**Input:**
- `followingId`: UUID of user to follow

**Output:**
```typescript
{
  success: boolean
  error?: string // Only present on failure
}
```

**Validations:**
- User must be authenticated
- Cannot follow yourself
- Cannot follow same user twice (handled by DB constraint)

**Side Effects:**
- Revalidates `/profile` and `/profile/[followingId]` paths

#### 3. `unfollowUser(followingId: string): Promise<{success: boolean, error?: string}>`

**Description:** Remove a follow relationship

**Input:**
- `followingId`: UUID of user to unfollow

**Output:**
```typescript
{
  success: boolean
  error?: string // Only present on failure
}
```

**Validations:**
- User must be authenticated

**Side Effects:**
- Revalidates `/profile` and `/profile/[followingId]` paths

#### 4. `getFollowerCount(userId: string): Promise<number>`

**Description:** Get the number of followers for a user

**Input:**
- `userId`: UUID of user

**Output:** Number of followers (0 on error)

#### 5. `getFollowingList(): Promise<FollowListItem[]>`

**Description:** Get list of users the current user follows

**Output:**
```typescript
interface FollowListItem {
  id: string
  username: string
  avatar_url: string | null
  is_following: boolean // Always true for this list
}
```

**Behavior:**
- Returns empty array if not authenticated
- Orders by most recent follow first (created_at desc)
- Filters out deleted/invalid profiles

#### 6. `getUserProfile(userId: string): Promise<UserProfileWithStats | null>`

**Description:** Get a user's profile with statistics and follow status

**Input:**
- `userId`: UUID of user to fetch

**Output:**
```typescript
interface UserProfileWithStats {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  follower_count: number
  following_count: number
  is_following: boolean // Whether current user follows this profile
  is_own_profile: boolean // Whether this is the current user's profile
}
```

**Behavior:**
- Returns null if user not found
- `is_following` is false if not authenticated or viewing own profile
- Includes creation timestamp for "Member since" display

---

## Component Specifications

### 1. FriendsModal

**Purpose:** Modal overlay for searching users and viewing following list

**Props:**
```typescript
interface FriendsModalProps {
  isOpen: boolean
  onClose: () => void
}
```

**Features:**
- Search input with 500ms debounce
- Search results section (scrollable)
- Following list section below search (scrollable)
- Close button (top-right)
- Escape key to close
- Click backdrop to close
- Prevents body scroll when open

**Accessibility:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title

**Empty States:**
- No search results: "No users found matching '[query]'"
- No following: "You're not following anyone yet. Search above to find BBQ enthusiasts!"

**Loading States:**
- Search: Loading spinner while searching
- Following list: Skeleton loader while fetching

### 2. UserSearchResult

**Purpose:** Individual search result item

**Props:**
```typescript
interface UserSearchResultProps {
  user: UserSearchResult
  onClick: (userId: string) => void
}
```

**Display:**
- Avatar (48px, circular)
- Username (@username format)
- Hover effect (background change)
- Clickable entire card

### 3. FollowingListItem

**Purpose:** Item in the following list

**Props:**
```typescript
interface FollowingListItemProps {
  user: FollowListItem
  onClick: (userId: string) => void
}
```

**Display:**
- Avatar (48px, circular)
- Username (@username format)
- "Following" indicator/badge
- Hover effect (background change)
- Clickable entire card

### 4. FollowButton

**Purpose:** Follow/unfollow button with optimistic updates

**Props:**
```typescript
interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}
```

**States:**
- Not following: "Follow" button with primary color background
- Following: "Following" button with secondary background
- Loading: Disabled with loading indicator

**Behavior:**
- Optimistic update (immediate UI change)
- Revert on error
- Toast notification on success/error
- Callback to parent on state change

### 5. Profile Page Modifications

**Changes:**
- Add friends icon button (top-right corner of content)
- Icon: `mdiAccountMultiple` from `@mdi/react`
- Add `FriendsModal` component
- Manage modal open/close state

### 6. User Profile Page

**Route:** `/app/profile/[userId]/page.tsx`

**Component Type:** Async Server Component

**Layout:**
- Avatar (120px, readonly)
- Username (@username format)
- Member since: "BBQ Buddy since [YEAR]"
- Follower count: "[N] follower(s)"
- Follow/Unfollow button
- No statistics section (privacy)

**Edge Cases:**
- User not found: Show friendly error with link to home
- Own profile: Redirect to `/profile`

---

## UI/UX Guidelines

### Color Scheme (Dark Mode Only)

- **Primary Action:** `--primary` (#D64933) - Follow button, clickable items
- **Background:** `--card-background` (#262626) - Modal, cards
- **Text:** `--foreground` (#f5f5f5) - Primary text
- **Muted Text:** `--foreground/60` - Secondary text
- **Borders:** `--border` (#404040)

### Spacing

- Modal padding: `p-6` (24px)
- Card gap: `gap-3` (12px)
- Section gap: `gap-6` (24px)

### Animations

- Modal entrance: `animate-fade-in` + `animate-slide-up`
- Hover transitions: `transition-colors`, `transition-opacity`
- Loading: Pulse animation

### Typography

- Modal title: `text-xl font-bold`
- Username: `text-lg text-foreground`
- Secondary text: `text-sm text-foreground/60`

---

## Security Considerations

### Row Level Security

- All follow operations enforced by RLS policies
- Users can only create follows for themselves
- Users can only delete their own follows
- All users can view all follows (public profiles)

### Input Validation

- Search query: Sanitized by Supabase client
- User IDs: Validated as UUIDs
- Self-follow: Prevented by database constraint and server validation

### Privacy

- User statistics (BBQ sessions) are publicly viewable on all profiles
- Session details are public (supports community discovery and engagement)
- All profiles publicly viewable (by design)
- Usernames publicly searchable (by design)

---

## Performance Considerations

### Database Optimization

- Indexes on `follower_id` and `following_id` for fast queries
- Search limited to 20 results
- Count queries use `{ count: 'exact', head: true }` for efficiency

### Client-Side Optimization

- Search debouncing (500ms) to reduce API calls
- Optimistic updates for immediate feedback
- Lazy loading of following list

### Caching

- Next.js path revalidation after mutations
- Server components for initial data loading

---

## Testing Requirements

### Unit Tests

- Server actions: Mock Supabase client, verify queries
- Components: Test rendering, user interactions, state changes

### Integration Tests

- Full user flow: Search → View profile → Follow → Verify count
- Modal interactions: Open, search, navigate, close
- Follow/unfollow: Optimistic updates, error handling

### Edge Cases

- Self-follow attempt
- Duplicate follow attempt
- User not found
- Network errors
- Concurrent follow/unfollow

### Browser Testing

- Chrome, Firefox, Safari
- Mobile responsive design
- Keyboard navigation
- Screen reader compatibility

---

## Future Enhancements (Out of Scope)

- [ ] Notifications when someone follows you
- [ ] Followers list (who follows me)
- [ ] Mutual followers indicator
- [ ] Activity feed of followed users' sessions
- [ ] Private profiles option
- [ ] Block user functionality
- [ ] Follow suggestions based on activity
- [ ] Following/followers count on own profile

---

## Implementation Notes

### Migration Strategy

1. Create migration SQL file
2. Apply in Supabase SQL Editor (staging first)
3. Verify constraints and RLS policies
4. Test with sample data
5. Apply to production

### Rollout Plan

1. **Phase 1:** Database + Server Actions (backend only)
2. **Phase 2:** Components + Profile modifications (UI)
3. **Phase 3:** User profile page (public profiles)
4. **Phase 4:** Polish, testing, bug fixes
5. **Phase 5:** Production deployment

### Monitoring

- Track follow/unfollow actions
- Monitor search query performance
- Track modal open/close rates
- Monitor error rates from server actions

---

## Success Metrics

- Users can successfully search and find other users
- Follow/unfollow actions complete without errors
- Follower counts display accurately
- Modal UX is smooth and responsive
- All user stories pass acceptance criteria
- Code follows BBQ Buddy patterns and conventions
