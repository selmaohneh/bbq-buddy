import { useEffect, useRef } from 'react'

/**
 * Custom hook to integrate modals with browser history
 *
 * When a modal opens, this hook pushes a new history entry.
 * When the user presses the back button, it closes the modal instead of navigating away.
 * When the modal is closed programmatically, it removes the history entry.
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 */
export function useModalHistory(isOpen: boolean, onClose: () => void) {
  const historyPushedRef = useRef(false)

  useEffect(() => {
    if (isOpen && !historyPushedRef.current) {
      // Push a new history entry when modal opens
      window.history.pushState({ modalOpen: true }, '')
      historyPushedRef.current = true

      // Handle back button
      const handlePopState = (event: PopStateEvent) => {
        if (historyPushedRef.current) {
          historyPushedRef.current = false
          onClose()
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }

    // When modal closes programmatically (not via back button)
    if (!isOpen && historyPushedRef.current) {
      historyPushedRef.current = false
      // Remove the history entry we added
      window.history.back()
    }
  }, [isOpen, onClose])
}
