# Grill Type Selection Feature

## Overview
The user should be able to select the grill types used for a BBQ session. This adds granular detail to the session data, allowing users to track what kind of equipment they used (e.g., Coal, Gas, Wood).

## Functional Requirements
1.  **Multi-selection:**
    -   Users can select zero, one, or multiple grill types.
    -   The selection is done via a "chip" or "tag" interface.

2.  **Predefined Options:**
    -   **Coal** (Icon: Flame/Coal representation)
    -   **Gas** (Icon: Gas Cylinder representation)
    -   **Wood** (Icon: Wood/Log representation)
    -   **Electric** (Icon: Zap/Electric representation)
    -   **Smoke** (Icon: Smoke/Cloud representation)

3.  **Custom "Other" Option:**
    -   There is always an **"Other"** chip at the end of the list.
    -   Clicking "Other" prompts the user (or switches UI) to enter a custom grill type text.
    -   Upon confirmation, the custom text appears as a new selected chip in the list (before the "Other" chip).
    -   The "Other" chip remains at the end to allow adding more custom types.
    -   Clicking a selected custom chip removes it.
    -   Custom chips behave identically to predefined chips once added (can be deselected/removed).

4.  **Data Persistence:**
    -   The selected grill types (both predefined and custom) must be saved with the session data in the database.
    -   Since the list can contain arbitrary strings, the data structure should likely be an array of strings (Text[] in Postgres).

5.  **Display:**
    -   **Session Form:** The selector appears in the session create/edit form.
    -   **Session List/Card:** The selected grill types should be visible in the session list view (e.g., as small tags or icons).

## UI/UX Design
-   **Style:** consistent with existing `WeatherSelector` or tags.
-   **Icons:** Use `lucide-react` icons that best match the grill types.
-   **Interaction:** Tapping a chip toggles selection. Tapping "Other" opens input.

## Technical Details
-   **Database:** Add `grill_types` column to `sessions` table (type: `text[]`).
-   **Migration:** Create a Supabase migration to add the column.
-   **Components:**
    -   Create `GrillTypeSelector.tsx`.
    -   Update `SessionForm.tsx`.
    -   Update `SessionCard.tsx` / `SessionList.tsx`.
-   **Server Actions:** Update CRUD operations to handle `grill_types`.
