'use client'

import { useSupabase } from '@/app/supabase-provider'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Avatar from './Avatar'
import { useProfile } from './ProfileProvider'

export default function AuthButton() {
  const { session } = useSupabase()
  const { profile } = useProfile()
  const pathname = usePathname()

  const isOnboardingPage = pathname === '/onboarding'

  if (session && !isOnboardingPage) {
    return (
      <Link href="/profile" className="flex items-center gap-2">
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
           <Avatar uid={session.user.id} url={profile?.avatar_url || null} size={36} />
        </div>
      </Link>
    )
  }

  if (session && isOnboardingPage) {
    return null
  }

  return null
}