import Link from 'next/link'
import { Flame } from 'lucide-react'

/**
 * StatsEmptyState Component
 *
 * Displayed when the user has no BBQ sessions.
 * Shows an encouraging message with a call-to-action to create their first session.
 */
export function StatsEmptyState() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
      {/* Muted grill icon */}
      <div className="flex justify-center mb-4">
        <Flame size={48} className="text-foreground/20" />
      </div>

      {/* Heading */}
      <h3 className="text-xl font-bold text-foreground mb-2">
        Ready to Start Grilling?
      </h3>

      {/* Description */}
      <p className="text-sm text-foreground/60 mb-6 max-w-xs mx-auto">
        Create your first BBQ session to unlock your statistics dashboard and start tracking your grilling journey!
      </p>

      {/* Call-to-action button */}
      <Link
        href="/sessions/new"
        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
      >
        Create First Session
      </Link>
    </div>
  )
}
