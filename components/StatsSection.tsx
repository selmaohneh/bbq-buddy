'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { BBQStatistics } from '@/types/statistics'
import { StatsGrid } from './StatsGrid'
import { StatsEmptyState } from './StatsEmptyState'
import { getStatistics } from '@/app/actions/get-statistics'

/**
 * StatsSection Component
 *
 * Fetches and displays BBQ statistics for the current user.
 * Handles loading, empty, and populated states.
 * Uses the server action to fetch data on the client side.
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
          daysThisMonth: 0,
          daysThisWeek: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <section className="mt-8" aria-label="BBQ Statistics">
      {/* Section heading */}
      <h2 className="text-lg font-bold text-center mb-4 flex items-center justify-center gap-2 text-foreground">
        <Flame size={20} className="text-primary" />
        Your BBQ Stats
      </h2>

      {isLoading ? (
        <StatsGridSkeleton />
      ) : stats && stats.totalSessions === 0 ? (
        <StatsEmptyState />
      ) : stats ? (
        <StatsGrid stats={stats} />
      ) : null}
    </section>
  )
}

/**
 * StatsGridSkeleton Component
 *
 * Loading state placeholder for the stats grid.
 * Shows pulsing skeleton cards while data is being fetched.
 */
function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-6 min-h-[160px] animate-pulse"
        >
          {/* Icon placeholder */}
          <div className="absolute top-4 left-4">
            <div className="w-6 h-6 bg-foreground/10 rounded" />
          </div>

          {/* Info icon placeholder */}
          <div className="absolute top-4 right-4">
            <div className="w-5 h-5 bg-foreground/10 rounded-full" />
          </div>

          {/* Content placeholder */}
          <div className="flex flex-col items-center justify-center h-full gap-3 mt-4">
            <div className="w-16 h-10 bg-foreground/10 rounded" />
            <div className="w-32 h-5 bg-foreground/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
