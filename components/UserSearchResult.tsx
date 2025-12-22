'use client'

import { UserSearchResult as UserSearchResultType } from '@/types/follow'
import Avatar from './Avatar'

interface UserSearchResultProps {
  user: UserSearchResultType
  onClick: (userId: string) => void
}

/**
 * UserSearchResult Component
 *
 * Displays a single user search result with avatar and username.
 * Clickable to navigate to the user's profile.
 */
export function UserSearchResult({ user, onClick }: UserSearchResultProps) {
  return (
    <button
      onClick={() => onClick(user.id)}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors text-left"
    >
      {/* Avatar */}
      <Avatar uid={user.id} url={user.avatar_url} size={48} />

      {/* Username */}
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">@{user.username}</p>
      </div>
    </button>
  )
}
