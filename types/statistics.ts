/**
 * BBQ Statistics Types
 * Defines interfaces for BBQ session statistics and related data
 */

/**
 * BBQ Statistics for a user
 * Includes session counts and unique grilling day metrics
 */
export interface BBQStatistics {
  /** Total number of BBQ sessions ever created by user */
  totalSessions: number

  /** Number of unique calendar days with sessions in current year */
  daysThisYear: number
}

/**
 * Stat type identifier for info modals
 */
export type StatType = 'total' | 'year' | null

/**
 * Info modal content structure
 */
export interface StatInfo {
  title: string
  description: string
}

/**
 * Static content for stat info modals
 */
export const STAT_INFO: Record<Exclude<StatType, null>, StatInfo> = {
  total: {
    title: 'Total BBQ Sessions',
    description: 'This is the total number of BBQ sessions you\'ve logged since joining BBQ Buddy. Each time you create a new session, this number increases by one. It represents your complete grilling history.',
  },
  year: {
    title: 'Days Grilled This Year',
    description: 'This counts the number of unique days you\'ve grilled in the current calendar year (Jan 1 - Dec 31). If you grill multiple times in one day, it still counts as a single day. This metric resets to zero at the start of each year.',
  },
}

/**
 * Icon names for each stat type (maps to lucide-react icons)
 */
export const STAT_ICONS = {
  total: 'flame',
  year: 'calendar',
} as const

/**
 * Empty state hints for each stat type (shown when value is 0)
 */
export const EMPTY_HINTS = {
  total: '',
  year: 'Make this year count!',
} as const
