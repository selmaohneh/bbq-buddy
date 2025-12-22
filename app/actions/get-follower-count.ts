'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Get the number of followers for a user
 *
 * @param userId - UUID of the user
 * @returns Number of followers (0 on error)
 */
export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient()

  // Count followers using head request (more efficient)
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (error) {
    console.error('Error getting follower count:', error)
    return 0
  }

  return count || 0
}
