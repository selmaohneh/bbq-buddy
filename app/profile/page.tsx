'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import Avatar from '@/components/Avatar'
import { useProfile } from '@/components/ProfileProvider'
import { toast } from 'sonner'
import { deleteAvatar } from '@/app/actions/delete-avatar'
import { StatsSection } from '@/components/StatsSection'
import { getFollowerCount } from '@/app/actions/get-follower-count'
import { getUserSessions } from '@/app/actions/get-user-sessions'
import { UserSessionList } from '@/components/UserSessionList'
import FloatingActionButton from '@/components/FloatingActionButton'
import { SessionWithProfile } from '@/types/session'

export default function Profile() {
  const { supabase, session } = useSupabase()
  const { profile, refreshProfile } = useProfile()
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true)
  const [sessions, setSessions] = useState<SessionWithProfile[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  // Sync local state with global profile when it loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile])

  // Fetch follower count
  useEffect(() => {
    async function loadFollowerCount() {
      if (session?.user?.id) {
        setIsLoadingFollowers(true)
        const count = await getFollowerCount(session.user.id)
        setFollowerCount(count)
        setIsLoadingFollowers(false)
      }
    }
    loadFollowerCount()
  }, [session?.user?.id])

  // Fetch sessions
  useEffect(() => {
    async function loadSessions() {
      if (session?.user?.id) {
        setIsLoadingSessions(true)
        const data = await getUserSessions(session.user.id, 0)
        setSessions(data)
        setIsLoadingSessions(false)
      }
    }
    loadSessions()
  }, [session?.user?.id])

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
              <p className="text-lg text-foreground mb-1">@{username}</p>
              <p className="text-sm text-foreground/60">
                BBQ Buddy since {new Date(session.user.created_at).getFullYear()}
              </p>
              {/* Follower Count */}
              <p className="text-sm text-foreground/60 mt-1">
                {isLoadingFollowers ? (
                  <span className="opacity-50">Loading...</span>
                ) : (
                  <>
                    {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <StatsSection />

        {/* Session List - NEW */}
        <div className="mt-6">
          {isLoadingSessions ? (
            <div className="flex justify-center py-8">
              <div className="text-foreground/60">Loading sessions...</div>
            </div>
          ) : (
            <UserSessionList
              initialSessions={sessions}
              userId={session.user.id}
              readOnly={false}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button - NEW */}
      <FloatingActionButton />
    </div>
  )
}
