# Feature: BBQ Statistics Dashboard

## Overview

The BBQ Statistics Dashboard provides users with comprehensive analytics about their grilling behavior through four key metrics displayed as visually distinct stat cards on the profile page. Built using Next.js 16 Server Components with data fetched via Supabase server-side queries, this feature calculates total BBQ sessions (all-time count), days grilled this year (unique calendar days in current year), days grilled this month (unique days in current month), and days grilled this week (unique days in current week starting Monday). Each stat card features a self-explanatory icon derived from the legacy React Native app design patterns (Material Community Icons), an info icon that toggles a detailed explanation modal or tooltip, and responsive styling using Tailwind CSS 4 dark theme variables. The feature integrates seamlessly into the existing profile page architecture, positioned below the avatar section, and handles empty states gracefully with encouraging messages for new users who have not yet created any BBQ sessions.

## User Stories

- As a BBQ enthusiast, I want to see my total number of BBQ sessions so that I can track my overall grilling journey and feel accomplished about my progress.

- As a competitive griller, I want to see how many unique days I've grilled this week so that I can maintain or break my weekly grilling streak.

- As a monthly planner, I want to see how many unique days I've grilled this month so that I can compare my activity across different months and seasons.

- As a yearly reviewer, I want to see how many unique days I've grilled this year so that I can set annual grilling goals and measure my commitment to the hobby.

- As a new user with no sessions, I want to see an encouraging empty state message so that I understand what these statistics will show once I start logging BBQ sessions.

- As a curious user, I want to tap an info icon on each statistic so that I can understand exactly how the metric is calculated and what it represents.

- As a mobile user, I want the statistics cards to be responsive and touch-friendly so that I can easily view and interact with them on any device.

- As a user viewing my profile, I want the statistics section to be visually distinct from my avatar and account settings so that I can quickly scan my grilling achievements.

- As a data-driven user, I want the statistics to update automatically when I create, edit, or delete sessions so that my metrics always reflect my current activity.

- As a visual learner, I want each statistic to have a clear icon that represents its meaning so that I can understand the metrics at a glance without reading labels.

## Detailed Statistics Calculations

### 1. Total BBQ Sessions (All Time)

**Metric Name:** Total BBQ Sessions
**Icon:** `grill` (MaterialCommunityIcons)
**Calculation Logic:**
```sql
SELECT COUNT(*) FROM sessions WHERE user_id = auth.uid()
```

**Business Rules:**
- Counts every session record ever created by the user
- Includes sessions from any date (past, present)
- Never resets or decrements unless sessions are deleted
- Minimum value: 0 (new users)

**Info Modal Content:**
> **Total BBQ Sessions**
>
> This is the total number of BBQ sessions you've logged since joining BBQ Buddy. Each time you create a new session, this number increases by one. It represents your complete grilling history.

**Empty State Message:** "Start your first BBQ session to begin tracking your grilling journey!"

---

### 2. Days Grilled This Year

**Metric Name:** Days Grilled This Year
**Icon:** `calendar-star` (MaterialCommunityIcons)
**Calculation Logic:**
```sql
SELECT COUNT(DISTINCT DATE(date))
FROM sessions
WHERE user_id = auth.uid()
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
```

**Business Rules:**
- Counts unique calendar days in the current year (Jan 1 - Dec 31)
- Multiple sessions on the same day count as 1 day
- Resets to 0 on January 1st each year
- Maximum theoretical value: 365 (or 366 in leap years)
- Only includes sessions where `date` falls in current calendar year

**Example Scenarios:**
- User has 3 sessions on Jan 15, 2025 → Contributes 1 day
- User has sessions on Dec 31, 2024 and Jan 1, 2025 → Dec 31 does NOT count toward 2025
- User has 100 sessions spread across 50 unique days in 2025 → Displays 50

**Info Modal Content:**
> **Days Grilled This Year**
>
> This counts the number of unique days you've grilled in the current calendar year (Jan 1 - Dec 31). If you grill multiple times in one day, it still counts as a single day. This metric resets to zero at the start of each year.

**Empty State Message:** "No grilling days yet this year. Time to fire up the grill!"

---

### 3. Days Grilled This Month

**Metric Name:** Days Grilled This Month
**Icon:** `calendar-month` (MaterialCommunityIcons)
**Calculation Logic:**
```sql
SELECT COUNT(DISTINCT DATE(date))
FROM sessions
WHERE user_id = auth.uid()
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
```

