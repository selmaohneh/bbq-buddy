'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Unyummy a session (remove yummy/reaction)
 *
 * @param sessionId - The ID of the session to unyummy
 * @returns Result object with success status and optional error message
 */
export async function unyummySession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Delete yummy relationship
  const { error } = await supabase
    .from('yummies')
    .delete()
    .eq('user_id', user.id)
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error unyummying session:', error)
    return { success: false, error: 'Failed to unyummy session' }
  }

  // Revalidate relevant paths to refresh cached data
  revalidatePath('/')
  revalidatePath('/profile')

  return { success: true }
}
