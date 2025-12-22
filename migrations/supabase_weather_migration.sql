-- Migration: Add weather_types column to sessions table
-- Description: Adds support for multi-select weather tagging on BBQ sessions
-- Date: 2025-12-19

-- Add weather_types column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS weather_types text[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sessions.weather_types IS 'Array of weather conditions during the BBQ session (Sunny, Cloudy, Windy, Rain, Snow)';

-- Verification query (uncomment to test)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'sessions' AND column_name = 'weather_types';
