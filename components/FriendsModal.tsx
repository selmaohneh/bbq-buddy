'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react'
import { mdiClose, mdiMagnify, mdiAccountGroup } from '@mdi/js'
import { searchUsers } from '@/app/actions/search-users'
import { getFollowingList } from '@/app/actions/get-following-list'
import { UserSearchResult as UserSearchResultType, FollowListItem } from '@/types/follow'
import { UserSearchResult } from './UserSearchResult'
import { FollowingListItem } from './FollowingListItem'

interface FriendsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

/**
 * FriendsModal Component
 *
 * Displays a modal overlay for searching users and viewing following list.
 * Supports keyboard navigation (Escape to close) and click-outside-to-dismiss.
 */
export function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResultType[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Following list state
  const [followingList, setFollowingList] = useState<FollowListItem[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)

  // Handle escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Set up escape key listener and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      // Load following list when modal opens
      loadFollowingList()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchUsers(debouncedQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // Load following list
  const loadFollowingList = async () => {
    setIsLoadingFollowing(true)
    try {
      const list = await getFollowingList()
      setFollowingList(list)
    } catch (error) {
      console.error('Error loading following list:', error)
      setFollowingList([])
    } finally {
      setIsLoadingFollowing(false)
    }
  }

  // Handle user click (navigate to profile)
  const handleUserClick = (userId: string) => {
    onClose()
    router.push(`/profile/${userId}`)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="friends-modal-title"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[80vh] shadow-2xl animate-slide-up flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors p-2 -m-2 rounded-full hover:bg-foreground/5"
          aria-label="Close modal"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>

        {/* Modal title */}
        <h2
          id="friends-modal-title"
          className="text-xl font-bold text-foreground pr-8 mb-4"
        >
          Find Friends
        </h2>

        {/* Search input */}
        <div className="relative mb-4">
          <Icon
            path={mdiMagnify}
            size={0.9}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 hide-scrollbar">
          {/* Search Results Section */}
          {searchQuery.trim().length >= 2 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground/60 mb-2">
                Search Results
              </h3>

              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-6 w-6 text-foreground/40"
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
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <UserSearchResult
                      key={user.id}
                      user={user}
                      onClick={handleUserClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  <p>No users found matching "{debouncedQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Following List Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiAccountGroup} size={0.8} className="text-foreground/60" />
              <h3 className="text-sm font-semibold text-foreground/60">
                Following ({followingList.length})
              </h3>
            </div>

            {isLoadingFollowing ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="animate-spin h-6 w-6 text-foreground/40"
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
            ) : followingList.length > 0 ? (
              <div className="space-y-1">
                {followingList.map((user) => (
                  <FollowingListItem
                    key={user.id}
                    user={user}
                    onClick={handleUserClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-foreground/60">
                <p className="mb-2">You're not following anyone yet.</p>
                <p className="text-sm">Search above to find BBQ enthusiasts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
