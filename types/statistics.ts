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

  /** Number of unique calendar days with sessions in current month */
  daysThisMonth: number

  /** Number of unique calendar days with sessions in current week (Mon-Sun) */
  daysThisWeek: number
}

/**
 * Stat type identifier for info modals
 */
export type StatType = 'total' | 'year' | 'month' | 'week' | null

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
  month: {
    title: 'Days Grilled This Month',
    description: 'This counts the number of unique days you\'ve grilled in the current calendar month. Multiple BBQ sessions on the same day count as just one day. This metric resets to zero at the beginning of each month.',
  },
  week: {
    title: 'Days Grilled This Week',
    description: 'This counts the number of unique days you\'ve grilled in the current week (Monday through Sunday). Even if you have multiple BBQ sessions in a single day, it only counts as one day. This metric resets every Monday.',
  },
}

/**
 * Icon names for each stat type (maps to lucide-react icons)
 */
export const STAT_ICONS = {
  total: 'flame',
  year: 'calendar',
  month: 'calendar-days',
  week: 'calendar-clock',
} as const

/**
 * Empty state hints for each stat type (shown when value is 0)
 */
export const EMPTY_HINTS = {
  total: '',
  year: 'Make this year count!',
  month: 'New month, new BBQs!',
  week: 'Time to fire up the grill!',
} as const
