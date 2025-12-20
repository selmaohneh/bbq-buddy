'use client'

import { LucideIcon } from 'lucide-react'

interface CompactStatCardProps {
  icon: LucideIcon
  value: number
  label: string
  hint?: string
  loading?: boolean
}

export function CompactStatCard({ icon: Icon, value, label, hint, loading = false }: CompactStatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex-1">
      <div className="flex flex-col items-center text-center gap-2">
        {/* Icon */}
        <Icon className="w-5 h-5 text-primary" />

        {/* Value */}
        {loading ? (
          <div className="w-12 h-8 bg-foreground/10 rounded animate-pulse" />
        ) : (
          <div className="text-3xl font-bold text-foreground tabular-nums">
            {value}
          </div>
        )}

        {/* Label */}
        <p className="text-xs text-foreground/60 font-medium">
          {label}
        </p>

        {/* Hint (for zero values) */}
        {value === 0 && hint && !loading && (
          <p className="text-[10px] text-foreground/40 mt-1">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
