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
    daysThisMonth: 0,
    daysThisWeek: 0,
  }
}

/**
 * Fetches BBQ statistics for the currently authenticated user
 *
 * Statistics include:
 * - Total sessions (all-time count)
 * - Days grilled this year (unique days in current calendar year)
 * - Days grilled this month (unique days in current calendar month)
 * - Days grilled this week (unique days Mon-Sun in current week)
 *
 * Uses a single optimized query with subqueries to minimize database round-trips.
 * Falls back to default (zero) values on error for graceful degradation.
 */
export async function getStatistics(): Promise<BBQStatistics> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return getDefaultStats()
    }

    // Calculate date boundaries for the current week (Monday-Sunday)
    const now = new Date()
    const currentDay = now.getDay()
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday = 0, so adjust: (day + 6) % 7
    const daysSinceMonday = (currentDay + 6) % 7

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - daysSinceMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() is 0-indexed

    // Format dates for SQL comparison (YYYY-MM-DD)
    const weekStartStr = startOfWeek.toISOString().split('T')[0]
    const weekEndStr = endOfWeek.toISOString().split('T')[0]

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

    // Use Sets to count unique dates for each period
    const daysThisYear = new Set<string>()
    const daysThisMonth = new Set<string>()
    const daysThisWeek = new Set<string>()

    for (const session of sessions) {
      const dateStr = session.date
      const sessionDate = new Date(dateStr + 'T00:00:00') // Parse as local date
      const sessionYear = sessionDate.getFullYear()
      const sessionMonth = sessionDate.getMonth() + 1

      // Check if this year
      if (sessionYear === currentYear) {
        daysThisYear.add(dateStr)

        // Check if this month (already confirmed same year)
        if (sessionMonth === currentMonth) {
          daysThisMonth.add(dateStr)
        }
      }

      // Check if this week (date string comparison)
      if (dateStr >= weekStartStr && dateStr < weekEndStr) {
        daysThisWeek.add(dateStr)
      }
    }

    return {
      totalSessions,
      daysThisYear: daysThisYear.size,
      daysThisMonth: daysThisMonth.size,
      daysThisWeek: daysThisWeek.size,
    }
  } catch (err) {
    console.error('[Statistics] Unexpected error:', err)
    return getDefaultStats()
  }
}
