'use server'

import { createClient } from '@/utils/supabase/server'
import { FollowListItem } from '@/types/follow'

/**
 * Get list of users that the current user follows
 *
 * @returns Array of followed users with profile information
 */
export async function getFollowingList(): Promise<FollowListItem[]> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Fetch follows with profile information using a join
  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      following_id,
      profiles!follows_following_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting following list:', error)
    return []
  }

  // Filter out invalid profiles and map to FollowListItem format
  return (data || [])
    .filter((item) => item.profiles && item.profiles.username)
    .map((item) => ({
      id: item.profiles.id,
      username: item.profiles.username!,
      avatar_url: item.profiles.avatar_url,
      is_following: true, // By definition, all these users are being followed
    }))
}
