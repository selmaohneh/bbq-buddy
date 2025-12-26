'use server'

import { createClient } from '@/utils/supabase/server'
import { YummyListItem } from '@/types/yummy'

/**
 * Get list of users who yummied a specific session
 *
 * @param sessionId - The session ID whose yummies to fetch
 * @returns Array of users with profile information
 */
export async function getYummiesList(
  sessionId: string
): Promise<YummyListItem[]> {
  const supabase = await createClient()

  // Fetch yummies with profile information using a join
  const { data, error } = await supabase
    .from('yummies')
    .select(
      `
      user_id,
      profiles!yummies_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting yummies list:', error)
    return []
  }

  // Filter out invalid profiles and map to YummyListItem format
  const yummies = (data || [])
    .filter((item: any) => item.profiles && item.profiles.username)
    .map((item: any) => ({
      id: item.profiles.id,
      username: item.profiles.username,
      avatar_url: item.profiles.avatar_url,
    }))

  return yummies
}
