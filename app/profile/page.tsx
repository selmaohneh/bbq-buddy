'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useProfile } from '@/components/ProfileProvider'
import { toast } from 'sonner'
import { deleteAvatar } from '@/app/actions/delete-avatar'
import { StatsSection } from '@/components/StatsSection'
import { FriendsModal } from '@/components/FriendsModal'
import Icon from '@mdi/react'
import { mdiAccountMultiple } from '@mdi/js'

export default function Profile() {
  const { supabase, session } = useSupabase()
  const { profile, refreshProfile } = useProfile()
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col gap-6">
        {/* Friends Icon Button - Top Right */}
        <div className="flex justify-end -mt-2 mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="View friends and search users"
          >
            <Icon
              path={mdiAccountMultiple}
              size={1}
              className="text-foreground/60 hover:text-foreground transition-colors"
            />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
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
              <p className="text-lg text-foreground">@{username}</p>
              <p className="text-sm text-foreground/60">
                BBQ Buddy since {new Date(session.user.created_at).getFullYear()}
              </p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <StatsSection />
      </main>

      {/* Friends Modal */}
      <FriendsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
