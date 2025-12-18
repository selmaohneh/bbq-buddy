import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function Index() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full h-16 border-b border-b-foreground/10 flex justify-center">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          {user ? (
            <div className="flex items-center gap-4">
              Hey, {user.email}!
              <form action="/auth/signout" method="post">
                <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                  Logout
                </button>
              </form>
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
