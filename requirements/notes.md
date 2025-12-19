# Session Notes Feature

## Overview
Users should be able to add text notes to their BBQ sessions to record specific details, recipes, or observations.

## Functional Requirements
1.  **Read Notes:**
    -   At the bottom of the session form (Create/Edit), there is a section displaying the current notes.
    -   If no notes exist, a placeholder text (e.g., "Add any notes about your session...") is shown.

2.  **Edit Notes:**
    -   Clicking on the notes display area switches the view to an editing mode (or opens a modal/overlay).
    -   Users can type multi-line text.
    -   The user must be able to "save" or "confirm" the notes to update the local form state.

3.  **Data Persistence:**
    -   Notes are saved to the `sessions` table in the database.
    -   Column: `notes` (type: `text`, nullable).

4.  **Display:**
    -   Location: At the very end of the form, after "Number of People".
    -   Styling: Clean, readable text area. When in "read" mode, it should look like a text block.

## UI/UX Design
-   **Interaction:** 
    -   **Idle:** Shows text or placeholder.
    -   **Click:** Opens `NotesModal` or expands a `textarea`.
    -   **Save:** Updates the preview and closes the editor.
-   **Reference:** Similar to the old mobile app's "Notes" modal implementation but adapted for the web/PWA.

## Technical Details
-   **Database:** Add `notes` column to `sessions` table.
-   **Migration:** Create Supabase migration.
-   **Types:** Update `Session` interface.
-   **Components:**
    -   Update `SessionForm.tsx` to handle `notes` state.
    -   Create `NotesInput.tsx` (optional, or inline in Form) to handle the read/edit switch.
-   **Server Actions:** Update `create-session` and `update-session` to include `notes`.
