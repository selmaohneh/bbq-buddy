-- Migration: Add meal_time column to sessions table
-- Description: Adds a nullable text column for storing meal time (Breakfast, Lunch, Dinner, Snack)
-- This migration is idempotent (safe to run multiple times)

-- Add meal_time column to sessions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sessions'
        AND column_name = 'meal_time'
    ) THEN
        ALTER TABLE sessions
        ADD COLUMN meal_time text;

        -- Add a check constraint to ensure only valid meal time values
        ALTER TABLE sessions
        ADD CONSTRAINT valid_meal_time
        CHECK (meal_time IS NULL OR meal_time IN ('Breakfast', 'Lunch', 'Dinner', 'Snack'));

        RAISE NOTICE 'Added meal_time column to sessions table';
    ELSE
        RAISE NOTICE 'meal_time column already exists in sessions table';
    END IF;
END $$;

-- Create index for potential future filtering by meal_time
CREATE INDEX IF NOT EXISTS idx_sessions_meal_time ON sessions(meal_time) WHERE meal_time IS NOT NULL;

-- Comment on the column for documentation
COMMENT ON COLUMN sessions.meal_time IS 'Optional meal time category: Breakfast, Lunch, Dinner, or Snack';
