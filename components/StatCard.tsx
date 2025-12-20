'use client'

import { Flame, Calendar, CalendarDays, CalendarClock, Info, LucideIcon } from 'lucide-react'
import { StatType, EMPTY_HINTS } from '@/types/statistics'

const iconMap: Record<string, LucideIcon> = {
  flame: Flame,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  'calendar-clock': CalendarClock,
}

interface StatCardProps {
  /** Icon name from lucide-react */
  icon: string
  /** The numeric value to display */
  value: number
  /** Descriptive label for the stat */
  label: string
  /** Stat type for info modal (total, year, month, week) */
  statType: Exclude<StatType, null>
  /** Callback when info button is clicked */
  onInfoClick: (statType: Exclude<StatType, null>) => void
}

/**
 * StatCard Component
 *
 * Displays a single BBQ statistic with an icon, numeric value, and label.
 * Includes an info button that triggers an explanation modal.
 * Shows muted styling and hint text when value is 0.
 */
export function StatCard({ icon, value, label, statType, onInfoClick }: StatCardProps) {
  const IconComponent = iconMap[icon] || Flame
  const isEmpty = value === 0
  const emptyHint = EMPTY_HINTS[statType]

  return (
    <div className="relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow min-h-[160px] flex flex-col">
      {/* Main Icon - Top Left */}
      <div className={`absolute top-4 left-4 text-primary ${isEmpty ? 'opacity-40' : 'opacity-100'}`}>
        <IconComponent size={24} />
      </div>

      {/* Info Icon - Top Right */}
      <button
        onClick={() => onInfoClick(statType)}
        className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors p-2 -m-2 rounded-full hover:bg-foreground/5"
        aria-label={`Learn more about ${label}`}
      >
        <Info size={20} />
      </button>

      {/* Stat Value and Label - Centered */}
      <div className="flex flex-col items-center justify-center flex-1 mt-4">
        <div className={`text-4xl font-bold mb-2 ${isEmpty ? 'text-foreground/40' : 'text-primary'}`}>
          {value.toLocaleString()}
        </div>
        <div className="text-base font-semibold text-foreground text-center leading-tight">
          {label}
        </div>
        {isEmpty && emptyHint && (
          <div className="text-xs text-foreground/50 mt-2 text-center italic">
            {emptyHint}
          </div>
        )}
      </div>
    </div>
  )
}
