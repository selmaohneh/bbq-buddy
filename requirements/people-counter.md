# Feature: People Counter for BBQ Sessions

## Overview

The People Counter feature enables users to track how many people were fed during each BBQ session, providing valuable context for session planning and statistics. Implemented as a touch-friendly stepper control (increment/decrement buttons), this feature allows users to easily set the guest count with a minimum of 1 person. The component uses a horizontal layout with decrease (-) and increase (+) buttons flanking a centered numeric display, optimized for both desktop clicking and mobile touch interaction. The people count is stored as an integer in the database, displayed on session cards alongside other metadata, and can be used for future analytics features like calculating averages, totals, or identifying "party" sessions (10+ people). The stepper control uses the existing BBQ Buddy red-orange theme color (#D64933 / primary) for buttons and includes smart UX features like disabling the decrease button at the minimum value to prevent invalid inputs.

## User Stories

### Session Creation & Editing
- As a user creating a new BBQ session, I want to set the number of people I fed so that I can track guest counts over time
- As a user editing an existing session, I want to change the number of people so that I can correct or update the guest count
- As a user on the session form, I want to use increment/decrement buttons so that I can quickly adjust the number without typing
- As a user on mobile, I want large touch-friendly buttons so that I can easily tap to increase or decrease the count
- As a user, I want the decrease button to be disabled when I reach 1 person so that I cannot set an invalid count of 0 or negative
- As a user, I want visual feedback when the decrease button is disabled so that I understand why I cannot decrease further
- As a user, I want the number to be prominently displayed between the buttons so that I can clearly see the current count
- As a user, I want the people counter to default to 1 person when creating a new session so that I have a sensible starting point
- As a user editing a session, I want to see my previously set people count so that I can decide whether to change it
- As a user, I want the people counter field to be optional behavior-wise (no validation errors if left at default) so that I'm not forced to think about it

### Session List View
- As a user browsing my session list, I want to see the people count on each session card so that I can quickly understand the scale of each BBQ
- As a user viewing session cards, I want to see a people icon with the count so that I can recognize the metric at a glance
- As a user, I want the people count to use a gray color scheme so that it's visible but not distracting from primary information
- As a user with a session that fed many people, I want to see the exact count displayed (no truncation) so that I have accurate information
- As a user, I want the people count to be positioned logically with other metadata so that the card layout remains clean

### UX & Interaction
- As a user on desktop, I want to click the increment/decrement buttons smoothly so that I can adjust the count with my mouse
- As a user on mobile, I want to tap the buttons without mis-taps so that the touch targets are adequately sized
- As a user rapidly clicking/tapping increment, I want each press to register so that I can quickly reach higher numbers
- As a user who accidentally incremented too far, I want to easily decrement back to the correct value so that fixing mistakes is simple
- As a user, I want the stepper control to have consistent styling with the rest of the form so that the UI feels cohesive
- As a user, I want smooth transitions when buttons become enabled/disabled so that state changes don't feel jarring

### Future Analytics (Out of Scope for Initial Implementation)
- As a user, I want to see total people fed across all sessions so that I can understand my overall BBQ impact
- As a user, I want to see average people per session so that I can understand my typical BBQ size
- As a user, I want to identify "party" sessions (10+ people) so that I can revisit my biggest BBQs
- As a developer, I want people count data readily available so that future stats features are easy to build

## Technical Implementation Details

### Database Schema

**Table:** `sessions`
- Add new column: `number_of_people` (integer, default 1, not null)
- Type: PostgreSQL integer
- Default value: 1 (every session feeds at least one person)
- Not nullable (always has a value)

**Migration SQL:**
```sql
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS number_of_people integer DEFAULT 1 NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sessions.number_of_people IS 'Number of people fed during this BBQ session (minimum 1)';

-- Optional: Add check constraint to ensure minimum value at database level
ALTER TABLE sessions
ADD CONSTRAINT number_of_people_min CHECK (number_of_people >= 1);
```

**Example Data:**
```sql
-- Single person
number_of_people = 1

-- Small gathering
number_of_people = 4

-- Party
number_of_people = 15
```

### Type Definitions

**File:** `types/session.ts`

Update Session interface:
```typescript
export interface Session {
  id: string;
  user_id: string;
  title: string;
  date: string;
  meal_time: MealTime | null;
  weather_types: WeatherType[] | null;
  number_of_people: number; // NEW FIELD - defaults to 1
  images: string[];
  created_at: string;
}
```

**Default Value Constant:**
```typescript
export const DEFAULT_NUMBER_OF_PEOPLE = 1;
export const MIN_NUMBER_OF_PEOPLE = 1;
```

### Component Architecture

#### 1. NumberControl Component (NEW)

**File:** `components/NumberControl.tsx`

Touch-friendly stepper control with increment/decrement buttons.

```typescript
'use client'

import { Minus, Plus } from 'lucide-react'

interface NumberControlProps {
  value: number
  onChange: (value: number)
  min?: number
}

export function NumberControl({ value, onChange, min = 1 }: NumberControlProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  const isAtMinimum = value <= min

  return (
    <div className="inline-flex items-center h-12 border border-border rounded-xl bg-foreground/5">
      {/* Decrease Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMinimum}
        className={`
          flex items-center justify-center w-12 h-12 rounded-l-xl
          transition-all duration-150
          ${isAtMinimum
            ? 'text-foreground/30 cursor-not-allowed'
            : 'text-primary hover:bg-primary/10 active:bg-primary/20'
          }
        `}
        aria-label="Decrease number of people"
      >
        <Minus className="w-5 h-5" />
      </button>

      {/* Value Display */}
      <div className="flex items-center justify-center min-w-[60px] px-4 text-center">
        <span className="text-lg font-semibold text-foreground">
          {value}
        </span>
      </div>

      {/* Increase Button */}
      <button
        type="button"
        onClick={handleIncrement}
        className="
          flex items-center justify-center w-12 h-12 rounded-r-xl
          text-primary hover:bg-primary/10 active:bg-primary/20
          transition-all duration-150
        "
        aria-label="Increase number of people"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}
```

**Key Features:**
- **Height:** 48px (h-12) for good touch target size
- **Button size:** 48x48px square touch targets
- **Icons:** Lucide React Minus and Plus (20px / w-5 h-5)
- **Disabled state:** Decrease button disabled at minimum value
  - Gray text color (`text-foreground/30`)
  - Cursor not-allowed
  - No hover effects
- **Active state:** Primary color (`text-primary`)
  - Hover: `bg-primary/10` (light red-orange background)
  - Active/pressed: `bg-primary/20` (darker red-orange)
- **Value display:** Center area with min-width 60px, expandable for large numbers
- **Rounded corners:** xl border radius on container, buttons rounded on their respective sides
- **Border:** Consistent with other form controls (`border-border`)
- **Background:** Subtle gray (`bg-foreground/5`)

**Accessibility:**
- Button type="button" to prevent form submission
- aria-label on buttons for screen readers
- Visual and functional disabled state
- Clear focus indicators (inherited from Tailwind defaults)

#### 2. PeopleCountTag Component (NEW)

**File:** `components/PeopleCountTag.tsx`

Display component for showing people count on session cards.

```typescript
import { Users } from 'lucide-react'

interface PeopleCountTagProps {
  count: number
}

export function PeopleCountTag({ count }: PeopleCountTagProps) {
  return (
    <div className="inline-flex items-center gap-1 text-xs text-foreground/60">
      <Users className="w-3.5 h-3.5" />
      <span className="font-medium">{count}</span>
    </div>
  )
}
```

**Key Features:**
- Icon-only style (no background chip)
- Users icon from Lucide React (14px / w-3.5 h-3.5)
- Gray text color (`text-foreground/60`) for subtlety
- Small font (text-xs)
- Minimal spacing (gap-1 = 4px)
- Font-medium weight for readability

**Reasoning:**
- Simpler than a full chip (less visual weight)
- Consistent with date display pattern on cards
- Gray color differentiates from primary content
- Small and unobtrusive

### SessionForm Integration

**File:** `components/SessionForm.tsx`

Add people counter to the form.

**Changes Required:**

1. **Import statements:**
```typescript
import { NumberControl } from '@/components/NumberControl'
import { Session, MealTime, WeatherType, DEFAULT_NUMBER_OF_PEOPLE } from '@/types/session'
```

2. **Add state (after weatherTypes state):**
```typescript
const [numberOfPeople, setNumberOfPeople] = useState<number>(
  initialData?.number_of_people || DEFAULT_NUMBER_OF_PEOPLE
)
```

3. **Update clientAction to include people count:**
```typescript
const clientAction = (formData: FormData) => {
  // ... existing code

  // Append number of people
  formData.append('numberOfPeople', numberOfPeople.toString())

  formAction(formData)
}
```

4. **Add number control to form (after Weather section):**
```typescript
{/* Number of People */}
<div className="flex flex-col gap-2">
  <label className="font-semibold text-foreground/80">
    Number of People
  </label>
  <NumberControl
    value={numberOfPeople}
    onChange={setNumberOfPeople}
    min={MIN_NUMBER_OF_PEOPLE}
  />
</div>
```

**Form Order:**
1. Title
2. Date
3. Meal Time
4. Weather
5. **Number of People** (NEW - positioned here)
6. Photos

### SessionCard Integration

**File:** `components/SessionCard.tsx`

Display people count alongside date and other metadata.

**Changes Required:**

1. **Import PeopleCountTag:**
```typescript
import { PeopleCountTag } from '@/components/PeopleCountTag'
```

2. **Add people count display after date (around line 69):**
```typescript
<time className="text-sm text-foreground/60 font-medium flex items-center gap-1.5">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
  </svg>
  {dateString}
</time>

{/* People Count */}
<PeopleCountTag count={session.number_of_people} />
```

**Visual Result:**
- Date on its own line with calendar icon
- People count on next line with users icon
- Both use similar gray styling for consistency
- Minimal visual weight, easy to scan

**Alternative Layout (if preferred):**
Could also place people count on same line as date, separated by bullet:
```typescript
<div className="text-sm text-foreground/60 font-medium flex items-center gap-2">
  <span className="flex items-center gap-1.5">
    <CalendarIcon />
    {dateString}
  </span>
  <span>•</span>
  <PeopleCountTag count={session.number_of_people} />
</div>
```

### Server Actions Updates

#### create-session.ts

**File:** `app/actions/create-session.ts`

Add people count handling to session creation.

**Changes Required:**

```typescript
export async function createSession(prevState: any, formData: FormData) {
  // ... existing auth

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const mealTimeRaw = formData.get('mealTime') as string
  const mealTime = mealTimeRaw && mealTimeRaw.trim() !== '' ? mealTimeRaw : null

  // Parse weather types
  const weatherTypesRaw = formData.get('weatherTypes') as string
  let weatherTypes: string[] | null = null
  if (weatherTypesRaw) {
    try {
      const parsed = JSON.parse(weatherTypesRaw)
      weatherTypes = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error('Failed to parse weather types:', e)
    }
  }

  // NEW: Parse number of people
  const numberOfPeopleRaw = formData.get('numberOfPeople') as string
  const numberOfPeople = numberOfPeopleRaw ? parseInt(numberOfPeopleRaw, 10) : 1

  // Validate minimum value
  if (numberOfPeople < 1) {
    return { message: 'Number of people must be at least 1' }
  }

  // ... image upload logic

  // Insert session
  const { error: insertError } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      title,
      date,
      meal_time: mealTime,
      weather_types: weatherTypes,
      number_of_people: numberOfPeople, // NEW FIELD
      images: imageUrls,
    })

  // ... rest of function
}
```

#### update-session.ts

**File:** `app/actions/update-session.ts`

Add people count handling to session updates.

**Changes Required:**

```typescript
export async function updateSession(sessionId: string, prevState: any, formData: FormData) {
  // ... existing auth

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const mealTimeRaw = formData.get('mealTime') as string
  const mealTime = mealTimeRaw && mealTimeRaw.trim() !== '' ? mealTimeRaw : null

  // Parse weather types
  const weatherTypesRaw = formData.get('weatherTypes') as string
  let weatherTypes: string[] | null = null
  if (weatherTypesRaw) {
    try {
      const parsed = JSON.parse(weatherTypesRaw)
      weatherTypes = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error('Failed to parse weather types:', e)
    }
  }

  // NEW: Parse number of people
  const numberOfPeopleRaw = formData.get('numberOfPeople') as string
  const numberOfPeople = numberOfPeopleRaw ? parseInt(numberOfPeopleRaw, 10) : 1

  // Validate minimum value
  if (numberOfPeople < 1) {
    return { message: 'Number of people must be at least 1' }
  }

  // ... image logic

  // Update session
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      title,
      date,
      meal_time: mealTime,
      weather_types: weatherTypes,
      number_of_people: numberOfPeople, // NEW FIELD
      images: updatedImageUrls,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  // ... rest of function
}
```

### Styling & UX Details

**NumberControl Styling Breakdown:**

**Container:**
- Height: `h-12` (48px - good touch target)
- Border: `border border-border` (consistent with form inputs)
- Border radius: `rounded-xl` (12px)
- Background: `bg-foreground/5` (subtle gray)
- Display: `inline-flex items-center`

**Buttons:**
- Size: `w-12 h-12` (48x48px square)
- Color: `text-primary` (#D64933 red-orange)
- Hover: `hover:bg-primary/10` (light red-orange tint)
- Active: `active:bg-primary/20` (darker red-orange tint)
- Disabled: `text-foreground/30` (light gray)
- Transition: `transition-all duration-150`
- Border radius: Left button `rounded-l-xl`, right button `rounded-r-xl`

**Icons:**
- Size: `w-5 h-5` (20px)
- Lucide React Minus and Plus
- Inherit button text color

**Value Display:**
- Min-width: `min-w-[60px]` (accommodates 1-2 digit numbers)
- Padding: `px-4` (expands for larger numbers)
- Text: `text-lg font-semibold` (18px, bold)
- Color: `text-foreground` (high contrast)
- Alignment: `text-center`

**Touch Target Compliance:**
- Buttons: 48x48px (exceeds 44x44px WCAG minimum)
- Adequate spacing between buttons (value display provides separation)
- No overlapping touch areas

**PeopleCountTag Styling:**

- Display: `inline-flex items-center gap-1`
- Icon: `w-3.5 h-3.5` (14px)
- Text: `text-xs font-medium` (12px)
- Color: `text-foreground/60` (60% opacity gray)
- Gap: `gap-1` (4px between icon and text)

**Color Scheme:**

Primary theme color (from existing app):
- `--primary`: #D64933 (red-orange BBQ theme)
- Active buttons use this color
- Consistent with other primary actions in the app

Disabled/secondary:
- `text-foreground/30`: Very light gray for disabled state
- `text-foreground/60`: Medium gray for non-primary info (tag display)

### Edge Cases & Error Handling

1. **Minimum Value Enforcement:**
   - Client-side: Decrease button disabled at min value (1)
   - Server-side: Validation in server actions returns error if < 1
   - Database-level: CHECK constraint ensures no invalid data
   - Prevents: 0 or negative people counts

2. **Maximum Value:**
   - No maximum enforced (can increment indefinitely)
   - Rationale: Large events (50+, 100+ people) are valid
   - Value display expands with min-width to accommodate large numbers

3. **Non-Integer Input:**
   - Not applicable (no text input, only button controls)
   - Server-side: parseInt() handles conversion from string
   - Invalid parse defaults to 1

4. **Empty/Null Values:**
   - Default value: 1 person (DEFAULT_NUMBER_OF_PEOPLE constant)
   - Database default: 1 (NOT NULL constraint)
   - Form initialization: `initialData?.number_of_people || 1`

5. **Legacy Sessions Without People Count:**
   - Database migration sets default to 1 for existing rows
   - No null handling needed (NOT NULL constraint)

6. **Rapid Button Clicking:**
   - Each click increments/decrements by exactly 1
   - No debouncing needed (simple state update)
   - Smooth for both slow and rapid interaction

7. **Form State Persistence:**
   - Edit mode: Load existing `number_of_people` from session
   - Create mode: Initialize to 1
   - Unsaved changes: Lost on navigation (same as other fields)

8. **Accessibility Edge Cases:**
   - Keyboard users can tab to buttons and press Enter/Space
   - Screen readers announce current value and button state
   - Disabled button state announced properly

### Performance Considerations

1. **Component Rendering:**
   - Simple state update (single number)
   - No expensive calculations
   - Minimal re-renders (only on value change)

2. **Database Operations:**
   - Single integer column (efficient storage)
   - No joins required
   - Indexing not needed (not queried for filtering)

3. **Bundle Size:**
   - Two Lucide icons: ~200 bytes total
   - Component code: ~1KB
   - Minimal impact

### Accessibility

1. **Keyboard Navigation:**
   - Buttons focusable via Tab
   - Enter/Space to activate buttons
   - Clear focus indicators

2. **Screen Readers:**
   - aria-label on buttons describes action
   - Disabled state announced
   - Current value readable

3. **Touch Targets:**
   - 48x48px buttons (exceeds WCAG 44x44px minimum)
   - Adequate spacing between interactive elements

4. **Visual Feedback:**
   - Disabled state clearly visible (light gray)
   - Hover states provide feedback
   - Active/pressed states confirm interaction

### Testing Scenarios

1. **Component Interaction:**
   - [ ] Click + button → count increases by 1
   - [ ] Click - button → count decreases by 1
   - [ ] Click - button at minimum (1) → button disabled, count stays at 1
   - [ ] Rapidly click + button → each click registers, count increases smoothly
   - [ ] Hover over enabled button → background color changes
   - [ ] Click + button multiple times → can reach large numbers (20+, 50+)

2. **Form Integration:**
   - [ ] Create new session → people count defaults to 1
   - [ ] Set people count to 5 → save session → count persists
   - [ ] Edit session with count 3 → form shows 3
   - [ ] Change count from 3 to 7 → save → updated count persists
   - [ ] Leave people count at default 1 → save → count is 1 in database

3. **Session Card Display:**
   - [ ] Session with 1 person → shows "1" with users icon
   - [ ] Session with 10 people → shows "10" with users icon
   - [ ] Session with 50 people → shows "50" with users icon (no truncation)
   - [ ] People count icon displays correctly (gray, small size)
   - [ ] People count positioned logically with date

4. **Data Persistence:**
   - [ ] Create session with 5 people → refresh page → count persists
   - [ ] Edit session from 5 to 8 people → navigate away → return → count is 8
   - [ ] Integer stored correctly in PostgreSQL
   - [ ] Retrieved correctly from database

5. **Edge Cases:**
   - [ ] Attempt to decrease below 1 → button disabled, count stays 1
   - [ ] Set count to very large number (999) → saves and displays correctly
   - [ ] Server validation rejects count < 1 → error message shown
   - [ ] Default value 1 applied when creating new session

6. **Responsive Design:**
   - [ ] NumberControl displays correctly on mobile (320px width)
   - [ ] Touch targets adequate for mobile interaction (48px)
   - [ ] Value display doesn't overflow on narrow screens
   - [ ] PeopleCountTag readable on mobile session cards

7. **Accessibility:**
   - [ ] Tab key navigates to +/- buttons
   - [ ] Enter/Space activates buttons
   - [ ] Screen reader announces current value and button states
   - [ ] Disabled button state announced correctly
   - [ ] Focus indicators visible on buttons

## Implementation Checklist

### Phase 1: Database & Types
- [ ] Create database migration to add `number_of_people` column
- [ ] Add CHECK constraint for minimum value (>= 1)
- [ ] Run migration in Supabase SQL editor
- [ ] Verify migration with test query
- [ ] Add `number_of_people: number` to Session interface in `types/session.ts`
- [ ] Add DEFAULT_NUMBER_OF_PEOPLE and MIN_NUMBER_OF_PEOPLE constants

### Phase 2: Components
- [ ] Create `components/NumberControl.tsx` component
- [ ] Import Minus and Plus icons from Lucide React
- [ ] Implement increment/decrement logic
- [ ] Implement disabled state for decrease button at minimum
- [ ] Apply primary color styling (red-orange theme)
- [ ] Test component in isolation with various values

- [ ] Create `components/PeopleCountTag.tsx` component
- [ ] Import Users icon from Lucide React
- [ ] Implement simple icon + number display
- [ ] Apply gray styling for subtlety
- [ ] Test component with various counts

### Phase 3: SessionForm Integration
- [ ] Import `NumberControl` in `components/SessionForm.tsx`
- [ ] Add state: `useState<number>` with default value 1
- [ ] Initialize state from `initialData?.number_of_people` or default
- [ ] Add NumberControl section to form (after Weather)
- [ ] Update `clientAction` to append numberOfPeople as string
- [ ] Test form with people count (create mode)
- [ ] Test form with people count (edit mode)

### Phase 4: SessionCard Integration
- [ ] Import `PeopleCountTag` in `components/SessionCard.tsx`
- [ ] Add people count display after date
- [ ] Test display with various counts (1, 5, 20, 100)
- [ ] Verify responsive layout
- [ ] Verify icon and styling consistency

### Phase 5: Server Actions
- [ ] Update `app/actions/create-session.ts` to parse `numberOfPeople` from FormData
- [ ] Add parseInt() conversion and default to 1
- [ ] Add validation: return error if < 1
- [ ] Update session insert to include `number_of_people` field
- [ ] Update `app/actions/update-session.ts` with same parsing logic
- [ ] Update session update to include `number_of_people` field
- [ ] Test create with people count via API/database inspection
- [ ] Test update with people count via API/database inspection

### Phase 6: Testing & Validation
- [ ] Test all scenarios in Testing Scenarios section
- [ ] Verify minimum value enforcement (button disabled at 1)
- [ ] Verify large numbers work correctly (50+, 100+)
- [ ] Test on mobile devices (touch interaction)
- [ ] Test keyboard navigation and accessibility
- [ ] Verify database correctly stores integer values
- [ ] Test default value behavior for new sessions

### Phase 7: Polish & Documentation
- [ ] Ensure consistent styling with other form controls
- [ ] Verify hover states and transitions smooth
- [ ] Test touch target sizing on mobile (48px minimum)
- [ ] Update CLAUDE.md with people counter documentation
- [ ] Add code comments for business logic
- [ ] Verify no console errors or warnings
- [ ] Final visual review on desktop and mobile

## Future Enhancements (Out of Scope)

These features are **not** included in the initial implementation but could be added later:

1. **Statistics Dashboard:**
   - Total people fed across all sessions
   - Average people per session
   - "Party Sessions" count (10+ people threshold)
   - Dedicated stats card with people icon

2. **People-Based Filtering:**
   - Filter sessions by people count range
   - "Small gatherings" (1-3), "Medium" (4-9), "Large parties" (10+)
   - Combine with other filters

3. **People-Specific Recommendations:**
   - Suggest recipes based on guest count
   - "Best for large groups" tags on sessions
   - Portion size calculations

4. **Shareable Session View:**
   - Include people count in shared session cards
   - Grammar-aware text (1 "person" vs 5 "people")

5. **Input Validation Enhancements:**
   - Maximum value cap (e.g., 999)
   - Keyboard number input (0-9 keys to type value)
   - Clear/reset button

6. **Advanced UX:**
   - Long-press for rapid increment/decrement
   - Preset buttons (2, 4, 6, 8 people)
   - Custom increment step (e.g., +5 for large events)

## Migration Strategy

**Backward Compatibility:**
- Existing sessions get default value of 1 person via migration
- No data loss (additive feature)
- All existing sessions remain functional

**Rollback Plan:**
- Remove column: `ALTER TABLE sessions DROP COLUMN number_of_people;`
- Remove frontend components
- Revert type definitions
- No cascade issues (not used in relations)

**Database Migration:**
```sql
-- Add number_of_people column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS number_of_people integer DEFAULT 1 NOT NULL;

-- Add check constraint to enforce minimum value
ALTER TABLE sessions
ADD CONSTRAINT number_of_people_min CHECK (number_of_people >= 1);

-- Add comment for documentation
COMMENT ON COLUMN sessions.number_of_people IS 'Number of people fed during this BBQ session (minimum 1)';

-- Update existing rows to have default value (should auto-apply via DEFAULT, but explicit is safe)
UPDATE sessions
SET number_of_people = 1
WHERE number_of_people IS NULL;
```

**Verification Query:**
```sql
-- Verify column exists with correct properties
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name = 'number_of_people';

-- Verify check constraint exists
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'number_of_people_min';

-- Test insert with valid value
INSERT INTO sessions (user_id, title, date, number_of_people)
VALUES (
  'test-user-id',
  'Test Session',
  '2025-12-19',
  5
);

-- Test that constraint prevents invalid value (should fail)
INSERT INTO sessions (user_id, title, date, number_of_people)
VALUES (
  'test-user-id',
  'Invalid Session',
  '2025-12-19',
  0  -- Should violate constraint
);

-- Verify data
SELECT id, title, number_of_people FROM sessions WHERE title = 'Test Session';
```
