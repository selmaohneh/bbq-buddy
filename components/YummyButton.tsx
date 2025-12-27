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
 * YummyButton Component - Reddit Upvote Style
 *
 * Displays a compact chip with two clickable sections:
 * - Left: Flame icon (toggles yummy on/off)
 * - Right: Count number (shows list of who yummied)
 *
 * Visual States:
 * - Not yummied: Gray/muted colors
 * - Yummied: Red/primary colors
 *
 * Click Behaviors:
 * - Flame icon: Toggle yummy (add if not yummied, remove if yummied)
 * - Count: Show list of users who yummied
 * - Own sessions: Flame shows message, count still shows list
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

  // Handle flame icon click - Toggle yummy
  const handleToggleYummy = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Own session - show informative message
    if (!canYummy && !hasYummied) {
      toast.info('You cannot yummy your own session')
      return
    }

    if (hasYummied) {
      // Remove yummy (unyummy)
      handleUnyummy()
    } else {
      // Add yummy
      handleYummy()
    }
  }

  // Handle count click - Show list
  const handleShowList = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onShowList()
  }

  // Add yummy with optimistic update
  const handleYummy = () => {
    const previousCount = yummyCount
    const previousHasYummied = hasYummied

    // Optimistic update
    setYummyCount(yummyCount + 1)
    setHasYummied(true)

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

  // Remove yummy with optimistic update
  const handleUnyummy = () => {
    const previousCount = yummyCount
    const previousHasYummied = hasYummied

    // Optimistic update
    setYummyCount(yummyCount - 1)
    setHasYummied(false)

    startTransition(async () => {
      try {
        const result = await unyummySession(sessionId)

        if (!result.success) {
          // Revert on error
          setYummyCount(previousCount)
          setHasYummied(previousHasYummied)
          toast.error(result.error || 'Failed to remove yummy')
        }
      } catch (error) {
        // Revert on exception
        setYummyCount(previousCount)
        setHasYummied(previousHasYummied)
        toast.error('An error occurred')
        console.error('Unyummy error:', error)
      }
    })
  }

  // Determine chip styling based on state
  const chipBgColor = hasYummied
    ? 'bg-primary/10 border-primary/20'
    : 'bg-foreground/5 border-foreground/10'

  const textColor = hasYummied ? 'text-primary' : 'text-foreground/60'

  const separatorColor = hasYummied ? 'bg-primary/30' : 'bg-foreground/20'

  const hoverBg = hasYummied
    ? 'hover:bg-primary/20'
    : 'hover:bg-foreground/10'

  return (
    <div
      className={`inline-flex items-center rounded-full border overflow-hidden ${chipBgColor} ${textColor}`}
    >
      {/* Left section: Flame icon toggle */}
      <button
        onClick={handleToggleYummy}
        disabled={isPending}
        className={`
          flex items-center justify-center px-2.5 py-1.5 transition-colors relative
          ${hoverBg}
          ${!canYummy && !hasYummied ? 'cursor-default' : 'cursor-pointer'}
          disabled:opacity-50
        `}
        aria-label={
          canYummy || hasYummied
            ? hasYummied
              ? 'Remove yummy'
              : 'Yummy this session'
            : 'Cannot yummy your own session'
        }
      >
        <Icon path={mdiFire} size={0.6} className="shrink-0" />

        {/* Loading spinner overlay for icon section */}
        {isPending && (
          <svg
            className="animate-spin h-3 w-3 absolute"
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

      {/* Vertical separator */}
      <div className={`w-px h-4 ${separatorColor}`} />

      {/* Right section: Count */}
      <button
        onClick={handleShowList}
        disabled={isPending}
        className={`
          flex items-center justify-center px-2.5 py-1.5 min-w-[2rem] transition-colors
          ${hoverBg}
          cursor-pointer
          disabled:opacity-50
        `}
        aria-label="See who yummied this"
      >
        <span className="text-sm font-semibold">{yummyCount}</span>
      </button>
    </div>
  )
}
