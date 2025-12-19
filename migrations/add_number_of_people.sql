-- Migration: Add number_of_people column to sessions table
-- Description: Enables tracking of how many people were fed during each BBQ session
-- Date: 2025-12-19

-- Add number_of_people column to sessions table
-- Default value is 1 (every session feeds at least one person)
-- NOT NULL constraint ensures a value is always present
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS number_of_people integer DEFAULT 1 NOT NULL;

-- Add check constraint to enforce minimum value at database level
-- This prevents invalid values (0 or negative) from being inserted
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'number_of_people_min'
    ) THEN
        ALTER TABLE sessions
        ADD CONSTRAINT number_of_people_min CHECK (number_of_people >= 1);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN sessions.number_of_people IS 'Number of people fed during this BBQ session (minimum 1)';

-- Update any existing rows that might have NULL values (safety measure)
-- This shouldn't be necessary due to DEFAULT, but explicit is safer
UPDATE sessions
SET number_of_people = 1
WHERE number_of_people IS NULL;

-- Verification queries (can be run manually to confirm migration success)
--
-- Verify column exists with correct properties:
-- SELECT
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'sessions' AND column_name = 'number_of_people';
--
-- Verify check constraint exists:
-- SELECT
--   conname AS constraint_name,
--   pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conname = 'number_of_people_min';
--
-- Test valid insert (should succeed):
-- INSERT INTO sessions (user_id, title, date, number_of_people)
-- VALUES ('test-user-id', 'Test Session', '2025-12-19', 5);
--
-- Test invalid insert (should fail with constraint violation):
-- INSERT INTO sessions (user_id, title, date, number_of_people)
-- VALUES ('test-user-id', 'Invalid Session', '2025-12-19', 0);
