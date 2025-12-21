'use client'

import { useState } from 'react'
import { BBQStatistics, StatType, STAT_ICONS } from '@/types/statistics'
import { StatCard } from './StatCard'
import { StatInfoModal } from './StatInfoModal'

interface StatsGridProps {
  /** BBQ statistics data to display */
  stats: BBQStatistics
}

/**
 * StatsGrid Component
 *
 * Displays a responsive grid of BBQ statistic cards.
 * Shows 2 columns on desktop, stacked vertically on mobile.
 * Manages the info modal state for showing stat explanations.
 */
export function StatsGrid({ stats }: StatsGridProps) {
  const [activeInfo, setActiveInfo] = useState<StatType>(null)

  const handleInfoClick = (statType: Exclude<StatType, null>) => {
    setActiveInfo(statType)
  }

  const handleCloseModal = () => {
    setActiveInfo(null)
  }

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        role="region"
        aria-label="BBQ Statistics"
      >
        <StatCard
          icon={STAT_ICONS.total}
          value={stats.totalSessions}
          label="Total BBQ Sessions"
          statType="total"
          onInfoClick={handleInfoClick}
        />
        <StatCard
          icon={STAT_ICONS.year}
          value={stats.daysThisYear}
          label="Days Grilled This Year"
          statType="year"
          onInfoClick={handleInfoClick}
        />
      </div>

      <StatInfoModal
        type={activeInfo}
        onClose={handleCloseModal}
      />
    </>
  )
}
