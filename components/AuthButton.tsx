'use client'

import { useSupabase } from '@/app/supabase-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const { session, supabase } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm hidden sm:inline-block text-white/90">
          {session.user.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-md transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/login"
      className="text-sm bg-white text-primary hover:bg-gray-100 py-2 px-4 rounded-md font-medium transition-colors"
    >
      Login
    </Link>
  )
}
