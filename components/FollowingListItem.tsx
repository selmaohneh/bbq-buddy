'use client'

import { FollowListItem } from '@/types/follow'
import Avatar from './Avatar'

interface FollowingListItemProps {
  user: FollowListItem
  onClick: (userId: string) => void
}

/**
 * FollowingListItem Component
 *
 * Displays a user from the following list with avatar, username, and following indicator.
 * Clickable to navigate to the user's profile.
 */
export function FollowingListItem({ user, onClick }: FollowingListItemProps) {
  return (
    <button
      onClick={() => onClick(user.id)}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors text-left"
    >
      {/* Avatar */}
      <Avatar uid={user.id} url={user.avatar_url} size={48} />

      {/* Username and Following Badge */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <p className="text-foreground font-medium truncate">@{user.username}</p>
        <span className="text-xs text-foreground/60 bg-foreground/10 px-2 py-1 rounded-full whitespace-nowrap">
          Following
        </span>
      </div>
    </button>
  )
}
