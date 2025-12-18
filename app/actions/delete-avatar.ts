'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Delete an avatar file from Supabase storage.
 * This should be called when:
 * 1. A user uploads a new avatar (to clean up the old one)
 * 2. A user removes their avatar entirely
 *
 * @param avatarPath - The storage path of the avatar to delete (e.g., "user-id-random.jpg")
 * @returns Object with success status and optional error message
 */
export async function deleteAvatar(avatarPath: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!avatarPath) {
    return { success: true } // Nothing to delete
  }

  // Security check: ensure the avatar path belongs to this user
  // Avatar filenames are formatted as: {user_id}-{random}.{ext}
  if (!avatarPath.startsWith(user.id)) {
    console.error('Attempted to delete avatar not owned by user:', avatarPath)
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([avatarPath])

    if (error) {
      console.error('Failed to delete avatar from storage:', error)
      // Don't throw - file might already be deleted or not exist
      // This is a best-effort cleanup
      return { success: false, error: error.message }
    }

    console.log('Avatar deleted successfully:', avatarPath)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting avatar:', error)
    return { success: false, error: 'Unexpected error' }
  }
}