**Business Rules:**
- Counts unique calendar days in the current month (1st - last day of month)
- Multiple sessions on the same day count as 1 day
- Resets to 0 on the 1st of each month
- Maximum theoretical value: 28-31 (depending on month)
- Only includes sessions where `date` falls in current calendar month

**Example Scenarios:**
- User has 2 sessions on Dec 10 and 1 session on Dec 20 → Displays 2
- User has sessions on Nov 30 and Dec 1 → Only Dec 1 counts for December
- User has 15 sessions all on Dec 25 → Displays 1

**Info Modal Content:**
> **Days Grilled This Month**
>
> This counts the number of unique days you've grilled in the current calendar month. Multiple BBQ sessions on the same day count as just one day. This metric resets to zero at the beginning of each month.

**Empty State Message:** "Haven't grilled this month yet. Let's change that!"

---

### 4. Days Grilled This Week

**Metric Name:** Days Grilled This Week
**Icon:** `calendar-week` (MaterialCommunityIcons)
**Calculation Logic:**
```sql
SELECT COUNT(DISTINCT DATE(date))
FROM sessions
WHERE user_id = auth.uid()
  AND date >= DATE_TRUNC('week', CURRENT_DATE)  -- Monday of current week
  AND date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
```

**Business Rules:**
- Week starts on Monday and ends on Sunday
- Counts unique calendar days within the current week
- Multiple sessions on the same day count as 1 day
- Resets to 0 every Monday at midnight
- Maximum theoretical value: 7 (one session each day Mon-Sun)
- Only includes sessions where `date` falls in current week range

**Example Scenarios:**
- User has 3 sessions on Monday, 2 on Wednesday, 1 on Sunday → Displays 3
- User has sessions on Sunday (end of week) and Monday (new week) → Monday counts in new week
- User grills every single day Mon-Sun → Displays 7

**Info Modal Content:**
> **Days Grilled This Week**
>
> This counts the number of unique days you've grilled in the current week (Monday through Sunday). Even if you have multiple BBQ sessions in a single day, it only counts as one day. This metric resets every Monday.

**Empty State Message:** "No grilling days this week. The weekend is perfect for BBQ!"

---

## UI/UX Design Specifications

### Visual Design System

**Color Palette (from globals.css):**
- Background: `#1a1a1a` (var(--background))
- Foreground: `#f5f5f5` (var(--foreground))
- Card Background: `#262626` (var(--card-background))
- Border: `#404040` (var(--border))
- Primary (BBQ Red): `#D64933` (var(--primary))

**Typography:**
- Stat Value: 36px font-bold text-primary
- Stat Label: 18px font-semibold text-foreground
- Info Modal Title: 20px font-bold text-foreground
- Info Modal Body: 14px text-foreground/80

