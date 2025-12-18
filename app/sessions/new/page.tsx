'use client'

import { createSession } from '@/app/actions/create-session'
import Link from 'next/link'
import { useActionState } from 'react'
import { SubmitButton } from '@/components/SubmitButton'

const initialState = {
  message: '',
  errors: null,
}

export default function NewSessionPage() {
  const [state, formAction] = useActionState(createSession, initialState)

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
        <form action={formAction} className="flex flex-col gap-6">
          
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
              placeholder="Summer BBQ..."
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

          {/* Images */}
          <div className="flex flex-col gap-2">
            <label htmlFor="images" className="font-semibold text-foreground/80">
              Photos
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              className="block w-full text-sm text-foreground/60
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                cursor-pointer"
            />
          </div>

          <SubmitButton />
        </form>
      </main>
    </div>
  )
}
