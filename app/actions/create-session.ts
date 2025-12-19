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
  const mealTimeRaw = formData.get('mealTime') as string
  const mealTime = mealTimeRaw && mealTimeRaw.trim() !== '' ? mealTimeRaw : null

  // Parse weather types
  const weatherTypesRaw = formData.get('weatherTypes') as string
  let weatherTypes: string[] | null = null
  if (weatherTypesRaw) {
    try {
      const parsed = JSON.parse(weatherTypesRaw)
      weatherTypes = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error('Failed to parse weather types:', e)
    }
  }

  // Parse grill types
  const grillTypesRaw = formData.get('grillTypes') as string
  let grillTypes: string[] | null = null
  if (grillTypesRaw) {
    try {
      const parsed = JSON.parse(grillTypesRaw)
      grillTypes = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error('Failed to parse grill types:', e)
    }
  }

  // Parse number of people
  const numberOfPeopleRaw = formData.get('numberOfPeople') as string
  const numberOfPeople = numberOfPeopleRaw ? parseInt(numberOfPeopleRaw, 10) : 1

  // Validate minimum value
  if (isNaN(numberOfPeople) || numberOfPeople < 1) {
    return { message: 'Number of people must be at least 1' }
  }

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

    // 3.5 Ensure Profile Exists (Self-healing)
    // If the user profile is missing (e.g. old user), creating a session will fail.
    // We try to upsert the profile to ensure it exists.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
    
    if (profileError) {
        console.warn('Could not verify profile existence:', profileError)
        // We continue anyway, hoping for the best, or the insert below will fail specificially.
    }

    // 4. Insert Session
    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        title,
        date,
        meal_time: mealTime,
        weather_types: weatherTypes,
        grill_types: grillTypes,
        number_of_people: numberOfPeople,
        images: imageUrls,
      })

    if (insertError) {
      console.error('Insert error details:', JSON.stringify(insertError, null, 2))
      
      // Cleanup: Delete uploaded images since session creation failed
      if (imageUrls.length > 0) {
        const pathsToRemove = imageUrls.map(url => {
            try {
                const urlObj = new URL(url)
                const parts = urlObj.pathname.split('/session-images/')
                return parts.length > 1 ? parts[1] : null
            } catch (e) { return null }
        }).filter(Boolean) as string[]

        if (pathsToRemove.length > 0) {
            await supabase.storage.from('session-images').remove(pathsToRemove)
        }
      }

      return { message: 'Failed to save session. Please try again.' }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { message: 'An unexpected error occurred. Please try again.' }
  }

  revalidatePath('/')
  redirect('/')
}
