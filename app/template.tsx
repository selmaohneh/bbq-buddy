'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useSupabase } from '@/app/supabase-provider'
import { useProfile } from '@/components/ProfileProvider'

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session } = useSupabase()
  const { profile, loading } = useProfile()

  useEffect(() => {
    // Whitelist routes that don't require username check
    const whitelistedRoutes = ['/login', '/onboarding']
    const isWhitelisted = whitelistedRoutes.some(route => pathname?.startsWith(route))

    if (isWhitelisted) {
      return
    }

    // Wait for profile to load
    if (loading) {
      return
    }

    // If user is authenticated but has no username, redirect to onboarding
    if (session && profile && !profile.username) {
      router.push('/onboarding')
    }
  }, [session, profile, loading, pathname, router])

  return <>{children}</>
}

// Export with ssr disabled to prevent prerender issues
export default dynamic(() => Promise.resolve(OnboardingGate), { ssr: false })
