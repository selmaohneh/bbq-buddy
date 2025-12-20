'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/components/ProfileProvider'
import { toast } from 'sonner'
import { deleteAvatar } from '@/app/actions/delete-avatar'
import { StatsSection } from '@/components/StatsSection'

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
    <div className="flex flex-col items-center min-h-screen py-8 px-4 bg-[var(--background)] text-[var(--foreground)]">
      {/* Profile Header - Narrower */}
      <div className="w-full max-w-md mb-8">
        <div className="flex flex-col items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <Avatar
            uid={session.user.id}
            url={avatar_url}
            size={120}
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
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{username}</p>
              <p className="text-sm text-foreground/60">@{username}</p>
            </div>
          )}
        </div>
      </div>

      {/* BBQ Statistics Section - Wider */}
      <div className="w-full max-w-2xl px-4">
        <StatsSection />
      </div>

      {/* Sign Out Button - Centered */}
      <div className="w-full max-w-md px-4 mt-8">
        <button
          className="w-full p-3 text-white bg-foreground/10 hover:bg-foreground/20 rounded-xl font-medium transition-colors"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
