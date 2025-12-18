'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SubmitButton } from '@/components/SubmitButton'
import { Session } from '@/types/session'
import { toast } from 'sonner'

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
  
  // State for new file uploads
  const [newFiles, setNewFiles] = useState<File[]>([])
  
  // State for existing images (only URLs)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || [])
  
  // Merged previews: existing images + new file previews
  // We manage the display logic by combining them on the fly or separately.
  // Let's keep new file previews separate to easily map index back to newFiles array.
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  // Date state
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files)
      setNewFiles((prev) => [...prev, ...files])
      
      const previews = files.map((file) => URL.createObjectURL(file))
      setNewFilePreviews((prev) => [...prev, ...previews])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(newFilePreviews[index])
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const clientAction = (formData: FormData) => {
    // Append new files
    newFiles.forEach((file) => {
      formData.append('newImages', file)
    })
    
    // Append list of existing images to keep
    existingImages.forEach((url) => {
      formData.append('keptImages', url)
    })

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
      <header className="p-4 border-b border-foreground/10 flex items-center gap-4 bg-background sticky top-0 z-10">
        <Link href="/" className="text-primary hover:opacity-80">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
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
            <label htmlFor="date-display" className="font-semibold text-foreground/80">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                id="date-display"
                readOnly
                value={date}
                onClick={() => dateInputRef.current?.showPicker()}
                className="w-full p-4 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              />
              <input
                type="date"
                ref={dateInputRef}
                name="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Images Custom Control */}
          <div className="flex flex-col gap-4">
            <label className="font-semibold text-foreground/80">
              Photos
            </label>
            
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Add Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-foreground/20 rounded-xl text-foreground/60 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Select Photos
            </button>

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
                
                {/* New Files */}
                {newFilePreviews.map((url, index) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden group bg-input">
                    <Image
                      src={url}
                      alt={`New Preview ${index}`}
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

          <SubmitButton />
        </form>
      </main>
    </div>
  )
}
