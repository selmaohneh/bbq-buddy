'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/components/ProfileProvider'
import { toast } from 'sonner'
import { deleteAvatar } from '@/app/actions/delete-avatar'

export default function Profile() {
  const { supabase, session } = useSupabase()
  const { profile, refreshProfile } = useProfile()
  const router = useRouter()
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
    avatar_url,
  }: {
    avatar_url: string | null
  }): Promise<boolean> {
    try {
      if (!session?.user) throw new Error('No user')

      const updates = {
        id: session.user.id,
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) {
        throw error
      }

      await refreshProfile()
      toast.success('Avatar updated!')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error updating the data!'
      toast.error(message)
      console.log(error)
      return false
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

        <div className="flex flex-col items-center gap-3">
          <Avatar
            uid={session.user.id}
            url={avatar_url}
            size={150}
            onUpload={async (newPath, oldPath) => {
              console.log('[Profile onUpload] Called with newPath:', newPath, 'oldPath:', oldPath)

              setAvatarUrl(newPath)

              const success = await updateProfile({ avatar_url: newPath })
              console.log('[Profile onUpload] updateProfile success:', success)

              if (success) {
                if (oldPath && oldPath !== newPath) {
                  console.log('[Profile onUpload] Calling deleteAvatar with oldPath:', oldPath)
                  const result = await deleteAvatar(oldPath)
                  console.log('[Profile onUpload] deleteAvatar result:', result)
                  if (!result.success) {
                    console.error('[Profile onUpload] Failed to cleanup old avatar:', result.error)
                  }
                } else {
                  console.log('[Profile onUpload] Skipping cleanup - oldPath is falsy or same as newPath')
                }
              } else {
                console.log('[Profile onUpload] Profile update failed, reverting state')
                setAvatarUrl(oldPath)

                if (newPath && newPath !== oldPath) {
                  console.log('[Profile onUpload] Cleaning up orphaned new avatar:', newPath)
                  const result = await deleteAvatar(newPath)
                  if (!result.success) {
                    console.error('[Profile onUpload] Failed to cleanup orphaned new avatar:', result.error)
                  }
                }
              }
            }}
          />
          {username && (
            <p className="text-sm text-foreground/80">@{username}</p>
          )}
        </div>

        <button
          className="w-full p-2 text-white bg-gray-500 rounded hover:bg-gray-600"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
