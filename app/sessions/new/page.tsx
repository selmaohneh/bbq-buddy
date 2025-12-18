'use client'

import { createSession } from '@/app/actions/create-session'
import Link from 'next/link'
import Image from 'next/image'
import { useActionState, useState, useRef } from 'react'
import { SubmitButton } from '@/components/SubmitButton'

const initialState = {
  message: '',
  errors: null,
}

export default function NewSessionPage() {
  const [state, formAction] = useActionState(createSession, initialState)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files)
      
      // Update Files State
      setSelectedFiles((prev) => [...prev, ...newFiles])
      
      // Generate Previews
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviews])
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    
    // Revoke URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const clientAction = (formData: FormData) => {
    // Append manually selected files to FormData
    selectedFiles.forEach((file) => {
      formData.append('images', file)
    })
    formAction(formData)
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
        <h1 className="text-xl font-bold">New Session</h1>
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
              defaultValue={new Date().toISOString().split('T')[0]}
              className="p-4 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
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
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image
                      src={url}
                      alt={`Preview ${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
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