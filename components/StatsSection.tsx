'use client'

import { useEffect, useState } from 'react'
import { Flame, Calendar } from 'lucide-react'
import { BBQStatistics } from '@/types/statistics'
import { StatsEmptyState } from './StatsEmptyState'
import { getStatistics } from '@/app/actions/get-statistics'

/**
 * StatsSection Component
 *
 * Fetches and displays BBQ statistics for the current user.
 * Shows total sessions and grill days this year in a two-column grid.
 * Handles loading, empty, and populated states.
 */
export function StatsSection() {
  const [stats, setStats] = useState<BBQStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStatistics()
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
  }, [])

  // Show empty state if no sessions
  if (!isLoading && stats && stats.totalSessions === 0) {
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
            <Flame className="w-6 h-6 text-primary" />
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
            <Calendar className="w-6 h-6 text-primary" />
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
