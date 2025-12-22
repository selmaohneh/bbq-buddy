'use client'

import { Session } from '@/types/session'
import { SessionCard } from './SessionCard'
import { useState } from 'react'
import { getSessions } from '@/app/actions/get-sessions'

interface SessionListProps {
  initialSessions: Session[]
}

export function SessionList({ initialSessions }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
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
        <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
        </div>
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
          <SessionCard key={session.id} session={session} />
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
