'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Unfollow a user
 *
 * @param followingId - UUID of the user to unfollow
 * @returns Result object with success status and optional error message
 */
export async function unfollowUser(
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

  // Delete follow relationship
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    console.error('Error unfollowing user:', error)
    return { success: false, error: 'Failed to unfollow user' }
  }

  // Revalidate relevant paths to refresh cached data
  revalidatePath('/profile')
  revalidatePath(`/profile/${followingId}`)

  return { success: true }
}
