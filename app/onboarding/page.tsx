'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useProfile } from '@/components/ProfileProvider'
import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteAvatar } from '@/app/actions/delete-avatar'

export default function Onboarding() {
  const { supabase, session } = useSupabase()
  const { profile, refreshProfile } = useProfile()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  // Redirect if user already has a username
  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    if (profile?.username) {
      router.push('/')
    }
  }, [profile, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate username
    if (!username || username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long')
      return
    }

    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user')

      const updates = {
        id: session.user.id,
        username: username.trim(),
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        if (error.code === '23505') {
          throw new Error('Username already taken.')
        }
        throw error
      }

      // Update global context
      await refreshProfile()

      toast.success('Welcome to BBQ Buddy!')
      router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error setting up your profile!'
      toast.error(message)
      console.log(error)

      // If profile update failed, cleanup the uploaded avatar to prevent orphans
      if (avatar_url) {
        console.log('[Onboarding] Cleaning up orphaned avatar:', avatar_url)
        await deleteAvatar(avatar_url)
        setAvatarUrl(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking profile
  if (!session || profile?.username) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded shadow-md border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[var(--primary)]">Welcome to BBQ Buddy!</h1>
          <p className="text-sm text-foreground/80">How should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <Avatar
              uid={session.user.id}
              url={avatar_url}
              size={150}
              onUpload={async (newPath, oldPath) => {
                console.log('[Onboarding onUpload] Called with newPath:', newPath, 'oldPath:', oldPath)

                // Optimistically update local state
                setAvatarUrl(newPath)

                // If upload succeeded, cleanup old avatar if it existed
                if (newPath && oldPath && oldPath !== newPath) {
                  console.log('[Onboarding onUpload] Calling deleteAvatar with oldPath:', oldPath)
                  const result = await deleteAvatar(oldPath)
                  if (!result.success) {
                    console.error('[Onboarding onUpload] Failed to cleanup old avatar:', result.error)
                  }
                }
              }}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username (min 3 characters)"
              className="w-full p-2 border border-border rounded bg-card text-card-foreground"
              required
              minLength={3}
              disabled={loading}
            />
            <p className="text-xs text-foreground/60 mt-1">
              This will be your unique identifier. Minimum 3 characters.
            </p>
          </div>

          <button
            type="submit"
            className="w-full p-2 text-white bg-[var(--primary)] rounded hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
