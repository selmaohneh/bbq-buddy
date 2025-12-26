'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Yummy a session (like/react to it)
 *
 * @param sessionId - The ID of the session to yummy
 * @returns Result object with success status and optional error message
 */
export async function yummySession(
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

  // Check if session exists and get owner
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { success: false, error: 'Session not found' }
  }

  // Prevent self-yummy
  if (user.id === session.user_id) {
    return { success: false, error: 'Cannot yummy your own session' }
  }

  // Create yummy relationship
  const { error } = await supabase.from('yummies').insert({
    user_id: user.id,
    session_id: sessionId,
  })

  if (error) {
    console.error('Error yummying session:', error)
    // Check if it's a duplicate yummy error
    if (error.code === '23505') {
      return { success: false, error: 'Already yummied this session' }
    }
    return { success: false, error: 'Failed to yummy session' }
  }

  // Revalidate relevant paths to refresh cached data
  revalidatePath('/')
  revalidatePath('/profile')

  return { success: true }
}
