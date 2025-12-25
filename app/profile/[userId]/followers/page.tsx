'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react'
import { mdiAccountGroup } from '@mdi/js'
import { getFollowersList } from '@/app/actions/get-followers-list'
import { getUserProfile } from '@/app/actions/get-user-profile'
import { FollowListItem } from '@/types/follow'
import { FollowingListItem } from '@/components/FollowingListItem'

interface FollowersPageProps {
  params: Promise<{
    userId: string
  }>
}

/**
 * Followers Page
 *
 * Displays a list of users who follow a specific profile.
 */
export default function FollowersPage({ params }: FollowersPageProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [followersList, setFollowersList] = useState<FollowListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [targetUsername, setTargetUsername] = useState<string | null>(null)

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setUserId(p.userId))
  }, [params])

  // Load followers list and target user profile
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        // Fetch followers list and target user profile in parallel
        const [followers, userProfile] = await Promise.all([
          getFollowersList(userId),
          getUserProfile(userId),
        ])

        setFollowersList(followers)
        setTargetUsername(userProfile?.username || null)
      } catch (error) {
        console.error('Error loading followers:', error)
        setFollowersList([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  // Handle user click (navigate to profile)
  const handleUserClick = (clickedUserId: string) => {
    router.push(`/profile/${clickedUserId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-4 border-b border-foreground/10 bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">
          {targetUsername ? `@${targetUsername}'s Followers` : 'Followers'}
        </h1>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Followers Count */}
        <div className="flex items-center gap-2 mb-3">
          <Icon path={mdiAccountGroup} size={0.9} className="text-foreground/60" />
          <h2 className="text-sm font-semibold text-foreground/60">
            {followersList.length}{' '}
            {followersList.length === 1 ? 'Follower' : 'Followers'}
          </h2>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-foreground/40"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : followersList.length > 0 ? (
          /* Followers List */
          <div className="space-y-2">
            {followersList.map((user) => (
              <FollowingListItem
                key={user.id}
                user={user}
                onClick={handleUserClick}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 text-foreground/60 bg-card rounded-lg border border-border">
            <p className="mb-2">No followers yet.</p>
            <p className="text-sm">
              Share this profile to gain followers!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
