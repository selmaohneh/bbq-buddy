'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateSession(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Extract Data
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const newImages = formData.getAll('newImages') as File[]
  const keptImages = formData.getAll('keptImages') as string[]

  if (!title || !date) {
    return { message: 'Title and Date are required' }
  }

  let updatedImageUrls = [...keptImages]

  try {
    // 2. Upload New Images
    const validNewImages = newImages.filter((img) => img.size > 0 && img.name !== 'undefined')

    for (const file of validNewImages) {
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
        
        updatedImageUrls.push(publicUrl)
      }
    }

    // 3. Update Session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        title,
        date,
        images: updatedImageUrls,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error details:', JSON.stringify(updateError, null, 2))
      return { message: 'Failed to update session. Please try again.' }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { message: 'An unexpected error occurred. Please try again.' }
  }

  revalidatePath('/')
  redirect('/')
}
