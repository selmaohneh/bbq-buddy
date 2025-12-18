'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function deleteSession(id: string, imageUrls: string[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Delete images from storage
  if (imageUrls && imageUrls.length > 0) {
    const pathsToRemove = imageUrls.map(url => {
        // Extract path from URL
        // Example: https://xyz.supabase.co/storage/v1/object/public/session-images/uid/file.jpg
        // We want: uid/file.jpg
        try {
            const urlObj = new URL(url)
            const parts = urlObj.pathname.split('/session-images/')
            return parts.length > 1 ? decodeURIComponent(parts[1]) : null
        } catch (e) {
            return null
        }
    }).filter(path => path !== null) as string[]

    if (pathsToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('session-images')
            .remove(pathsToRemove)
        
        if (storageError) {
            console.error('Failed to remove images from storage:', storageError)
            // We continue to delete the session record anyway
        }
    }
  }

  // 2. Delete session record
  const { error: deleteError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // RLS handles this too, but good for safety

  if (deleteError) {
    console.error('Delete session error:', deleteError)
    throw new Error('Failed to delete session')
  }

  revalidatePath('/')
  redirect('/')
}
