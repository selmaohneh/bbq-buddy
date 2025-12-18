'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createSession(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Extract Data
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const newImages = formData.getAll('newImages') as File[]

  if (!title || !date) {
    return { message: 'Title and Date are required' }
  }

  const imageUrls: string[] = []

  try {
    // 3. Upload Images
    const validImages = newImages.filter((img) => img.size > 0 && img.name !== 'undefined')

    for (const file of validImages) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('session-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('session-images')
          .getPublicUrl(fileName)
        
        imageUrls.push(publicUrl)
      }
    }

    // 4. Insert Session
    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        title,
        date,
        images: imageUrls,
      })

    if (insertError) {
      console.error('Insert error details:', JSON.stringify(insertError, null, 2))
      return { message: 'Failed to save session. Please try again.' }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { message: 'An unexpected error occurred. Please try again.' }
  }

  revalidatePath('/')
  redirect('/')
}
