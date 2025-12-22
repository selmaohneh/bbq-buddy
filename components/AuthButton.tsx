'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Icon from '@mdi/react'
import { mdiAccountMultiple } from '@mdi/js'
import Avatar from './Avatar'
import { useProfile } from './ProfileProvider'
import { FriendsModal } from './FriendsModal'

export default function AuthButton() {
  const { session } = useSupabase()
  const { profile } = useProfile()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isOnboardingPage = pathname === '/onboarding'
  const isProfilePage = pathname?.startsWith('/profile')

  if (session && !isOnboardingPage) {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* Friends Icon - shown only on profile pages */}
          {isProfilePage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="View friends and search users"
            >
              <Icon path={mdiAccountMultiple} size={0.9} className="text-white" />
            </button>
          )}

          {/* Profile Avatar Link */}
          <Link href="/profile" className="flex items-center gap-2">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar uid={session.user.id} url={profile?.avatar_url || null} size={36} />
            </div>
          </Link>
        </div>

        {/* Friends Modal */}
        <FriendsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  if (session && isOnboardingPage) {
    return null
  }

  return null
}