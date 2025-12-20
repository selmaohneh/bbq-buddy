'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { StatType, STAT_INFO } from '@/types/statistics'

interface StatInfoModalProps {
  /** The stat type to display info for, or null if modal should be closed */
  type: StatType
  /** Callback to close the modal */
  onClose: () => void
}

/**
 * StatInfoModal Component
 *
 * Displays a modal overlay with detailed explanation about a specific BBQ statistic.
 * Supports keyboard navigation (Escape to close) and click-outside-to-dismiss.
 * Animates in with a fade and slide-up effect.
 */
export function StatInfoModal({ type, onClose }: StatInfoModalProps) {
  // Handle escape key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (type) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [type, handleKeyDown])

  if (!type) return null

  const info = STAT_INFO[type]

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
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors p-2 -m-2 rounded-full hover:bg-foreground/5"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal title */}
        <h2
          id="modal-title"
          className="text-xl font-bold text-foreground pr-8 mb-4"
        >
          {info.title}
        </h2>

        {/* Modal description */}
        <p className="text-foreground/80 text-sm leading-relaxed">
          {info.description}
        </p>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
