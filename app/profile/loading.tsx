import { SessionCardSkeleton } from '@/components/SessionCardSkeleton'

/**
 * Own Profile Loading UI
 *
 * Note: The profile page is a client component, so this loading.tsx
 * may only show during navigation. The page itself uses inline loading
 * states with isLoadingSessions and isLoadingFollowers.
 *
 * This provides consistent loading UI during route transitions.
 */
export default function ProfileLoading() {
  return (
    <div
      className="w-full flex flex-col min-h-screen p-4"
      role="status"
      aria-label="Loading profile"
    >
      <main className="flex-1 w-full flex flex-col">
        {/* Profile Info Section Skeleton */}
        <div className="p-6 max-w-md mx-auto w-full flex flex-col gap-6">
          {/* Avatar Section Skeleton */}
          <div className="flex flex-col items-center gap-3">
            {/* Avatar (120px to match Avatar component size) */}
            <div className="w-[120px] h-[120px] rounded-full bg-foreground/10 animate-pulse" />

            {/* Username, Member Since, Follower Count */}
            <div className="text-center space-y-2">
              <div className="w-32 h-5 bg-foreground/10 rounded animate-pulse mx-auto" />
              <div className="w-40 h-4 bg-foreground/10 rounded animate-pulse mx-auto" />
              <div className="w-24 h-4 bg-foreground/10 rounded animate-pulse mx-auto" />
            </div>
          </div>

          {/* Stats Section Skeleton (matches StatsSection.tsx) */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center gap-2"
              >
                <div className="w-6 h-6 bg-foreground/10 rounded animate-pulse" />
                <div className="w-16 h-10 bg-foreground/10 rounded animate-pulse" />
                <div className="w-24 h-4 bg-foreground/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Session List Section Skeleton */}
        <div className="w-full max-w-lg mx-auto mt-6">
          <div className="flex flex-col gap-4 pb-20">
            <SessionCardSkeleton count={3} />
          </div>
        </div>
      </main>

      <span className="sr-only">Loading profile...</span>
    </div>
  )
}
