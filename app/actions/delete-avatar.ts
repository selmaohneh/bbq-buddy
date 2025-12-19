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

    console.log('[deleteAvatar] Storage remove response - data:', JSON.stringify(data), 'error:', error)

    if (error) {
      console.error('[deleteAvatar] Storage delete error:', error)
      return { success: false, error: error.message }
    }

    // CRITICAL: Supabase Storage .remove() can return success even when deletion fails
    // due to RLS policies. We need to verify the file was actually deleted.
    // The data array should contain the deleted file objects.
    if (!data || data.length === 0) {
      console.error('[deleteAvatar] Storage delete returned empty data - file may not have been deleted')
      console.error('[deleteAvatar] This usually means RLS policies are blocking the delete.')
      console.error('[deleteAvatar] Please ensure the following SQL policy exists in Supabase:')
      console.error(`
        CREATE POLICY "Users can delete own avatar"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'avatars'
          AND (storage.foldername(name))[1] = auth.uid()::text
          OR name LIKE auth.uid()::text || '%'
        );
      `)
      return {
        success: false,
        error: 'Delete operation returned no data. RLS policy may be blocking deletion. Check server logs.'
      }
    }

    // Verify the expected file was in the deleted list
    const deletedFile = data.find((item: { name: string }) => item.name === avatarPath)
    if (!deletedFile) {
      console.error('[deleteAvatar] Expected file not found in deleted list. Data:', JSON.stringify(data))
      return { success: false, error: 'File was not in the deleted list' }
    }

    console.log('[deleteAvatar] Avatar deleted successfully:', avatarPath, 'Deleted item:', deletedFile)

    // Double-check by trying to get file info (should fail if deleted)
    const { data: checkData } = await supabase.storage
      .from('avatars')
      .list('', { search: avatarPath })

    const fileStillExists = checkData?.some((f: { name: string }) => f.name === avatarPath)
    if (fileStillExists) {
      console.error('[deleteAvatar] VERIFICATION FAILED: File still exists after delete!', avatarPath)
      return { success: false, error: 'File still exists after delete - RLS policy may be misconfigured' }
    }

    console.log('[deleteAvatar] Verification passed - file no longer exists in storage')
    return { success: true }
  } catch (error) {
    console.error('[deleteAvatar] Unexpected error deleting avatar:', error)
    return { success: false, error: 'Unexpected error' }
  }
}
