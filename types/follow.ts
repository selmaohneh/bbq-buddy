/**
 * Type definitions for the friends/following feature
 */

/**
 * Basic follow relationship from the database
 */
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

/**
 * User profile data for search results and profile views
 */
export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at?: string
}

/**
 * Extended user profile with follow statistics and relationship status
 * Used for displaying user profiles with follower counts
 */
export interface UserProfileWithStats extends UserProfile {
  created_at: string // Required for "Member since" display
  follower_count: number // Number of users following this profile
  following_count: number // Number of users this profile follows
  is_following?: boolean // Whether current user follows this profile (undefined if not applicable)
  is_own_profile: boolean // Whether this is the current user's profile
}

/**
 * Lightweight user search result
 * Used for displaying search results in the friends modal
 */
export interface UserSearchResult {
  id: string
  username: string
  avatar_url: string | null
}

/**
 * Follower/Following list item
 * Used for displaying the list of users the current user follows
 */
export interface FollowListItem {
  id: string
  username: string
  avatar_url: string | null
  is_following: boolean // Whether current user follows this user (always true in following list)
}
