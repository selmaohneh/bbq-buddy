'use client'

import { SessionWithProfile } from '@/types/session'
import { SessionCard } from './SessionCard'
import { useState } from 'react'
import { getSessions } from '@/app/actions/get-sessions'
import Icon from '@mdi/react'
import { mdiFire } from '@mdi/js'

interface SessionListProps {
  initialSessions: SessionWithProfile[]
}

export function SessionList({ initialSessions }: SessionListProps) {
  const [sessions, setSessions] = useState<SessionWithProfile[]>(initialSessions)
  const [page, setPage] = useState(1) // Next page to fetch
  const [hasMore, setHasMore] = useState(initialSessions.length >= 10) // PAGE_SIZE is 10
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    try {
      const newSessions = await getSessions(page)
      
      if (newSessions.length < 10) {
        setHasMore(false)
      }
      
      setSessions((prev) => [...prev, ...newSessions])
      setPage((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to load more sessions', error)
    } finally {
      setLoading(false)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-foreground/5 border border-foreground/10 text-center flex flex-col items-center gap-4">
        <Icon path={mdiFire} size={2.5} className="text-foreground/20" />
        <div>
            <p className="text-lg font-bold text-foreground">No sessions yet</p>
            <p className="text-foreground/60 max-w-xs mx-auto mt-1">
            Time to fire up the grill! Tap the + button to record your first BBQ.
            </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full pb-20">
      <div className="grid gap-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            readOnly={!session.is_own_session}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
