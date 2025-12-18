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
  console.log('[deleteAvatar] Called with avatarPath:', avatarPath, 'Type:', typeof avatarPath)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[deleteAvatar] User ID:', user?.id)

  if (!user) {
    console.log('[deleteAvatar] No user, redirecting to login')
    redirect('/login')
  }

  if (!avatarPath) {
    console.log('[deleteAvatar] No avatarPath provided, returning success (nothing to delete)')
    return { success: true } // Nothing to delete
  }

  // Security check: ensure the avatar path belongs to this user
  // Avatar filenames are formatted as: {user_id}-{random}.{ext}
  console.log('[deleteAvatar] Security check - avatarPath starts with user.id?', avatarPath.startsWith(user.id))
  if (!avatarPath.startsWith(user.id)) {
    console.error('[deleteAvatar] SECURITY FAIL: Attempted to delete avatar not owned by user:', avatarPath, 'User ID:', user.id)
    return { success: false, error: 'Unauthorized' }
  }

  try {
    console.log('[deleteAvatar] Attempting to delete from storage bucket "avatars", path:', avatarPath)

    const { data, error } = await supabase.storage
      .from('avatars')
      .remove([avatarPath])

    console.log('[deleteAvatar] Storage remove response - data:', data, 'error:', error)

    if (error) {
      console.error('[deleteAvatar] Storage delete error:', error)
      // Don't throw - file might already be deleted or not exist
      // This is a best-effort cleanup
      return { success: false, error: error.message }
    }

    console.log('[deleteAvatar] Avatar deleted successfully:', avatarPath)
    return { success: true }
  } catch (error) {
    console.error('[deleteAvatar] Unexpected error deleting avatar:', error)
    return { success: false, error: 'Unexpected error' }
  }
}
