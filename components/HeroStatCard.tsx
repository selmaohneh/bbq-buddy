'use client'

import { Flame } from 'lucide-react'

interface HeroStatCardProps {
  value: number
  loading?: boolean
}

export function HeroStatCard({ value, loading = false }: HeroStatCardProps) {
  return (
    <div className="bg-gradient-to-br from-primary/90 to-primary text-white rounded-3xl p-8 shadow-xl mb-6">
      <div className="flex flex-col items-center text-center">
        {/* Title with Icon */}
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6" />
          <h2 className="text-lg font-semibold opacity-95">Grill Master</h2>
        </div>

        {/* Main Number */}
        {loading ? (
          <div className="w-32 h-20 bg-white/20 rounded-lg animate-pulse mb-2" />
        ) : (
          <div className="text-6xl font-bold mb-2 tabular-nums">
            {value}
          </div>
        )}

        {/* Label */}
        <p className="text-sm opacity-90 font-medium">
          Total BBQ Sessions
        </p>
      </div>
    </div>
  )
}