### Stat Card Component Design

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  [Icon]                      [Info] │
│                                     │
│            [Large Number]           │
│              72                     │
│                                     │
│         [Descriptive Label]         │
│        Total BBQ Sessions           │
└─────────────────────────────────────┘
```

**Component Specifications:**
- **Container:**
  - Background: `bg-card`
  - Border: `border border-border`
  - Border Radius: `rounded-2xl`
  - Padding: `p-6`
  - Shadow: `shadow-sm hover:shadow-md`
  - Transition: `transition-shadow duration-200`

- **Main Icon (Top Left):**
  - Size: 24px
  - Color: `text-primary` (#D64933)
  - Position: Absolute top-left with padding
  - Material Community Icons from Heroicons or Lucide React alternative

- **Info Icon (Top Right):**
  - Size: 20px
  - Color: `text-foreground/40 hover:text-foreground/80`
  - Position: Absolute top-right with padding
  - Clickable area: 40x40px for touch accessibility
  - Icon: Circle with "i" or question mark
  - Cursor: pointer
  - Interactive state: Scale animation on hover/press

- **Stat Value:**
  - Font Size: `text-4xl` (36px)
  - Font Weight: `font-bold`
  - Color: `text-primary`
  - Alignment: Center
  - Margin: Auto spacing to center vertically

- **Stat Label:**
  - Font Size: `text-lg` (18px)
  - Font Weight: `font-semibold`
  - Color: `text-foreground`
  - Alignment: Center
  - Margin Top: `mt-3`

### Grid Layout

**Desktop (≥768px):**
```
┌──────────────┬──────────────┐
│   Total      │  This Year   │
│  Sessions    │    Days      │
├──────────────┼──────────────┤
│  This Month  │  This Week   │
│    Days      │    Days      │
└──────────────┴──────────────┘
```
- CSS Grid: `grid-cols-2 gap-4`
- Each card: Equal height, minimum 160px

**Mobile (<768px):**
```
┌──────────────────┐
│  Total Sessions  │
├──────────────────┤
│  This Year Days  │
├──────────────────┤
│ This Month Days  │
├──────────────────┤
│ This Week Days   │
└──────────────────┘
```
- CSS Grid: `grid-cols-1 gap-3`
- Vertical stacking for better mobile readability

### Info Modal/Tooltip Design

**Implementation Options:**

**Option A: Modal Dialog (Recommended for Mobile)**
- Overlay: Semi-transparent dark background (`bg-black/50`)
- Modal Container:
  - Max Width: 400px
  - Background: `bg-card`
  - Border: `border border-border`
  - Padding: `p-6`
  - Border Radius: `rounded-2xl`
  - Shadow: `shadow-2xl`
- Close Button: X icon in top-right
- Animation: Fade in + slide up from bottom
- Dismissal: Click outside or close button

**Option B: Tooltip Popover (Desktop)**
- Triggered on hover for desktop
- Positioned above the info icon with arrow pointer
- Max Width: 280px
- Background: `bg-card`
- Border: `border border-border`
- Padding: `p-4`
- Font Size: `text-sm`
- Arrow: Small triangle pointing to info icon

**Recommended Approach:** Use modal on mobile (tap), tooltip on desktop (hover), with click fallback for accessibility.

### Empty State Design

**Scenario:** User has 0 total sessions

**Visual Layout:**
```
┌────────────────────────────────────────┐
│         [Grill Icon - Muted]           │
│                                        │
│     No BBQ sessions yet!               │
│                                        │
│  Start your grilling journey by        │
│   creating your first session.         │
│                                        │
│    [Create First Session Button]      │
└────────────────────────────────────────┘
```

**Component Specifications:**
- Container: Same card styling as stat cards
- Icon: 48px grill icon, `text-foreground/20` (muted)
- Heading: `text-xl font-bold text-foreground`
- Description: `text-sm text-foreground/60`
- Button:
  - Background: `bg-primary`
  - Text: `text-white`
  - Padding: `px-6 py-3`
  - Border Radius: `rounded-full`
  - Links to `/sessions/new`

**Empty State Per Metric:**
- **Total Sessions = 0:** Show full empty state with button
- **This Year = 0:** Show stat card with "0" and muted styling
- **This Month = 0:** Show stat card with "0" and muted styling
- **This Week = 0:** Show stat card with "0" and muted styling

---

## Placement Recommendations

### Recommended: Profile Page Integration

**Location:** `/app/profile/page.tsx`

**Proposed Layout Structure:**
```
┌─────────────────────────────────┐
│         Profile Header          │
│    [Avatar - Username - Level]  │
├─────────────────────────────────┤
│                                 │
│    BBQ Statistics Section       │
│  ┌────────────┬────────────┐   │
│  │   Total    │ This Year  │   │
│  ├────────────┼────────────┤   │
│  │ This Month │ This Week  │   │
│  └────────────┴────────────┘   │
│                                 │
├─────────────────────────────────┤
│      Account Actions            │
│      [Sign Out Button]          │
└─────────────────────────────────┘
```

**Rationale:**
1. **User Expectation:** Statistics naturally belong on a profile/account page
2. **Existing Pattern:** Old app placed stats on profile (stats/index.tsx)
3. **Visual Hierarchy:** Avatar → Stats → Actions flows logically
4. **Space Availability:** Profile page has ample whitespace below avatar
5. **Context Alignment:** Profile is where users view personal achievements

**Implementation Details:**
- Insert statistics section between avatar/username and sign-out button
- Add section heading: "Your BBQ Stats" with small grill icon
- Maintain existing profile page max-width (max-w-md)
- Add `mt-8` spacing above stats section for visual separation

### Alternative: Dedicated Statistics Page

**Location:** `/app/stats/page.tsx` (new route)

**Pros:**
- More room for future expansion (charts, graphs, achievements)
- Dedicated focus on analytics
- Can add to navigation menu

**Cons:**
- Adds navigation complexity
- Statistics might be overlooked if not on profile
- Requires additional route and nav changes

**Recommendation:** Start with profile page integration. If statistics grow significantly (add charts, achievements, leaderboards), migrate to dedicated page later.

### Integration with Navigation

**Current Nav Structure:**
```
[BBQ Buddy Logo] ... [Profile Icon]
```

**No Changes Required:** Profile icon already exists in Navbar, stats accessible via profile page.

**Future Enhancement:** If moving to dedicated stats page:
```
[BBQ Buddy Logo] [Stats Icon] ... [Profile Icon]
```

---

## Empty State Handling

### Scenario 1: New User (0 Total Sessions)

**Visual Treatment:**
- Replace entire statistics grid with single large empty state card
- Display encouraging message with call-to-action
- Button links to `/sessions/new` to create first session

**Copy:**
```
Headline: "Ready to Start Grilling?"
Subtext: "Create your first BBQ session to unlock your statistics dashboard and start tracking your grilling journey!"
Button: "Create First Session"
```

### Scenario 2: Existing User, No Activity in Time Period

**Visual Treatment:**
- Show stat cards with value "0"
- Reduce opacity of icon to 40% when value is 0
- Keep info icon functional
- Add subtle hint text below label

**Examples:**

**This Week = 0:**
```
[Calendar-Week Icon - Muted]     [Info]
           0
    Days Grilled This Week
  (Time to fire up the grill!)
