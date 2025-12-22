'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Follow a user
 *
 * @param followingId - UUID of the user to follow
 * @returns Result object with success status and optional error message
 */
export async function followUser(
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Prevent self-follow
  if (user.id === followingId) {
    return { success: false, error: 'Cannot follow yourself' }
  }

  // Create follow relationship
  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error) {
    console.error('Error following user:', error)
    // Check if it's a duplicate follow error
    if (error.code === '23505') {
      return { success: false, error: 'Already following this user' }
    }
    return { success: false, error: 'Failed to follow user' }
  }

  // Revalidate relevant paths to refresh cached data
  revalidatePath('/profile')
  revalidatePath(`/profile/${followingId}`)

  return { success: true }
}
