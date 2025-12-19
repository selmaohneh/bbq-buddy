# Feature: Meal Time Selection for BBQ Sessions

## Overview

The Meal Time Selection feature allows users to categorize their BBQ sessions by the time of day when the meal was served (Breakfast, Lunch, Dinner, or Snack). This feature enhances session organization and provides meaningful context for tracking BBQ habits and planning future cookouts. Users select exactly one meal time from a set of predefined options displayed as interactive tag-style chips in the SessionForm component (both create and edit flows). The selected value is persisted as a nullable `meal_time` text column in the PostgreSQL `sessions` table via Supabase, and the meal time badge is displayed on SessionCard components in the session list using a neutral gray color scheme (white background with gray border when unselected, gray background with white text when selected). The implementation follows the BBQ Buddy PWA's existing patterns using Next.js Server Actions for mutations, RLS policies for data security, and Tailwind CSS for styling.

## User Stories

- As a BBQ enthusiast, I want to select a meal time when creating a new session so that I can remember whether this was a breakfast, lunch, dinner, or snack cookout.

- As a user editing an existing session, I want to see my previously selected meal time highlighted in the form so that I can verify or change it if needed.

- As a user creating a session, I want to be able to deselect a meal time after selecting it so that I can leave this field empty if I change my mind.

- As a user viewing my session list, I want to see a meal time badge on each session card so that I can quickly identify when the BBQ took place without opening the full details.

- As a user, I want meal time to be an optional field so that I'm not forced to categorize every session if the timing wasn't significant.

- As a user browsing my sessions, I want the meal time badge to be visually distinct from other future tags (like meat types or weather) so that I can easily distinguish different types of metadata at a glance.

- As a user on mobile or desktop, I want the meal time tags to be touch/click-friendly and responsive so that selection is easy regardless of my device.

- As a database administrator, I want the meal time data stored as a text column in the sessions table so that it's queryable and can support future features like filtering sessions by meal time.

- As a user, I want the meal time tags to use colors that are readable and visually consistent with the app's dark theme.

- As a developer, I want the meal time field to be included in all session CRUD operations (create, read, update) so that data integrity is maintained across the application lifecycle.
