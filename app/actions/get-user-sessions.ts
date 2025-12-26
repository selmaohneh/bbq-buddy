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

  if (!data || data.length === 0) {
    return []
  }

  // Extract session IDs for batch yummy queries
  const sessionIds = (data as any[]).map((s: any) => s.id)

  // Batch fetch yummy counts for all sessions (optimized - avoids N+1 query problem)
  const { data: yummyCounts } = await supabase
    .from('yummies')
    .select('session_id')
    .in('session_id', sessionIds)

  // Aggregate counts in memory
  const yummyCountMap = new Map<string, number>()
  yummyCounts?.forEach((yummy: any) => {
    const count = yummyCountMap.get(yummy.session_id) || 0
    yummyCountMap.set(yummy.session_id, count + 1)
  })

  // Batch fetch user's yummies for these sessions (if user is authenticated)
  let userYummySet = new Set<string>()
  if (user) {
    const { data: userYummies } = await supabase
      .from('yummies')
      .select('session_id')
      .in('session_id', sessionIds)
      .eq('user_id', user.id)

    userYummySet = new Set(userYummies?.map((y: any) => y.session_id))
  }

  // Flatten the profile data into the session object and add yummy data
  const sessionsWithProfile: SessionWithProfile[] = (data as any[]).map(
    (session) => {
      const isOwnSession = user?.id === session.user_id
      return {
        ...session,
        username: session.profiles?.username || 'Unknown',
        avatar_url: session.profiles?.avatar_url || null,
        is_own_session: isOwnSession,
        yummy_count: yummyCountMap.get(session.id) || 0,
        has_yummied: userYummySet.has(session.id),
        can_yummy: !isOwnSession && !!user,
        // Remove the nested profiles object
        profiles: undefined,
      }
    }
  )

  // Apply custom meal_time sorting
  return sortSessionsByMealTime(sessionsWithProfile)
}
