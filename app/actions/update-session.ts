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

  // Parse meat types
  const meatTypesRaw = formData.get('meatTypes') as string
  let meatTypes: string[] | null = null
  if (meatTypesRaw) {
    try {
      const parsed = JSON.parse(meatTypesRaw)
      meatTypes = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      console.error('Failed to parse meat types:', e)
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
  const keptImages = formData.getAll('keptImages') as string[]

  if (!title || !date) {
    return { message: 'Title and Date are required' }
  }

  // Validate date is not in the future
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDate > today) {
    return { message: 'Date cannot be in the future' }
  }

  // 1.5 Fetch current session to determine which images to delete
  const { data: currentSession } = await supabase
    .from('sessions')
    .select('images')
    .eq('id', id)
    .single()

  const oldImages = (currentSession?.images as string[]) || []
  const imagesToDelete = oldImages.filter(img => !keptImages.includes(img))

  if (imagesToDelete.length > 0) {
    const pathsToRemove = imagesToDelete.map(url => {
        try {
            const urlObj = new URL(url)
            const parts = urlObj.pathname.split('/session-images/')
            // Decode URI component to handle spaces or special chars in filenames
            return parts.length > 1 ? decodeURIComponent(parts[1]) : null
        } catch (e) {
            return null
        }
    }).filter(Boolean) as string[]

    if (pathsToRemove.length > 0) {
        await supabase.storage.from('session-images').remove(pathsToRemove)
    }
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
        meal_time: mealTime,
        weather_types: weatherTypes,
        grill_types: grillTypes,
        meat_types: meatTypes,
        number_of_people: numberOfPeople,
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