```

**This Month = 0:**
```
[Calendar-Month Icon - Muted]    [Info]
           0
   Days Grilled This Month
     (New month, new BBQs!)
```

**This Year = 0:**
```
[Calendar-Star Icon - Muted]     [Info]
           0
   Days Grilled This Year
   (Make this year count!)
```

### Scenario 3: Partial Data

**Visual Treatment:**
- Show mix of populated and zero-value cards
- No special treatment - display actual values
- Maintains visual consistency

**Example:**
```
Total: 45  |  This Year: 12
This Month: 0  |  This Week: 2
```

### Loading State

**Visual Treatment:**
- Skeleton screens with pulsing animation
- Card structure maintained
- Placeholder blocks for value and label

**Implementation:**
```tsx
{isLoading ? (
  <StatsGridSkeleton />
) : stats.totalSessions === 0 ? (
  <EmptyState />
) : (
  <StatsGrid stats={stats} />
)}
```

---

## Technical Considerations

### Architecture Pattern

**Data Fetching Strategy:**
- Use Next.js 16 Server Components for initial render
- Fetch statistics on server-side using Supabase server client
- Leverage React Server Components for zero client-side JavaScript overhead
- No client-side state management needed for display

**File Structure:**
```
bbq-buddy/
├── app/
│   ├── actions/
│   │   └── get-statistics.ts          # Server action for stats
│   └── profile/
│       └── page.tsx                    # Updated with stats section
├── components/
│   ├── StatCard.tsx                    # Reusable stat card component
│   ├── StatsGrid.tsx                   # Grid container for stats
│   ├── StatInfoModal.tsx               # Info modal/tooltip
│   └── StatsEmptyState.tsx             # Empty state component
└── types/
    └── statistics.ts                   # TypeScript interfaces
```

### Database Query Optimization

**Server Action: `/app/actions/get-statistics.ts`**

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'

export interface BBQStatistics {
  totalSessions: number
  daysThisYear: number
  daysThisMonth: number
  daysThisWeek: number
}

export async function getStatistics(): Promise<BBQStatistics> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      totalSessions: 0,
      daysThisYear: 0,
      daysThisMonth: 0,
      daysThisWeek: 0
    }
  }

  // Single query to get all metrics efficiently
  const { data, error } = await supabase.rpc('get_bbq_statistics', {
    p_user_id: user.id
  })

  if (error) {
    console.error('Error fetching statistics:', error)
    return {
      totalSessions: 0,
      daysThisYear: 0,
      daysThisMonth: 0,
      daysThisWeek: 0
    }
  }

  return data as BBQStatistics
}
```

**PostgreSQL Function (Optimized):**

