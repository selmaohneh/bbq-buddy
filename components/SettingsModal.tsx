'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@mdi/react'
import { mdiClose } from '@mdi/js'
import { useSupabase } from '@/app/supabase-provider'
import { toast } from 'sonner'

interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

/**
 * SettingsModal Component
 *
 * Displays a modal overlay for account settings including email change,
 * password change, and logout functionality.
 * Supports keyboard navigation (Escape to close) and click-outside-to-dismiss.
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { supabase } = useSupabase()
  const router = useRouter()

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Handle escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Set up escape key listener and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Handle email update
  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault()

    if (!newEmail.trim()) {
      toast.error('Please enter a new email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsUpdatingEmail(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error

      toast.success('Confirmation email sent! Check your inbox and click the link to verify your new email.')
      setNewEmail('')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle password update
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsUpdatingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
      setIsLoggingOut(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full max-h-[80vh] shadow-2xl animate-slide-up flex flex-col overflow-y-auto">
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
          id="settings-modal-title"
          className="text-xl font-bold text-foreground pr-8 mb-6"
        >
          Account Settings
        </h2>

        {/* Email Change Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">
            Change Email
          </h3>
          <form onSubmit={handleUpdateEmail} className="space-y-3">
            <input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={isUpdatingEmail}
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isUpdatingEmail}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdatingEmail ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Updating...</span>
                </>
              ) : (
                'Update Email'
              )}
            </button>
          </form>
          <p className="text-xs text-foreground/50 mt-2">
            You'll receive a confirmation email to verify the change.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Password Change Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">
            Change Password
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <input
              type="password"
              placeholder="New password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdatingPassword}
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Updating...</span>
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Logout Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">
            Logout
          </h3>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <span>Logging out...</span>
              </>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
