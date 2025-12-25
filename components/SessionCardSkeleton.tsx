'use client'

interface SessionCardSkeletonProps {
  count?: number
}

/**
 * SessionCardSkeleton Component
 *
 * Displays skeleton loading placeholders that match the SessionCard layout.
 * Uses Tailwind's animate-pulse with bg-foreground/10 pattern (consistent with StatsSection).
 *
 * @param count - Number of skeleton cards to render (default: 1)
 */
export function SessionCardSkeleton({ count = 1 }: SessionCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group relative flex flex-col sm:flex-row bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Image Section Skeleton */}
          <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 bg-foreground/5">
            <div className="w-full h-full bg-foreground/10 animate-pulse" />
          </div>

          {/* Content Section Skeleton */}
          <div className="flex flex-col p-4 gap-2 flex-1">
            {/* Avatar + Username */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse" />
              <div className="w-24 h-4 bg-foreground/10 rounded animate-pulse" />
            </div>

            {/* Title (2 lines) */}
            <div className="space-y-2">
              <div className="w-3/4 h-5 bg-foreground/10 rounded animate-pulse" />
              <div className="w-1/2 h-5 bg-foreground/10 rounded animate-pulse" />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-4 bg-foreground/10 rounded animate-pulse" />
            </div>

            {/* Tags */}
            <div className="mt-auto pt-2 flex flex-wrap gap-2">
              <div className="w-16 h-6 bg-foreground/10 rounded-full animate-pulse" />
              <div className="w-16 h-6 bg-foreground/10 rounded-full animate-pulse" />
              <div className="w-16 h-6 bg-foreground/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
