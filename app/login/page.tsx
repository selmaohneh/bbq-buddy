'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      // You can optionally redirect the user or show a success message
      alert('Confirmation email sent! Please check your inbox.')
    }
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleSignInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      alert(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="you@example.com"
      />
      <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        type="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        placeholder="••••••••"
      />
      <button onClick={handleSignIn} className="bg-green-700 rounded px-4 py-2 text-white mb-2">
        Sign In
      </button>
      <button onClick={handleSignUp} className="border border-gray-700 rounded px-4 py-2 mb-2">
        Sign Up
      </button>
      <button onClick={handleSignInAnonymously} className="bg-gray-500 rounded px-4 py-2 text-white mb-2">
        Sign In Anonymously
      </button>
    </div>
  )
}
