import Link from 'next/link'
import Icon from '@mdi/react'
import { mdiFire } from '@mdi/js'

/**
 * StatsEmptyState Component
 *
 * Displayed when the user has no BBQ sessions.
 * Shows an encouraging message with a call-to-action to create their first session.
 */
export function StatsEmptyState() {
  return (
    <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 text-center">
      {/* Muted grill icon */}
      <div className="flex justify-center mb-4">
        <Icon path={mdiFire} size={2} className="text-foreground/20" />
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
