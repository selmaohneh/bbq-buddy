'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/supabase-provider'
import { toast } from 'sonner'

/**
 * Settings Page
 *
 * Full page for account settings including email change,
 * password change, and logout functionality.
 */
export default function SettingsPage() {
  const { supabase } = useSupabase()
  const router = useRouter()

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  // Request deduplication: tracks in-flight email update promise
  const emailUpdatePromiseRef = useRef<Promise<void> | null>(null)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Handle email update
  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault()

    // Request deduplication: if there's already a request in progress, ignore this one
    if (emailUpdatePromiseRef.current) {
      console.warn('[SettingsPage] Email update already in progress, ignoring duplicate request')
      return
    }

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

    // Set UI state
    setIsUpdatingEmail(true)

    // Create and store the update promise for deduplication
    const updatePromise = (async () => {
      try {
        const { error } = await supabase.auth.updateUser(
          {
            email: newEmail,
          },
          {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        )

        if (error) throw error

        toast.success('Confirmation email sent! Check your inbox and click the link to verify your new email.')
        setNewEmail('')
      } catch (error: any) {
        toast.error(error.message || 'Failed to update email')
      } finally {
        // Clear the promise ref and reset UI state
        emailUpdatePromiseRef.current = null
        setIsUpdatingEmail(false)
      }
    })()

    // Store the promise to prevent duplicate requests
    emailUpdatePromiseRef.current = updatePromise
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-4 border-b border-foreground/10 bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Email Change Section */}
        <div className="mb-8 bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground/60 mb-4">
            Change Email
          </h2>
          <form onSubmit={handleUpdateEmail} className="space-y-3">
            <input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={isUpdatingEmail}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isUpdatingEmail}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <p className="text-xs text-foreground/50 mt-3">
            You'll receive a confirmation email to verify the change.
          </p>
        </div>

        {/* Password Change Section */}
        <div className="mb-8 bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground/60 mb-4">
            Change Password
          </h2>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <input
              type="password"
              placeholder="New password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdatingPassword}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Logout Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground/60 mb-4">
            Logout
          </h2>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
