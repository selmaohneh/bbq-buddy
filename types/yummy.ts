/**
 * Type definitions for the yummy/reactions feature
 */

/**
 * Basic yummy relationship from the database
 */
export interface Yummy {
  id: string
  user_id: string
  session_id: string
  created_at: string
}

/**
 * Yummy list item with user profile information
 * Used for displaying the list of users who yummied a session
 */
export interface YummyListItem {
  id: string              // user_id
  username: string
  avatar_url: string | null
}

/**
 * Aggregated yummy data for a session
 * Included when fetching sessions to show engagement
 */
export interface SessionYummyData {
  yummy_count: number          // Total number of yummies
  has_yummied: boolean         // Whether current user has yummied
  can_yummy: boolean           // Whether current user can yummy (not own session)
}
