'use client'

import { useSupabase } from './supabase-provider'
import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  const { session } = useSupabase()

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 text-center min-h-[80vh]">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-white p-2 shadow-xl ring-4 ring-primary/20">
          <Image
            src="/logo.png"
            alt="BBQ Buddy Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 128px, 192px"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-sm">
            BBQ Buddy
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 font-medium italic">
            "Never Forget a BBQ"
          </p>
        </div>

        {!session ? (
          <div className="mt-8 flex flex-col gap-4 w-full max-w-xs">
            <Link
              href="/login"
              className="bg-primary hover:brightness-90 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started
            </Link>
            <p className="text-sm text-foreground/60">
              Join the community of grill masters.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6 w-full">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
              <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
              <p className="text-foreground/80">
                Ready to fire up the grill?
              </p>
            </div>
             {/* Placeholder for Feed/Dashboard */}
             <div className="grid grid-cols-1 gap-4 w-full">
                <button className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-gray-100 group flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-primary group-hover:underline">Start a new Session</span>
                    <span className="text-2xl text-primary">+</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}