```sql
CREATE OR REPLACE FUNCTION get_bbq_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalSessions', (
      SELECT COUNT(*)
      FROM sessions
      WHERE user_id = p_user_id
    ),
    'daysThisYear', (
      SELECT COUNT(DISTINCT DATE(date))
      FROM sessions
      WHERE user_id = p_user_id
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'daysThisMonth', (
      SELECT COUNT(DISTINCT DATE(date))
      FROM sessions
      WHERE user_id = p_user_id
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    ),
    'daysThisWeek', (
      SELECT COUNT(DISTINCT DATE(date))
      FROM sessions
      WHERE user_id = p_user_id
        AND date >= DATE_TRUNC('week', CURRENT_DATE)
        AND date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Performance Considerations:**
- Single database round-trip using RPC function
- Postgres performs all calculations server-side
- Results cached by Next.js for the page duration
- No client-side computation needed
- Indexes on `user_id` and `date` columns (already exist via RLS)

### Supabase Integration

**Migration File: `supabase_statistics_function.sql`**

Add the `get_bbq_statistics` function to database via Supabase SQL Editor.

**RLS Considerations:**
- Function uses `SECURITY DEFINER` to bypass RLS
- User ID passed explicitly as parameter
- Maintains security by enforcing user_id filter in queries
- No risk of data leakage across users

### Data Freshness & Caching

**Next.js Caching Strategy:**
```typescript
// In profile/page.tsx
export const revalidate = 0 // Disable static caching for profile page
```

**Why No Caching:**
- Profile page shows user-specific data
- Statistics should reflect real-time session changes
- Users expect immediate updates after creating/deleting sessions

**Alternative: Time-Based Revalidation**
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```
- Reduces database load
- Acceptable staleness for statistics (1-minute delay)
- Balance between freshness and performance

### Component Architecture

**StatsGrid Component (Client Component for Interactivity):**

```typescript
'use client'

import { BBQStatistics } from '@/app/actions/get-statistics'
import { StatCard } from './StatCard'
import { useState } from 'react'
import { StatInfoModal } from './StatInfoModal'

interface StatsGridProps {
  stats: BBQStatistics
}

export function StatsGrid({ stats }: StatsGridProps) {
  const [activeInfo, setActiveInfo] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon="grill"
          value={stats.totalSessions}
          label="Total BBQ Sessions"
          onInfoClick={() => setActiveInfo('total')}
        />
        <StatCard
          icon="calendar-star"
          value={stats.daysThisYear}
          label="Days Grilled This Year"
          onInfoClick={() => setActiveInfo('year')}
        />
        <StatCard
          icon="calendar-month"
          value={stats.daysThisMonth}
          label="Days Grilled This Month"
          onInfoClick={() => setActiveInfo('month')}
        />
        <StatCard
          icon="calendar-week"
          value={stats.daysThisWeek}
          label="Days Grilled This Week"
          onInfoClick={() => setActiveInfo('week')}
        />
      </div>

      <StatInfoModal
        type={activeInfo}
        onClose={() => setActiveInfo(null)}
      />
    </>
  )
}
```

**StatCard Component:**

```typescript
'use client'

interface StatCardProps {
  icon: string
  value: number
  label: string
  onInfoClick: () => void
}

export function StatCard({ icon, value, label, onInfoClick }: StatCardProps) {
  const iconOpacity = value === 0 ? 'opacity-40' : 'opacity-100'

  return (
    <div className="relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Main Icon */}
      <div className={`absolute top-4 left-4 text-primary ${iconOpacity}`}>
        <GrillIcon name={icon} size={24} />
      </div>

      {/* Info Icon */}
      <button
        onClick={onInfoClick}
        className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors p-2 -m-2"
        aria-label={`Information about ${label}`}
      >
        <InfoIcon size={20} />
      </button>

      {/* Stat Value */}
      <div className="flex flex-col items-center justify-center min-h-[120px]">
        <div className="text-4xl font-bold text-primary mb-3">
          {value.toLocaleString()}
        </div>
        <div className="text-lg font-semibold text-foreground text-center">
          {label}
        </div>
        {value === 0 && (
          <div className="text-xs text-foreground/50 mt-2 text-center italic">
            {getEmptyHint(label)}
          </div>
        )}
      </div>
    </div>
  )
}

function getEmptyHint(label: string): string {
  if (label.includes('Week')) return 'Time to fire up the grill!'
  if (label.includes('Month')) return 'New month, new BBQs!'
  if (label.includes('Year')) return 'Make this year count!'
  return ''
}
```

### Icon Library Integration

**Current Setup:**
- App uses Heroicons via `next/image` for basic icons
- Old app used React Native Vector Icons (MaterialCommunityIcons)

**Recommended Approach:**
1. Install `lucide-react` (modern, tree-shakeable icon library)
2. Map old Material Community Icons to Lucide equivalents:

