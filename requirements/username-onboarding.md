# Feature: Username Onboarding Flow

## Overview

The Username Onboarding Flow is a mandatory first-time setup experience that ensures all authenticated users have a username before accessing BBQ Buddy's core functionality. Implemented using Next.js App Router with server-side layout checks and client-side redirect guards, this feature intercepts users with missing usernames after authentication and routes them to a dedicated onboarding page at /onboarding. The onboarding screen reuses existing Avatar and username input components from the profile page, validates username uniqueness against Supabase's profiles table (leveraging the existing PostgreSQL unique constraint on the username column), and handles avatar uploads to the avatars storage bucket. Once a username is successfully set, users are redirected to the main app, and the profile page is modified to display the username as read-only text while retaining avatar edit functionality. This feature integrates with the existing ProfileProvider context to check username availability in real-time, uses Supabase SSR pattern for server-side authentication checks, and enforces username immutability post-onboarding to maintain data consistency across the application.

## User Stories

- As a newly registered user without a username, I want to be redirected to an onboarding screen immediately after authentication so that I cannot access the main app until I complete my profile setup
- As a user on the onboarding screen, I want to see a welcoming message asking "how should we call you?" so that the purpose of this step is clear and friendly
- As a user setting up my profile, I want to enter a username (minimum 3 characters) so that I can create my unique identity in BBQ Buddy
- As a user entering a username, I want real-time validation feedback so that I know immediately if my chosen username is available or already taken
- As a user on the onboarding screen, I want to see validation errors clearly displayed if my username is invalid (too short, already taken, or contains invalid characters) so that I can correct my input
- As a user completing onboarding, I want the option to upload a profile avatar image so that I can personalize my account from the start
- As a user, I want the avatar upload component to work identically to the profile page so that the experience is consistent across the app
- As a user, I want to submit my username and proceed to the main app only when my username is valid and unique so that duplicate or invalid usernames are prevented
- As a user who successfully completes onboarding, I want to be automatically redirected to the main app (home page with session list) so that I can immediately start using BBQ Buddy
- As an authenticated user who already has a username, I want to be able to navigate to the profile page to view and edit my avatar but NOT edit my username so that my username remains permanent once set
- As a user viewing my profile, I want to see my username displayed as read-only text so that it's clear I cannot change it after onboarding
- As a user on the profile page, I want the email field removed entirely so that only relevant profile information (username and avatar) is displayed
- As a user trying to access protected routes, I want the app to check if I have a username and redirect me to onboarding if not so that the onboarding gate is enforced consistently across all pages
- As a user on the onboarding page who already has a username, I want to be redirected to the main app so that I cannot re-enter the onboarding flow unnecessarily
- As a user, I want toast notifications to confirm successful username submission so that I have clear feedback that my profile setup is complete
- As a user, I want the onboarding form to be disabled while my username is being validated and submitted so that I cannot submit duplicate requests
- As a developer, I want username uniqueness to be enforced at the database level (PostgreSQL unique constraint) so that race conditions cannot create duplicate usernames
- As a developer, I want the onboarding check to happen in the root layout or middleware so that the gate is enforced before any page content loads
- As a developer, I want to reuse the existing Avatar component, ProfileProvider, and username validation logic from the profile page so that code duplication is minimized
- As a developer, I want the onboarding server action to use the same upsert pattern as the existing profile update function so that consistency is maintained across profile mutations

## Technical Implementation Details

### Database Schema
- Leverage existing `profiles` table with `username` column (text, unique, nullable)
- Existing PostgreSQL unique constraint on `username` column provides database-level uniqueness enforcement
- No schema changes required - feature works with current database structure

### Routing and Pages
- Create new page: `/app/onboarding/page.tsx` (client component)
- Onboarding page should be public-accessible (authenticated users only, but not behind username gate)
- Add layout-level check in `/app/layout.tsx` or create template component to check username status
- Alternatively, use Next.js middleware pattern to intercept requests and check profile status

### Onboarding Gate Logic
Two possible implementation approaches:

**Option A: Template Component Pattern**
- Create `/app/template.tsx` that wraps children with username check
- Uses ProfileProvider to access profile state
- Client-side check that redirects to `/onboarding` if `profile.username` is null
- Whitelist routes: `/login`, `/onboarding` (no redirect needed)
- Template component re-renders on navigation, ensuring check runs on every route

**Option B: Middleware Pattern**
- Create `middleware.ts` in project root
- Server-side check using Supabase SSR server client
- Redirects to `/onboarding` if user is authenticated but username is null
- More performant (server-side), but requires careful handling of public routes
- Whitelist: `/login`, `/onboarding`, `/api/*`, `/_next/*`, static assets

