'use client'

import { useActionState, useRef, useState } from 'react'
import Image from 'next/image'
import Icon from '@mdi/react'
import { mdiCamera, mdiImage } from '@mdi/js'
import { SubmitButton } from '@/components/SubmitButton'
import { MealTimeSelector } from '@/components/MealTimeSelector'
import { WeatherSelector } from '@/components/WeatherSelector'
import { GrillTypeSelector } from '@/components/GrillTypeSelector'
import { MeatTypeSelector } from '@/components/MeatTypeSelector'
import { NumberControl } from '@/components/NumberControl'
import { NotesSection } from '@/components/NotesSection'
import { Session, MealTime, WeatherType, DEFAULT_NUMBER_OF_PEOPLE, MIN_NUMBER_OF_PEOPLE, MAX_IMAGE_FILE_SIZE, MAX_IMAGES_PER_SESSION } from '@/types/session'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { validateImageFile, calculateRemainingSlots } from '@/utils/validation'

interface SessionFormProps {
  initialData?: Session
  action: (prevState: any, formData: FormData) => Promise<any>
  deleteAction?: (id: string, imageUrls: string[]) => Promise<void>
}

const initialState = {
  message: '',
  errors: null,
}

export function SessionForm({ initialData, action, deleteAction }: SessionFormProps) {
  const [state, formAction] = useActionState(action, initialState)
  const supabase = createClient()

  // State for existing images (URLs from initial data)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])

  // State for new images to upload (compressed File objects + preview URLs)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)

  // Date state
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  )

  const today = new Date().toISOString().split('T')[0]

  // Meal time state
  const [mealTime, setMealTime] = useState<MealTime | null>(initialData?.meal_time || null)

  // Weather types state
  const [weatherTypes, setWeatherTypes] = useState<WeatherType[]>(
    initialData?.weather_types || []
  )

  // Grill types state
  const [grillTypes, setGrillTypes] = useState<string[]>(
    initialData?.grill_types || []
  )

  // Meat types state
  const [meatTypes, setMeatTypes] = useState<string[]>(
    initialData?.meat_types || []
  )

  // Number of people state
  const [numberOfPeople, setNumberOfPeople] = useState<number>(
    initialData?.number_of_people ?? DEFAULT_NUMBER_OF_PEOPLE
  )

  // Notes state
  const [notes, setNotes] = useState<string>(initialData?.notes || '')

  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!

          // Max dimensions (larger to preserve quality while reducing size)
          const MAX_WIDTH = 1920
          const MAX_HEIGHT = 1920

          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.85
          )
        }
      }
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsCompressing(true)

      try {
        const files = Array.from(event.target.files)

        // Calculate remaining image slots
        const remainingSlots = calculateRemainingSlots(
          existingImages.length,
          newFiles.length,
          MAX_IMAGES_PER_SESSION
        )

        if (remainingSlots === 0) {
          toast.error('Maximum 3 images allowed. Remove existing images to add new ones.')
          return
        }

        // Validate file sizes and filter valid files
        const validFiles: File[] = []
        for (const file of files) {
          const validation = validateImageFile(file, MAX_IMAGE_FILE_SIZE)
          if (!validation.valid) {
            toast.error(validation.error!)
          } else {
            validFiles.push(file)
          }
        }

        if (validFiles.length === 0) {
          return // No valid files to process
        }

        // Limit to remaining slots
        const filesToAdd = validFiles.slice(0, remainingSlots)

        // Show warning if some files were rejected due to count limit
        if (filesToAdd.length < validFiles.length) {
          toast.warning(
            `Only ${filesToAdd.length} image(s) added. Maximum is ${MAX_IMAGES_PER_SESSION} images per session.`
          )
        }

        // Compress valid images
        const compressedFiles = await Promise.all(
          filesToAdd.map((file) => compressImage(file))
        )

        // Create local blob URLs for preview
        const previews = compressedFiles.map((file) => URL.createObjectURL(file))

        // Store compressed files and previews (will upload on submit)
        setNewFiles((prev) => [...prev, ...compressedFiles])
        setNewFilePreviews((prev) => [...prev, ...previews])
      } catch (error) {
        console.error('Image compression failed:', error)
        toast.error('Failed to process images')
      } finally {
        setIsCompressing(false)
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeNewFile = (index: number) => {
    // Revoke blob URL to free memory
    URL.revokeObjectURL(newFilePreviews[index])

    // Remove from state
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const clientAction = async (formData: FormData) => {
    // Defensive check: Validate total image count
    const totalImages = existingImages.length + newFiles.length
    if (totalImages > MAX_IMAGES_PER_SESSION) {
      toast.error(`Maximum ${MAX_IMAGES_PER_SESSION} images allowed per session`)
      return
    }

    if (newFiles.length > 0) {
      setIsUploading(true)

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast.error('You must be logged in to upload images')
          setIsUploading(false)
          return
        }

        // Upload all new images to Supabase Storage
        const uploadedUrls: string[] = []

        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('session-images')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            toast.error(`Failed to upload image ${i + 1}`)
            setIsUploading(false)
            return
          }

          const { data: { publicUrl } } = supabase.storage
            .from('session-images')
            .getPublicUrl(fileName)

          uploadedUrls.push(publicUrl)
        }

        // Append uploaded image URLs
        uploadedUrls.forEach((url) => {
          formData.append('newImageUrls', url)
        })
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Failed to upload images')
        setIsUploading(false)
        return
      }

      setIsUploading(false)
    }

    // Append list of existing images to keep
    existingImages.forEach((url) => {
      formData.append('keptImages', url)
    })

    // Append meal time (empty string if null, so it can be processed by server action)
    formData.append('mealTime', mealTime || '')

    // Append weather types as JSON string
    formData.append('weatherTypes', JSON.stringify(weatherTypes))

    // Append grill types as JSON string
    formData.append('grillTypes', JSON.stringify(grillTypes))

    // Append meat types as JSON string
    formData.append('meatTypes', JSON.stringify(meatTypes))

    // Append number of people
    formData.append('numberOfPeople', numberOfPeople.toString())

    // Append notes
    formData.append('notes', notes)

    formAction(formData)
  }

  const handleDelete = async () => {
    if (!deleteAction || !initialData) return
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) return

    setIsDeleting(true)
    try {
        // Pass all initial images to ensure we clean up everything on delete
      await deleteAction(initialData.id, initialData.images || [])
    } catch (error) {
      // Ignore Next.js redirect errors
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }
      console.error('Delete failed', error)
      toast.error('Failed to delete session')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="p-4 border-b border-foreground/10 flex items-center bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold">
            {initialData ? 'Edit Session' : 'New Session'}
        </h1>

        {initialData && deleteAction && (
             <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-auto text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                aria-label="Delete session"
             >
                {isDeleting ? (
                    <span className="animate-spin block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                )}
             </button>
        )}
      </header>

      {/* Form */}
      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        <form action={clientAction} className="flex flex-col gap-6">
          
          {state?.message && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
              {state.message}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold text-foreground/80">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={initialData?.title}
              placeholder="BBQ Session..."
              className="p-4 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="font-semibold text-foreground/80">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              style={{
                colorScheme: 'dark',
              }}
              className="w-full p-4 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
            />
          </div>

          {/* Images Custom Control */}
          <div className="flex flex-col gap-4">
            <label className="font-semibold text-foreground/80">
              Photos
            </label>
            
            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Photo Selection Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Camera Capture Button */}
              <button
                type="button"
                onClick={() => {
                  if (existingImages.length + newFiles.length >= MAX_IMAGES_PER_SESSION) {
                    toast.error('Maximum 3 images allowed. Remove existing images to add new ones.')
                  } else {
                    cameraInputRef.current?.click()
                  }
                }}
                disabled={isCompressing || existingImages.length + newFiles.length >= MAX_IMAGES_PER_SESSION}
                className="flex-1 py-4 border-2 border-dashed border-foreground/20 rounded-xl text-foreground/60 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-foreground/20 disabled:hover:text-foreground/60"
              >
                {isCompressing ? (
                  <>
                    <span className="animate-spin block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Icon path={mdiCamera} size={0.8} className="w-5 h-5" />
                    Take Photo
                  </>
                )}
              </button>

              {/* Upload Photos Button */}
              <button
                type="button"
                onClick={() => {
                  if (existingImages.length + newFiles.length >= MAX_IMAGES_PER_SESSION) {
                    toast.error('Maximum 3 images allowed. Remove existing images to add new ones.')
                  } else {
                    fileInputRef.current?.click()
                  }
                }}
                disabled={isCompressing || existingImages.length + newFiles.length >= MAX_IMAGES_PER_SESSION}
                className="flex-1 py-4 border-2 border-dashed border-foreground/20 rounded-xl text-foreground/60 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-foreground/20 disabled:hover:text-foreground/60"
              >
                {isCompressing ? (
                  <>
                    <span className="animate-spin block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Icon path={mdiImage} size={0.8} className="w-5 h-5" />
                    Upload Photos
                  </>
                )}
              </button>
            </div>

            {/* Image Count Helper Text */}
            <div className="text-sm text-foreground/60 text-center" aria-live="polite">
              {existingImages.length + newFiles.length} / {MAX_IMAGES_PER_SESSION} images
            </div>

            {/* Preview Grid */}
            {(existingImages.length > 0 || newFilePreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden group bg-input">
                    <Image
                      src={url}
                      alt={`Existing ${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* New Files (Local Previews) */}
                {newFilePreviews.map((url, index) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden group bg-input">
                    <Image
                      src={url}
                      alt={`New ${index}`}
                      fill
                      className="object-cover"
                    />
                     <div className="absolute bottom-1 left-1 bg-green-500/80 text-white text-[10px] px-1 rounded">New</div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Time */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Meal Time
            </label>
            <MealTimeSelector value={mealTime} onChange={setMealTime} />
          </div>

          {/* Weather */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Weather
            </label>
            <WeatherSelector value={weatherTypes} onChange={setWeatherTypes} />
          </div>

          {/* Grill Types */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Grill Types
            </label>
            <GrillTypeSelector value={grillTypes} onChange={setGrillTypes} />
          </div>

          {/* Meat Types */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Meat Types
            </label>
            <MeatTypeSelector value={meatTypes} onChange={setMeatTypes} />
          </div>

          {/* Number of People */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Number of People
            </label>
            <NumberControl
              value={numberOfPeople}
              onChange={setNumberOfPeople}
              min={MIN_NUMBER_OF_PEOPLE}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-foreground/80">
              Notes
            </label>
            <NotesSection value={notes} onChange={setNotes} />
          </div>

          <SubmitButton isUploading={isUploading} />
        </form>
      </main>
    </div>
  )
}