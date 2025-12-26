'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { getYummiesList } from '@/app/actions/get-yummies-list'
import { YummyListItem } from '@/types/yummy'
import Avatar from '@/components/Avatar'

interface YummiesListModalProps {
  sessionId: string | null  // null if modal should be closed
  onClose: () => void
}

/**
 * YummiesListModal Component
 *
 * Displays a modal overlay with the list of users who yummied a session.
 * Supports keyboard navigation (Escape to close) and click-outside-to-dismiss.
 */
export function YummiesListModal({ sessionId, onClose }: YummiesListModalProps) {
  const router = useRouter()
  const [yummies, setYummies] = useState<YummyListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Handle escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Load yummies list when modal opens
  useEffect(() => {
    if (sessionId) {
      const loadYummies = async () => {
        setIsLoading(true)
        try {
          const data = await getYummiesList(sessionId)
          setYummies(data)
        } catch (error) {
          console.error('Error loading yummies:', error)
          setYummies([])
        } finally {
          setIsLoading(false)
        }
      }

      loadYummies()
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [sessionId, handleKeyDown])

  if (!sessionId) return null

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors p-2 -m-2 rounded-full hover:bg-foreground/5"
          aria-label="Close modal"
        >
          <Icon path={mdiClose} size={0.8} />
        </button>

        {/* Modal title */}
        <h2
          id="modal-title"
          className="text-xl font-bold text-foreground pr-8 mb-4"
        >
          Yummies
        </h2>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-foreground/40"
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
          </div>
        ) : yummies.length > 0 ? (
          /* Yummies list - scrollable */
          <div className="overflow-y-auto flex-1 -mx-2 px-2">
            <div className="space-y-2">
              {yummies.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors text-left"
                >
                  <Avatar uid={user.id} url={user.avatar_url} size={40} />
                  <span className="font-medium text-foreground">
                    @{user.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-8 text-foreground/60">
            <p>No yummies yet.</p>
            <p className="text-sm mt-2">Be the first to yummy this session!</p>
          </div>
        )}
      </div>
    </div>
  )
}
