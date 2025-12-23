'use client'

import { useState } from 'react'
import { SessionWithProfile } from '@/types/session'
import { SessionCard } from './SessionCard'
import { getUserSessions } from '@/app/actions/get-user-sessions'
import Link from 'next/link'

interface UserSessionListProps {
  initialSessions: SessionWithProfile[]
  userId: string
  readOnly?: boolean
}

export function UserSessionList({
  initialSessions,
  userId,
  readOnly = false,
}: UserSessionListProps) {
  const [sessions, setSessions] = useState<SessionWithProfile[]>(initialSessions)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialSessions.length === 10)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    try {
      const newSessions = await getUserSessions(userId, page)
      setSessions([...sessions, ...newSessions])
      setHasMore(newSessions.length === 10)
      setPage(page + 1)
    } catch (error) {
      console.error('Error loading more sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 text-foreground/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {readOnly ? 'No Sessions Yet' : 'No Sessions Yet'}
        </h3>
        <p className="text-foreground/60 mb-6 max-w-sm">
          {readOnly
            ? 'This user hasn\'t posted any BBQ sessions yet.'
            : 'Time to fire up the grill! Tap the + button to record your first BBQ.'}
        </p>
        {!readOnly && (
          <Link
            href="/sessions/new"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Your First Session
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} readOnly={readOnly} />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-card border border-border text-foreground font-semibold rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
