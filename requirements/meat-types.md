# Meat Type Selection Feature

## Overview
The user should be able to select the meat types used for a BBQ session. This adds granular detail to the session data, allowing users to track what kind of meat they grilled (e.g., Beef, Pork, Chicken).

## Functional Requirements
1.  **Multi-selection:**
    -   Users can select zero, one, or multiple meat types.
    -   The selection is done via a "chip" or "tag" interface.

2.  **Predefined Options:**
    -   **Veggie**
    -   **Beef**
    -   **Pork**
    -   **Chicken**
    -   **Fish**

3.  **Custom "Other" Option:**
    -   There is always an **"Other"** chip at the end of the list.
    -   Clicking "Other" prompts the user (or switches UI) to enter a custom meat type text.
    -   Upon confirmation, the custom text appears as a new selected chip in the list (before the "Other" chip).
    -   The "Other" chip remains at the end to allow adding more custom types.
    -   Clicking a selected custom chip removes it.
    -   Custom chips behave identically to predefined chips once added (can be deselected/removed).

4.  **Data Persistence:**
    -   The selected meat types (both predefined and custom) must be saved with the session data in the database.
    -   Data structure: `meat_types` column (type: `text[]`).

5.  **Display:**
    -   **Session Form:** The selector appears in the session create/edit form, positioned between **Grill Types** and **Number of People**.
    -   **Session List/Card:** The selected meat types should be visible in the session list view as icons only (consistent with Weather and Grill Types).

## UI/UX Design
-   **Style:** Reddish chips/tags to distinguish from other categories.
-   **Icons:** Use `lucide-react` icons that best match the meat types.
-   **Interaction:** Tapping a chip toggles selection. Tapping "Other" opens input.

## Technical Details
-   **Database:** Add `meat_types` column to `sessions` table (type: `text[]`).
-   **Migration:** Create a Supabase migration to add the column.
-   **Components:**
    -   Create `MeatTypeSelector.tsx`.
    -   Create `MeatTypeTag.tsx`.
    -   Update `SessionForm.tsx`.
    -   Update `SessionCard.tsx` / `SessionList.tsx`.
-   **Server Actions:** Update CRUD operations to handle `meat_types`.
