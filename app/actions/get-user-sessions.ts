'use server'

import { createClient } from '@/utils/supabase/server'
import { Session, MealTime, SessionWithProfile } from '@/types/session'

const PAGE_SIZE = 10

/**
 * Sorts sessions by date (DESC), then by meal time priority within each day.
 * Meal time order: Dinner > Snack > Lunch > Breakfast
 * Sessions without meal_time are mixed in by created_at timestamp.
 */
function sortSessionsByMealTime(sessions: SessionWithProfile[]): SessionWithProfile[] {
  return sessions.sort((a, b) => {
    // Primary sort: date DESC (most recent first)
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare

    // Secondary sort: meal_time priority within same date
    const getMealPriority = (mealTime: MealTime | null): number => {
      if (mealTime === 'Dinner') return 1
      if (mealTime === 'Snack') return 2
      if (mealTime === 'Lunch') return 3
      if (mealTime === 'Breakfast') return 4
      return 999 // null - will be handled by created_at
    }

    const priorityA = getMealPriority(a.meal_time)
    const priorityB = getMealPriority(b.meal_time)

    // If both have meal_time, sort by priority
    if (priorityA !== 999 && priorityB !== 999) {
      if (priorityA !== priorityB) return priorityA - priorityB
      // Same meal_time: sort by created_at DESC
      return b.created_at.localeCompare(a.created_at)
    }

    // If one or both don't have meal_time:
    // Sort by created_at DESC to "mix in" null values
    return b.created_at.localeCompare(a.created_at)
  })
}

/**
 * Fetches sessions for a specific user (for profile pages)
 * @param userId - The ID of the user whose sessions to fetch
 * @param page - The page number (0-indexed)
 * @returns SessionWithProfile[] - Sessions with profile information
 */
export async function getUserSessions(
  userId: string,
  page: number = 0
): Promise<SessionWithProfile[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      profiles!sessions_user_id_fkey (
        username,
        avatar_url
      )
    `
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching user sessions:', error)
    return []
  }

  // Flatten the profile data into the session object
  const sessionsWithProfile: SessionWithProfile[] = (data as any[]).map(
    (session) => ({
      ...session,
      username: session.profiles?.username || 'Unknown',
      avatar_url: session.profiles?.avatar_url || null,
      is_own_session: user?.id === session.user_id,
      // Remove the nested profiles object
      profiles: undefined,
    })
  )

  // Apply custom meal_time sorting
  return sortSessionsByMealTime(sessionsWithProfile)
}
