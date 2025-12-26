'use client'

import { useState, useTransition } from 'react'
import { yummySession } from '@/app/actions/yummy-session'
import { unyummySession } from '@/app/actions/unyummy-session'
import { toast } from 'sonner'

interface YummyButtonProps {
  sessionId: string
  initialYummyCount: number
  initialHasYummied: boolean
  canYummy: boolean  // false for own sessions
  onShowList: () => void  // Callback to show yummies list modal
}

/**
 * YummyButton Component
 *
 * Displays a yummy button with flame icon and count.
 * Handles yummy/unyummy actions with optimistic updates.
 * Can trigger modal to show list of users who yummied.
 *
 * Click behavior:
 * - Not yummied: Click to yummy
 * - Already yummied: Click to show list
 * - Count (if > 0): Click to show list
 * - Own session: Disabled (can still view list via count)
 */
export function YummyButton({
  sessionId,
  initialYummyCount,
  initialHasYummied,
  canYummy,
  onShowList,
}: YummyButtonProps) {
  const [yummyCount, setYummyCount] = useState(initialYummyCount)
  const [hasYummied, setHasYummied] = useState(initialHasYummied)
  const [isPending, startTransition] = useTransition()

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent SessionCard navigation

    // If can't yummy (own session) or already yummied, show list
    if (!canYummy || hasYummied) {
      if (yummyCount > 0) {
        onShowList()
      }
      return
    }

    // Otherwise, yummy the session
    handleYummy()
  }

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent SessionCard navigation
    if (yummyCount > 0) {
      onShowList()
    }
  }

  const handleYummy = () => {
    // Store previous state for potential revert
    const previousCount = yummyCount
    const previousHasYummied = hasYummied

    // Optimistic update
    setYummyCount(yummyCount + 1)
    setHasYummied(true)

    // Perform async action
    startTransition(async () => {
      try {
        const result = await yummySession(sessionId)

        if (!result.success) {
          // Revert on error
          setYummyCount(previousCount)
          setHasYummied(previousHasYummied)
          toast.error(result.error || 'Failed to yummy session')
        }
      } catch (error) {
        // Revert on exception
        setYummyCount(previousCount)
        setHasYummied(previousHasYummied)
        toast.error('An error occurred')
        console.error('Yummy error:', error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Yummy Button */}
      <button
        onClick={handleButtonClick}
        disabled={isPending}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors relative
          ${
            hasYummied
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground'
          }
          ${!canYummy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={
          canYummy
            ? hasYummied
              ? 'See who yummied this'
              : 'Yummy this session'
            : 'Cannot yummy your own session'
        }
      >
        {/* Flame Icon - outlined or filled */}
        {hasYummied ? (
          // Filled flame icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Outlined flame icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
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
        )}

        {/* Yummy Count - clickable to show list */}
        {yummyCount > 0 && (
          <span
            onClick={handleCountClick}
            className="text-sm font-semibold cursor-pointer hover:underline"
          >
            {yummyCount}
          </span>
        )}

        {/* Loading spinner overlay */}
        {isPending && (
          <svg
            className="animate-spin h-4 w-4 absolute"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
      </button>
    </div>
  )
}
