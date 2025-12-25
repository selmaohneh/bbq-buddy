'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react'
import { mdiMagnify, mdiAccountGroup, mdiArrowLeft } from '@mdi/js'
import { searchUsers } from '@/app/actions/search-users'
import { getFollowingList } from '@/app/actions/get-following-list'
import { UserSearchResult as UserSearchResultType, FollowListItem } from '@/types/follow'
import { UserSearchResult } from '@/components/UserSearchResult'
import { FollowingListItem } from '@/components/FollowingListItem'

/**
 * Friends Page
 *
 * Full page for searching users and viewing following list.
 */
export default function FriendsPage() {
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResultType[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Following list state
  const [followingList, setFollowingList] = useState<FollowListItem[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)

  // Load following list on mount
  useEffect(() => {
    loadFollowingList()
  }, [])

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
    router.push(`/profile/${userId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-white px-4 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <Icon path={mdiArrowLeft} size={1} />
          </button>
          <h1 className="text-xl font-bold">Find a BBQ Buddy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search input */}
        <div className="relative mb-6">
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
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>

        {/* Search Results Section */}
        {searchQuery.trim().length >= 2 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground/60 mb-3">
              Search Results
            </h2>

            {isSearching ? (
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
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <UserSearchResult
                    key={user.id}
                    user={user}
                    onClick={handleUserClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/60 bg-card rounded-lg border border-border">
                <p>No users found matching "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Following List Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiAccountGroup} size={0.9} className="text-foreground/60" />
            <h2 className="text-sm font-semibold text-foreground/60">
              Following ({followingList.length})
            </h2>
          </div>

          {isLoadingFollowing ? (
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
          ) : followingList.length > 0 ? (
            <div className="space-y-2">
              {followingList.map((user) => (
                <FollowingListItem
                  key={user.id}
                  user={user}
                  onClick={handleUserClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-foreground/60 bg-card rounded-lg border border-border">
              <p className="mb-2">You're not following anyone yet.</p>
              <p className="text-sm">Search above to find BBQ enthusiasts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
