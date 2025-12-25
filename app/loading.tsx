import { SessionCardSkeleton } from '@/components/SessionCardSkeleton'

/**
 * Home Page Loading UI
 *
 * Automatically displayed by Next.js during:
 * - Initial page load (server fetching sessions)
 * - Navigation to home page
 * - After redirect from session creation
 *
 * Shows 3 skeleton cards that match the SessionCard layout.
 */
export default function Loading() {
  return (
    <div
      className="flex-1 w-full flex flex-col items-center justify-center p-4 min-h-[80vh]"
      role="status"
      aria-label="Loading sessions"
    >
      <div className="mt-4 space-y-6 w-full max-w-lg">
        <div className="space-y-4 w-full">
          <SessionCardSkeleton count={3} />
        </div>
      </div>
      <span className="sr-only">Loading sessions...</span>
    </div>
  )
}
