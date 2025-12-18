'use client'

import { useSupabase } from '@/app/supabase-provider'
import Link from 'next/link'
import Avatar from './Avatar'
import { useProfile } from './ProfileProvider'

export default function AuthButton() {
  const { session } = useSupabase()
  const { profile } = useProfile()

  if (session) {
    return (
      <Link href="/profile" className="flex items-center gap-2">
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
           <Avatar uid={session.user.id} url={profile?.avatar_url || null} size={36} />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="text-sm bg-white text-primary hover:bg-white/90 py-2 px-4 rounded-md font-medium transition-colors"
    >
      Login
    </Link>
  )
}