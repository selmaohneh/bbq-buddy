'use client'

import { useState, useTransition } from 'react'
import { yummySession } from '@/app/actions/yummy-session'
import { unyummySession } from '@/app/actions/unyummy-session'
import { toast } from 'sonner'
import Icon from '@mdi/react'
import { mdiFire } from '@mdi/js'

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
 * Displays a yummy button with flame icon, count, and label text.
 * Handles yummy/unyummy actions with optimistic updates.
 * Can trigger modal to show list of users who yummied.
 *
 * UI States:
 * - 0 yummies: "🔥 Yummy"
 * - 1 yummy: "🔥 1 Yummy"
 * - 2+ yummies: "🔥 42 Yummies"
 *
 * Click behavior:
 * - Not yummied & can yummy: Click to yummy the session
 * - Already yummied: Click to show list of who yummied
 * - Own session: Button disabled, but shows count and list (if count > 0)
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
    e.stopPropagation() // Prevent event bubbling to parent elements
    e.preventDefault()  // Prevent Link navigation in SessionCard

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

  // Get label text with proper pluralization
  const getLabel = () => {
    if (yummyCount === 0) return 'Yummy'
    return yummyCount === 1 ? 'Yummy' : 'Yummies'
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
            hasYummied || yummyCount > 0
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground'
          }
          ${!canYummy ? 'cursor-default' : 'cursor-pointer'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={
          canYummy
            ? hasYummied
              ? 'See who yummied this'
              : 'Yummy this session'
            : yummyCount > 0
            ? 'See who yummied this'
            : 'Cannot yummy your own session'
        }
      >
        {/* Flame Icon */}
        <Icon path={mdiFire} size={0.85} className="shrink-0" />

        {/* Count (if > 0) */}
        {yummyCount > 0 && (
          <span className="text-sm font-semibold">{yummyCount}</span>
        )}

        {/* Label Text */}
        <span className="text-sm font-medium">{getLabel()}</span>

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
