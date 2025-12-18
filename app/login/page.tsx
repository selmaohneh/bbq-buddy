'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [view, setView] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  })

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            router.push('/')
        }
    }
    checkSession()
  }, [router, supabase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        if (!formData.username || formData.username.length < 3) {
            throw new Error('Username must be at least 3 characters long.')
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
          },
        })
        if (error) throw error
        // For email confirmation flows, you might want to show a message here.
        // Assuming auto-confirm or similar for this prototype context, or just let them know.
        alert('Registration successful! Please check your email to confirm.')
        setView('login')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-10">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
                className={`pb-2 px-4 font-medium ${view === 'login' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setView('login')}
            >
                Login
            </button>
            <button
                className={`pb-2 px-4 font-medium ${view === 'signup' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setView('signup')}
            >
                Sign Up
            </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {view === 'signup' && (
            <div>
                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">Username</label>
                <input
                    type="text"
                    required
                    placeholder="bbq_master_99"
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50 font-bold transition-colors"
          >
            {loading ? 'Loading...' : (view === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  )
}