```typescript
// components/icons/GrillIcon.tsx
import {
  Flame,           // grill icon alternative
  CalendarStar,    // calendar-star → Calendar with star
  CalendarDays,    // calendar-month
  CalendarClock    // calendar-week
} from 'lucide-react'

const iconMap = {
  'grill': Flame,
  'calendar-star': CalendarStar,
  'calendar-month': CalendarDays,
  'calendar-week': CalendarClock,
}

export function GrillIcon({ name, size = 24 }: { name: string, size?: number }) {
  const Icon = iconMap[name] || Flame
  return <Icon size={size} />
}
```

**Alternative:** Use SVG sprites for custom grill icon matching brand.

### Accessibility Considerations

**ARIA Labels:**
```typescript
<button
  onClick={onInfoClick}
  aria-label={`Learn more about ${label}`}
  aria-describedby={`stat-${label}-description`}
>
  <InfoIcon />
</button>
```

**Keyboard Navigation:**
- Info buttons fully keyboard accessible (tab + enter)
- Modal dismissible with Escape key
- Focus trap within modal when open
- Focus returns to trigger button on close

**Screen Reader Support:**
```typescript
<div role="region" aria-label="BBQ Statistics">
  <h2 className="sr-only">Your BBQ Statistics</h2>
  {/* Stats grid */}
</div>
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
  .modal-enter {
    animation: none;
  }
}
```

### Error Handling

**Database Query Failures:**
```typescript
export async function getStatistics(): Promise<BBQStatistics> {
  try {
    const { data, error } = await supabase.rpc('get_bbq_statistics')

    if (error) {
      console.error('[Statistics] Database error:', error)
      // Return zeros rather than throwing
      return getDefaultStats()
    }

    return data
  } catch (err) {
    console.error('[Statistics] Unexpected error:', err)
    return getDefaultStats()
  }
}

function getDefaultStats(): BBQStatistics {
  return {
    totalSessions: 0,
    daysThisYear: 0,
    daysThisMonth: 0,
    daysThisWeek: 0
  }
}
```

**User Feedback:**
- Silent failure with default zeros (graceful degradation)
- Optional: Toast notification if database unreachable
- No blocking errors - page still renders

### Testing Considerations