**Recommended Approach:** Option A (Template Component) for simplicity and integration with existing ProfileProvider context

### Onboarding Page Components

**Page Structure:**
```tsx
/app/onboarding/page.tsx
- Client component ('use client')
- Uses useSupabase() and useProfile() hooks
- Reuses Avatar component from @/components/Avatar
- Form with username input (similar to profile page)
- Submit button with loading state
- Welcome message: "Welcome to BBQ Buddy! How should we call you?"
```

**Component Reuse:**
- Avatar component: Import and use directly with same props pattern as profile page
- Username input: Copy styling from profile page for consistency
- Toast notifications: Use existing sonner toast for success/error feedback
- Form validation: Reuse validation logic from profile page (min 3 chars, unique check)

### Server Actions

**Create new action:** `/app/actions/onboarding-setup.ts`
```typescript
'use server'
- Accept FormData or direct parameters (username, avatar_url)
- Validate username: min 3 chars, not null, sanitize input
- Use Supabase server client to update profiles table
- Handle unique constraint violation (error code 23505)
- Return success/error state for client feedback
- Call revalidatePath('/') to refresh profile context
- No redirect in action - let client handle navigation
```

**Alternative:** Reuse existing profile update logic from profile page inline
- Profile page already has updateProfile function
- Could extract to shared utility or keep action-based approach

### Username Validation Flow

1. User types username in input field
2. Client-side validation: Check length (min 3 characters)
3. On submit, server action validates:
   - Username not null/empty
   - Username meets length requirements
   - Attempt upsert to profiles table
4. Database enforces uniqueness constraint
5. If error code 23505 (unique violation), return "Username already taken"
6. If success, ProfileProvider automatically refreshes via refreshProfile()
7. Client redirects to home page ('/')

### Profile Page Modifications

**Changes to `/app/profile/page.tsx`:**
1. Remove email input field entirely (lines 136-144)
2. Replace username input with read-only display:
   - Change from `<input>` to `<p>` or `<div>` with styled text
   - Display username value, no onChange handler
   - Add visual styling to indicate read-only status (e.g., lighter background, no border)
3. Keep Avatar component with full upload/delete functionality
4. Keep "Update" button for avatar changes only
5. Update button label to "Update Avatar" for clarity
6. Update the updateProfile function call to NOT include username parameter
7. Add explanatory text: "Username cannot be changed after setup"

### Authentication Flow Integration

**Current flow:**
1. User signs up/logs in via `/login`
2. Supabase Auth trigger creates profile entry with null username
3. User redirected to home page by login page's onAuthStateChange

**New flow with onboarding:**
1. User signs up/logs in via `/login`
2. Supabase Auth trigger creates profile entry with null username
3. Login page redirects to `/` (home page)
4. Layout/template checks profile.username
5. If username is null, redirect to `/onboarding`
6. User completes onboarding form
7. Server action updates profile with username
8. Client redirects to `/` (home page)
9. Layout check passes (username exists), user sees main app

### Edge Cases and Error Handling

1. **User navigates directly to /onboarding with existing username:**
   - Onboarding page should check profile.username on mount
   - If username exists, redirect to home page immediately
   - Prevent re-entry into onboarding flow

2. **User goes back/forward during onboarding:**
   - Template component re-runs check on navigation
   - User redirected back to /onboarding if username still null

3. **Profile refresh timing:**
   - After successful username submission, call refreshProfile()
   - Ensure ProfileProvider updates before navigation
   - Use async/await pattern to wait for refresh

4. **Avatar upload during onboarding:**
   - Avatar component handles upload independently
   - Store avatar_url in local state
   - Include avatar_url in final username submission
   - If username submission fails, cleanup uploaded avatar (prevent orphans)

5. **Concurrent username submissions (race condition):**
   - PostgreSQL unique constraint handles this at database level
   - Second submission will fail with error code 23505
   - Return appropriate error message to user

6. **Anonymous users:**
   - Onboarding gate only applies to authenticated users
   - Template/middleware should check session existence first
   - Allow anonymous browsing if app supports it (currently requires auth)

### Styling and UX

**Onboarding Page Design:**
- Match profile page layout structure (centered card, max-w-md)
- Use same Tailwind CSS classes for consistency
- Welcome message in h1 tag with primary color
- Avatar component centered at top (same as profile page)
- Username input below avatar
- Submit button at bottom with primary color background
- Loading states during submission (disable form, show spinner/text)

**Profile Page Design:**
- Remove email section entirely
- Username displayed as read-only with muted styling:
  - Light background (bg-input)
  - No border or subtle border
  - Opacity reduced (opacity-70)
  - Clear label: "Username (cannot be changed)"
