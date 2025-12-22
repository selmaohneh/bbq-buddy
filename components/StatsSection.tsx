'use client'

import { useEffect, useState } from 'react'
import Icon from '@mdi/react'
import { mdiFire, mdiCalendar } from '@mdi/js'
import { BBQStatistics } from '@/types/statistics'
import { StatsEmptyState } from './StatsEmptyState'
import { getStatistics } from '@/app/actions/get-statistics'

interface StatsSectionProps {
  /**
   * Optional user ID to fetch statistics for.
   * If not provided, fetches stats for the currently authenticated user.
   */
  userId?: string
}

/**
 * StatsSection Component
 *
 * Fetches and displays BBQ statistics for a user.
 * Shows total sessions and grill days this year in a two-column grid.
 * Handles loading, empty, and populated states.
 *
 * @param userId - Optional user ID. If omitted, shows stats for current user.
 */
export function StatsSection({ userId }: StatsSectionProps) {
  const [stats, setStats] = useState<BBQStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStatistics(userId)
        setStats(data)
      } catch (error) {
        console.error('Failed to load statistics:', error)
        setStats({
          totalSessions: 0,
          daysThisYear: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [userId])

  // Show empty state only for current user (when no userId provided) and they have no sessions
  // For other users, always show stats even if zero
  if (!isLoading && stats && stats.totalSessions === 0 && !userId) {
    return <StatsEmptyState />
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Total Sessions Stat */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center gap-2">
        {isLoading ? (
          <>
            <div className="w-6 h-6 bg-foreground/10 rounded animate-pulse" />
            <div className="w-16 h-10 bg-foreground/10 rounded animate-pulse" />
            <div className="w-24 h-4 bg-foreground/10 rounded animate-pulse" />
          </>
        ) : (
          <>
            <Icon path={mdiFire} size={1} className="w-6 h-6 text-primary" />
            <div className="text-4xl font-bold text-foreground tabular-nums">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-sm text-foreground/60 font-medium text-center">
              Total Sessions
            </div>
          </>
        )}
      </div>

      {/* Days This Year Stat */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center gap-2">
        {isLoading ? (
          <>
            <div className="w-6 h-6 bg-foreground/10 rounded animate-pulse" />
            <div className="w-16 h-10 bg-foreground/10 rounded animate-pulse" />
            <div className="w-24 h-4 bg-foreground/10 rounded animate-pulse" />
          </>
        ) : (
          <>
            <Icon path={mdiCalendar} size={1} className="w-6 h-6 text-primary" />
            <div className="text-4xl font-bold text-foreground tabular-nums">
              {stats?.daysThisYear || 0}
            </div>
            <div className="text-sm text-foreground/60 font-medium text-center">
              Days This Year
            </div>
          </>
        )}
      </div>
    </div>
  )
}
