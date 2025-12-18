'use client'

import { useSupabase } from './supabase-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Page() {
  const { session, supabase } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full h-16 border-b border-b-foreground/10 flex justify-center">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          {session ? (
            <div className="flex items-center gap-4">
              Hey, {session.user.email}!
              <button
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl mb-4">Next steps</h2>
          <p>Welcome to BBQ Buddy v2!</p>
        </main>
      </div>
    </div>
  )
}