- Avatar section remains prominent at top
- "Update Avatar" button instead of generic "Update"

### Integration Points

**ProfileProvider:**
- No changes needed to ProfileProvider itself
- Onboarding page uses existing useProfile() hook
- Uses refreshProfile() to reload profile after username set

**SupabaseProvider:**
- No changes needed
- Onboarding page uses useSupabase() for session access

**Navbar:**
- No changes needed
- Already displays avatar and username from ProfileProvider
- Will automatically show username after onboarding completes

**Session Actions:**
- No changes needed
- Sessions already use user_id for RLS
- Username is not used in session operations (only for display)

### Security Considerations

1. **Authorization:**
   - Onboarding page should verify user is authenticated (has session)
   - Redirect to /login if no session
   - Server action should verify auth.uid() matches profile being updated

2. **Input Sanitization:**
   - Trim whitespace from username input
   - Reject usernames with only whitespace
   - Consider character restrictions (alphanumeric + underscore/hyphen only)
   - Max length validation (e.g., 30 characters)

3. **SQL Injection Protection:**
   - Supabase client handles parameterization automatically
   - No raw SQL needed for username upsert

4. **Avatar Security:**
   - Reuse existing Avatar component security (uid-based file naming)
   - Avatar upload uses existing deleteAvatar cleanup pattern
   - RLS policies on avatars bucket already enforce user ownership

### Performance Considerations

1. **Template Component vs Middleware:**
   - Template adds client-side redirect check on every navigation
   - Minimal performance impact (ProfileProvider already loaded)
   - Middleware would add server-side overhead to every request
   - Recommend template approach for simplicity

2. **Profile Loading:**
   - ProfileProvider already fetches profile on app load
   - No additional database queries needed for onboarding check
   - Username check uses existing profile context state

3. **Redirect Loops:**
   - Ensure whitelist routes are properly excluded from checks
   - /onboarding must never redirect to itself
   - /login must never be blocked by username gate

### Testing Scenarios

1. New user signs up, completes onboarding, accesses main app
2. New user signs up, tries to skip onboarding (manually navigates to /), gets redirected back
3. Existing user with username cannot access /onboarding (redirected to /)
4. User submits duplicate username, sees error message
5. User submits too-short username, sees validation error
6. User uploads avatar during onboarding, sees avatar in navbar after completion
7. User completes onboarding, navigates to profile, sees read-only username
8. User on profile page can still update avatar successfully
9. User on profile page does NOT see email field
10. Multiple users try to submit same username concurrently, only first succeeds

## Implementation Checklist

### Phase 1: Create Onboarding Page
- [ ] Create /app/onboarding/page.tsx (client component)
- [ ] Import and configure Avatar component
- [ ] Create username input form with validation
- [ ] Add welcome message and styling
- [ ] Implement redirect logic for users with existing username
- [ ] Add loading states and disabled form during submission

### Phase 2: Create Server Action
- [ ] Create /app/actions/onboarding-setup.ts
- [ ] Implement username validation (min 3 chars, not null)
- [ ] Handle upsert to profiles table
- [ ] Catch and handle unique constraint violations (error code 23505)
- [ ] Return appropriate success/error states
- [ ] Add revalidatePath call

### Phase 3: Implement Onboarding Gate
- [ ] Create /app/template.tsx for username check (OR implement in middleware.ts)
- [ ] Check if user is authenticated (has session)
- [ ] Check if profile.username exists
- [ ] Redirect to /onboarding if username is null
- [ ] Whitelist /login and /onboarding routes
- [ ] Test redirect logic on all protected routes

### Phase 4: Modify Profile Page
- [ ] Remove email input field from /app/profile/page.tsx
- [ ] Replace username input with read-only display element
- [ ] Update styling for read-only username (muted background, label)
- [ ] Keep Avatar component with full upload/delete functionality
- [ ] Update "Update" button label to "Update Avatar"
- [ ] Modify updateProfile call to exclude username parameter
- [ ] Add explanatory text about username immutability

### Phase 5: Testing and Validation
- [ ] Test new user onboarding flow end-to-end
- [ ] Test duplicate username validation
- [ ] Test avatar upload during onboarding
- [ ] Test redirect behavior for users with/without usernames
- [ ] Test profile page read-only username display
- [ ] Test avatar updates on profile page still work
- [ ] Test edge cases (direct navigation, back button, etc.)
- [ ] Verify no redirect loops occur

### Phase 6: Polish and Documentation
- [ ] Add toast notifications for success/error states
- [ ] Ensure consistent styling between onboarding and profile pages
- [ ] Update CLAUDE.md with onboarding flow documentation
- [ ] Add user-facing error messages for validation failures
- [ ] Test on mobile/responsive layouts
