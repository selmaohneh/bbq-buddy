-- =============================================================================
-- BBQ Statistics Function Migration
-- =============================================================================
-- This migration adds a PostgreSQL function to efficiently calculate BBQ
-- statistics for a user. The function computes:
--   - Total sessions (all-time count)
--   - Unique days grilled this year
--   - Unique days grilled this month
--   - Unique days grilled this week (Monday-Sunday)
--
-- This function is OPTIONAL - the app will work without it using client-side
-- aggregation, but this provides a more efficient server-side alternative.
-- =============================================================================

-- Drop existing function if it exists (for idempotency)
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
  -- DATE_TRUNC('week', ...) returns Monday in PostgreSQL with ISO week
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
  'Returns BBQ statistics for a user including total sessions and unique grilling days for current week, month, and year. Week boundaries are Monday-Sunday (ISO week).';

-- =============================================================================
-- Verification Query (run after migration to test)
-- =============================================================================
-- Replace 'your-user-uuid-here' with an actual user ID to test:
--
-- SELECT get_bbq_statistics('your-user-uuid-here');
--
-- Expected output format:
-- {
--   "totalSessions": 10,
--   "daysThisYear": 5,
--   "daysThisMonth": 2,
--   "daysThisWeek": 1
-- }
-- =============================================================================
