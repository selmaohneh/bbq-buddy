'use client'

import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, CalendarClock } from 'lucide-react'
import { BBQStatistics } from '@/types/statistics'
import { HeroStatCard } from './HeroStatCard'
import { CompactStatCard } from './CompactStatCard'
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

  // Show empty state if no sessions
  if (!isLoading && stats && stats.totalSessions === 0) {
    return (
      <section className="mt-8" aria-label="BBQ Statistics">
        <StatsEmptyState />
      </section>
    )
  }

  return (
    <section className="mt-8" aria-label="BBQ Statistics">
      {/* Hero Stat: Total BBQ Sessions */}
      <HeroStatCard
        value={stats?.totalSessions || 0}
        loading={isLoading}
      />

      {/* Time-based Stats Row */}
      <div className="flex gap-3">
        <CompactStatCard
          icon={Calendar}
          value={stats?.daysThisYear || 0}
          label="Days This Year"
          hint="Start grilling!"
          loading={isLoading}
        />
        <CompactStatCard
          icon={CalendarDays}
          value={stats?.daysThisMonth || 0}
          label="Days This Month"
          hint="Fire it up!"
          loading={isLoading}
        />
        <CompactStatCard
          icon={CalendarClock}
          value={stats?.daysThisWeek || 0}
          label="Days This Week"
          hint="Time to BBQ!"
          loading={isLoading}
        />
      </div>
    </section>
  )
}

