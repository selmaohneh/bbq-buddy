'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/components/ProfileProvider'
import { toast } from 'sonner'

export default function Profile() {
  const { supabase, session } = useSupabase()
  const { profile, refreshProfile, setProfile: setGlobalProfile } = useProfile()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  // Sync local state with global profile when it loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile])

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
      if (error) {
        if (error.code === '23505') { // Postgres unique_violation code
            throw new Error('Username already taken.')
        }
        throw error
      }
      
      // Update global context
      await refreshProfile()
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.message || 'Error updating the data!')
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
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded shadow-md border border-border">
        <h1 className="text-2xl font-bold text-center">Profile</h1>
        
        <div className="flex justify-center">
            <Avatar
            uid={session.user.id}
            url={avatar_url}
            size={150}
            onUpload={async (newPath) => {
                const oldPath = avatar_url
                setAvatarUrl(newPath)
                
                try {
                    await updateProfile({ username, avatar_url: newPath })
                    
                    // Cleanup old avatar if it existed and is different from new path
                    if (oldPath && oldPath !== newPath) {
                        const { error } = await supabase.storage.from('avatars').remove([oldPath])
                        if (error) {
                            console.error('Error removing old avatar:', error)
                        } else {
                            console.log('Old avatar removed successfully')
                        }
                    }
                } catch (error) {
                    // Revert local state if update failed
                    setAvatarUrl(oldPath)
                    console.error('Failed to update profile, reverted avatar.')
                }
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
            className="w-full p-2 border border-border rounded bg-input opacity-70 cursor-not-allowed" 
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-border rounded bg-card text-card-foreground"
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
