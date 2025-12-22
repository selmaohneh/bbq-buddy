'use server'

import { createClient } from '@/utils/supabase/server'
import { UserSearchResult } from '@/types/follow'

/**
 * Search for users by username (partial match, case-insensitive)
 * Excludes the current user from results
 *
 * @param query - Search term (minimum 2 characters)
 * @returns Array of matching users (max 20 results)
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  // Return empty array if query is too short
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Search for users by username (case-insensitive partial match)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${query.trim()}%`)
    .neq('id', user.id) // Exclude current user
    .limit(20)
    .order('username', { ascending: true })

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  // Filter out profiles without usernames
  return (data || []).filter((profile) => profile.username) as UserSearchResult[]
}
