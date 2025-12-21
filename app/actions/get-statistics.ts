'use server'

import { createClient } from '@/utils/supabase/server'
import { BBQStatistics } from '@/types/statistics'

/**
 * Default statistics returned when user is not authenticated or on error
 */
function getDefaultStats(): BBQStatistics {
  return {
    totalSessions: 0,
    daysThisYear: 0,
  }
}

/**
 * Fetches BBQ statistics for the currently authenticated user
 *
 * Statistics include:
 * - Total sessions (all-time count)
 * - Days grilled this year (unique days in current calendar year)
 *
 * Uses a single optimized query to fetch all sessions and calculate stats client-side.
 * Falls back to default (zero) values on error for graceful degradation.
 */
export async function getStatistics(): Promise<BBQStatistics> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return getDefaultStats()
    }

    // Get current year for filtering
    const now = new Date()
    const currentYear = now.getFullYear()

    // Fetch all session dates for this user in a single query
    // This is more efficient than multiple queries and allows client-side aggregation
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('date')
      .eq('user_id', user.id)

    if (error) {
      console.error('[Statistics] Database error:', error)
      return getDefaultStats()
    }

    if (!sessions || sessions.length === 0) {
      return getDefaultStats()
    }

    // Calculate statistics from session dates
    const totalSessions = sessions.length

    // Use Set to count unique dates for the current year
    const daysThisYear = new Set<string>()

    for (const session of sessions) {
      const dateStr = session.date
      const sessionDate = new Date(dateStr + 'T00:00:00') // Parse as local date
      const sessionYear = sessionDate.getFullYear()

      // Check if this year
      if (sessionYear === currentYear) {
        daysThisYear.add(dateStr)
      }
    }

    return {
      totalSessions,
      daysThisYear: daysThisYear.size,
    }
  } catch (err) {
    console.error('[Statistics] Unexpected error:', err)
    return getDefaultStats()
  }
}
