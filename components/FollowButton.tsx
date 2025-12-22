'use client'

import { useState, useTransition } from 'react'
import { followUser } from '@/app/actions/follow-user'
import { unfollowUser } from '@/app/actions/unfollow-user'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

/**
 * FollowButton Component
 *
 * Displays a follow/unfollow button with optimistic updates.
 * Shows loading state during API calls and reverts on error.
 */
export function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // Store previous state for potential revert
    const previousState = isFollowing

    // Optimistic update
    setIsFollowing(!isFollowing)

    // Perform async action
    startTransition(async () => {
      try {
        const result = isFollowing
          ? await unfollowUser(userId)
          : await followUser(userId)

        if (!result.success) {
          // Revert on error
          setIsFollowing(previousState)
          toast.error(result.error || 'Failed to update follow status')
        } else {
          // Success - show toast and notify parent
          toast.success(isFollowing ? 'User unfollowed' : 'Now following!')
          onFollowChange?.(!isFollowing)
        }
      } catch (error) {
        // Revert on exception
        setIsFollowing(previousState)
        toast.error('An error occurred')
        console.error('Follow/unfollow error:', error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        px-6 py-2.5 rounded-lg font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isFollowing
            ? 'bg-foreground/10 text-foreground hover:bg-foreground/15'
            : 'bg-primary text-white hover:bg-primary/90'
        }
      `}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
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
          Loading...
        </span>
      ) : isFollowing ? (
        'Unfollow'
      ) : (
        'Follow'
      )}
    </button>
  )
}
