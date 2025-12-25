'use server'

import { createClient } from '@/utils/supabase/server'
import { FollowListItem } from '@/types/follow'

/**
 * Get list of users who follow a specific user
 *
 * @param targetUserId - The user ID whose followers to fetch
 * @returns Array of followers with profile information and follow status
 */
export async function getFollowersList(
  targetUserId: string
): Promise<FollowListItem[]> {
  const supabase = await createClient()

  // Get authenticated user (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch followers with profile information using a join
  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      follower_id,
      profiles!follows_follower_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('following_id', targetUserId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting followers list:', error)
    return []
  }

  // Filter out invalid profiles and map to FollowListItem format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const followers = (data || [])
    .filter((item: any) => item.profiles && item.profiles.username)
    .map((item: any) => ({
      id: item.profiles.id,
      username: item.profiles.username,
      avatar_url: item.profiles.avatar_url,
      is_following: false, // Will be set below if user is authenticated
    }))

  // If user is authenticated, check which followers the current user follows back
  if (user) {
    // Get list of users the current user follows
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const followingIds = new Set(
      (followingData || []).map((f: any) => f.following_id)
    )

    // Update is_following flag for each follower
    followers.forEach((follower) => {
      follower.is_following = followingIds.has(follower.id)
    })
  }

  return followers
}
