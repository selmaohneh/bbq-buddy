'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      if (!session?.user) return // Wait for session

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.log('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [session, supabase])

  useEffect(() => {
    // Only fetch if session exists
    if (session) {
      getProfile()
    } else {
        // If no session and finished loading (implied by this component rendering usually, 
        // but session can be null initially. SupabaseProvider handles it).
        // We might want to wait a bit or let the provider handle loading state.
        // For now, if no session, we can redirect.
        // router.push('/login') 
        // But let's handle the case where session is loading.
    }
  }, [session, getProfile])

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user')

      const updates = {
        id: session.user.id,
        username,
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (!session) {
      return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Redirecting...</p> 
            {/* Or Loading spinner */}
        </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center">Profile</h1>
        
        <div className="flex justify-center">
            <Avatar
            uid={session.user.id}
            url={avatar_url}
            size={150}
            onUpload={(url) => {
                setAvatarUrl(url)
                updateProfile({ username, avatar_url: url })
            }}
            />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input 
            id="email" 
            type="text" 
            value={session.user.email} 
            disabled 
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-[var(--foreground)]"
          />
        </div>

        <div className="flex flex-col gap-4">
            <button
            className="w-full p-2 text-white bg-[var(--primary)] rounded hover:opacity-90 disabled:opacity-50"
            onClick={() => updateProfile({ username, avatar_url })}
            disabled={loading}
            >
            {loading ? 'Loading ...' : 'Update'}
            </button>
            
             <button
            className="w-full p-2 text-white bg-gray-500 rounded hover:bg-gray-600"
            onClick={handleSignOut}
            >
            Sign Out
            </button>
        </div>
      </div>
    </div>
  )
}