**Unit Tests:**
```typescript
// __tests__/components/StatCard.test.tsx
describe('StatCard', () => {
  it('displays the stat value and label', () => {
    render(<StatCard icon="grill" value={42} label="Total Sessions" />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
  })

  it('shows empty state hint when value is 0', () => {
    render(<StatCard value={0} label="Days Grilled This Week" />)
    expect(screen.getByText(/Time to fire up the grill!/i)).toBeInTheDocument()
  })

  it('calls onInfoClick when info icon is clicked', () => {
    const handleClick = jest.fn()
    render(<StatCard onInfoClick={handleClick} />)
    fireEvent.click(screen.getByLabelText(/information/i))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

**Integration Tests:**
```typescript
// __tests__/app/profile/statistics.test.tsx
describe('Profile Statistics', () => {
  it('fetches and displays statistics on page load', async () => {
    // Mock Supabase response
    mockSupabase.rpc.mockResolvedValue({
      data: {
        totalSessions: 15,
        daysThisYear: 8,
        daysThisMonth: 3,
        daysThisWeek: 1
      }
    })

    render(<ProfilePage />)

    expect(await screen.findByText('15')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
```

**Manual Testing Checklist:**
- [ ] Statistics display correctly for user with sessions
- [ ] Empty state shows for new user
- [ ] Zero values display correctly for specific time periods
- [ ] Info modal opens and closes properly
- [ ] Responsive layout works on mobile and desktop
- [ ] Touch targets are appropriately sized (min 44x44px)
- [ ] Statistics update after creating/deleting session
- [ ] Week calculation correctly starts on Monday
- [ ] Month and year boundaries handled correctly
- [ ] Loading state displays before data loads

### Future Enhancements

**Phase 2 Features:**
1. **Trend Indicators:** Show up/down arrows comparing to previous period
2. **Progress Bars:** Visual representation of days grilled vs total days in period
3. **Achievements:** Unlock badges for milestones (10 sessions, 30-day streak, etc.)
4. **Charts:** Line chart showing grilling frequency over time
5. **Streak Tracking:** Current streak, longest streak
6. **Comparison Stats:** Average sessions per week/month
7. **Export:** Download statistics as CSV or share image

**Technical Debt Considerations:**
- If statistics grow complex, consider dedicated `/app/stats` route
- If queries become slow, add database indexes or materialized views
- If real-time updates needed, implement Supabase Realtime subscriptions
- Consider caching strategy for high-traffic scenarios

---

## Implementation Checklist

### Phase 1: Database & Backend

- [ ] Create `get_bbq_statistics` PostgreSQL function in Supabase
- [ ] Test function manually via Supabase SQL Editor
- [ ] Create `/app/actions/get-statistics.ts` server action
- [ ] Define `BBQStatistics` interface in `/types/statistics.ts`
- [ ] Add unit tests for server action

### Phase 2: Components

- [ ] Create `StatCard.tsx` component
- [ ] Create `StatsGrid.tsx` component
- [ ] Create `StatInfoModal.tsx` component
- [ ] Create `StatsEmptyState.tsx` component
- [ ] Install and configure `lucide-react` for icons
- [ ] Create icon mapping utility

### Phase 3: Integration

- [ ] Update `/app/profile/page.tsx` to fetch and display statistics
- [ ] Add statistics section below avatar
- [ ] Implement responsive grid layout
- [ ] Wire up info modal interactions
- [ ] Add loading skeleton state

### Phase 4: Polish & Testing

- [ ] Add accessibility labels and keyboard navigation
- [ ] Implement empty state handling
- [ ] Add error handling and fallback states
- [ ] Write component unit tests
- [ ] Test responsive design on multiple devices
- [ ] Verify statistics calculations with test data
- [ ] Check week boundary logic (Monday reset)
- [ ] Test with zero sessions, partial data, full data

### Phase 5: Documentation

- [ ] Update CLAUDE.md with statistics feature details
- [ ] Add JSDoc comments to components
- [ ] Document database function in migration notes
- [ ] Add usage examples to component files

---

## Success Metrics

**User Engagement:**
- 70%+ of users view statistics within first week
- 50%+ of users interact with info modals
- Statistics section increases session creation rate by 15%

**Technical Performance:**
- Statistics load in <200ms on profile page
- Database query executes in <50ms
- Zero client-side JavaScript for display (Server Components)
- Mobile-friendly with touch targets ≥44px

**Quality Assurance:**
- Zero reported calculation errors
- 100% accessibility compliance (WCAG 2.1 AA)
- Works on all modern browsers (Chrome, Safari, Firefox, Edge)
- Responsive design on screens 320px - 2560px wide

---

## Open Questions & Decisions

**Q1: Should week start on Sunday or Monday?**
**Decision:** Monday (ISO 8601 standard), matches most calendar apps, clear weekend distinction.

**Q2: Modal vs Tooltip for info display?**
**Recommendation:** Modal on mobile (tap), tooltip on desktop (hover), ensures accessibility.

**Q3: Should statistics auto-update when sessions change?**
**Decision:** No real-time updates initially. Use server-side revalidation (60s cache). Future: Supabase Realtime if demand.

**Q4: Show statistics on profile or dedicated page?**
**Decision:** Start on profile page. Migrate to `/stats` if feature expands significantly.

**Q5: How to handle users in different timezones?**
**Decision:** Use server's timezone (UTC) for consistency. Future: User timezone preference in profile settings.

**Q6: Display "0" or hide cards when no data?**
**Decision:** Show "0" with muted styling and hint text. Maintains visual consistency, clearer than hiding.

**Q7: Icon library choice?**
**Recommendation:** `lucide-react` - modern, tree-shakeable, similar to Material Icons, better Next.js integration than vector icons.

---

## Appendix: Code Samples

### Complete Profile Page Integration

```typescript
// app/profile/page.tsx
import { getStatistics } from '@/app/actions/get-statistics'
import { StatsGrid } from '@/components/StatsGrid'
import { StatsEmptyState } from '@/components/StatsEmptyState'

export default async function Profile() {
  const stats = await getStatistics()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[var(--background)]">
      <div className="w-full max-w-md p-8 space-y-8">
        {/* Existing avatar section */}
        <h1 className="text-2xl font-bold text-center">Profile</h1>
        <Avatar />

        {/* NEW: Statistics Section */}
        <section className="mt-8" aria-label="BBQ Statistics">
          <h2 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <GrillIcon name="grill" size={20} />
            Your BBQ Stats
          </h2>

          {stats.totalSessions === 0 ? (
            <StatsEmptyState />
          ) : (
            <StatsGrid stats={stats} />
          )}
        </section>

        {/* Existing sign out button */}
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  )
}
```

### Database Migration SQL

```sql
-- Migration: Add BBQ Statistics Function
-- File: supabase_migrations/add_statistics_function.sql

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_bbq_statistics(UUID);

-- Create optimized statistics function
CREATE OR REPLACE FUNCTION get_bbq_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_total_sessions INTEGER;
  v_days_this_year INTEGER;
  v_days_this_month INTEGER;
  v_days_this_week INTEGER;
  v_start_of_week DATE;
  v_end_of_week DATE;
BEGIN
  -- Calculate start and end of current week (Monday-Sunday)
  v_start_of_week := DATE_TRUNC('week', CURRENT_DATE);
  v_end_of_week := v_start_of_week + INTERVAL '7 days';

  -- Total sessions (all time)
  SELECT COUNT(*)
  INTO v_total_sessions
  FROM sessions
  WHERE user_id = p_user_id;

  -- Unique days this year
  SELECT COUNT(DISTINCT DATE(date))
  INTO v_days_this_year
  FROM sessions
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Unique days this month
  SELECT COUNT(DISTINCT DATE(date))
  INTO v_days_this_month
  FROM sessions
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE);

  -- Unique days this week (Monday - Sunday)
  SELECT COUNT(DISTINCT DATE(date))
  INTO v_days_this_week
  FROM sessions
  WHERE user_id = p_user_id
    AND date >= v_start_of_week
    AND date < v_end_of_week;

  -- Return as JSON
  RETURN json_build_object(
    'totalSessions', COALESCE(v_total_sessions, 0),
    'daysThisYear', COALESCE(v_days_this_year, 0),
    'daysThisMonth', COALESCE(v_days_this_month, 0),
    'daysThisWeek', COALESCE(v_days_this_week, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_bbq_statistics(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_bbq_statistics IS
  'Returns BBQ statistics for a user including total sessions and unique grilling days for current week, month, and year';
```

### TypeScript Type Definitions

```typescript
// types/statistics.ts

/**
 * BBQ Statistics for a user
 * Includes session counts and unique grilling day metrics
 */
export interface BBQStatistics {
  /** Total number of BBQ sessions ever created by user */
  totalSessions: number

  /** Number of unique calendar days with sessions in current year */
  daysThisYear: number

  /** Number of unique calendar days with sessions in current month */
  daysThisMonth: number

  /** Number of unique calendar days with sessions in current week (Mon-Sun) */
  daysThisWeek: number
}

/**
 * Stat type identifier for info modals
 */
export type StatType = 'total' | 'year' | 'month' | 'week'

/**
 * Info modal content mapping
 */
export interface StatInfo {
  title: string
  description: string
  calculation: string
}

export const STAT_INFO: Record<StatType, StatInfo> = {
  total: {
    title: 'Total BBQ Sessions',
    description: 'This is the total number of BBQ sessions you\'ve logged since joining BBQ Buddy. Each time you create a new session, this number increases by one. It represents your complete grilling history.',
    calculation: 'Counts all sessions ever created'
  },
  year: {
    title: 'Days Grilled This Year',
    description: 'This counts the number of unique days you\'ve grilled in the current calendar year (Jan 1 - Dec 31). If you grill multiple times in one day, it still counts as a single day. This metric resets to zero at the start of each year.',
    calculation: 'Unique days in current year'
  },
  month: {
    title: 'Days Grilled This Month',
    description: 'This counts the number of unique days you\'ve grilled in the current calendar month. Multiple BBQ sessions on the same day count as just one day. This metric resets to zero at the beginning of each month.',
    calculation: 'Unique days in current month'
  },
  week: {
    title: 'Days Grilled This Week',
    description: 'This counts the number of unique days you\'ve grilled in the current week (Monday through Sunday). Even if you have multiple BBQ sessions in a single day, it only counts as one day. This metric resets every Monday.',
    calculation: 'Unique days Mon-Sun this week'
  }
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-20 | BBQ Buddy Team | Initial requirements document |

---

**Document Status:** Ready for Implementation
**Priority:** High
**Estimated Effort:** 2-3 days (1 developer)
**Dependencies:** None (uses existing database schema)
**Risks:** Low (non-breaking addition to profile page)
