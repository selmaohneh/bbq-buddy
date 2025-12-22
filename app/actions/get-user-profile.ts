'use server'

import { createClient } from '@/utils/supabase/server'
import { UserProfileWithStats } from '@/types/follow'

/**
 * Get a user's profile by ID with follow statistics and relationship status
 *
 * @param userId - UUID of the user to fetch
 * @returns User profile with stats, or null if not found
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfileWithStats | null> {
  const supabase = await createClient()

  // Get current authenticated user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch the target user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return null
  }

  // Get follower count (number of users following this profile)
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // Get following count (number of users this profile follows)
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  // Check if current user follows this profile (only if authenticated and not own profile)
  let isFollowing = false
  if (currentUser && currentUser.id !== userId) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId)
      .maybeSingle()

    isFollowing = !!followData
  }

  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at || new Date().toISOString(), // Fallback for existing users
    follower_count: followerCount || 0,
    following_count: followingCount || 0,
    is_following: isFollowing,
    is_own_profile: currentUser?.id === userId,
  }
}
