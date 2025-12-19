'use client'

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user has a username before redirecting
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()

        if (profile?.username) {
          router.push('/')
        } else {
          router.push('/onboarding')
        }
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (!isMounted) return null

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-10">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--primary)]">Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#D64933',
                  brandAccent: '#A8321F',
                  inputBackground: 'var(--input-background)',
                  inputText: 'var(--foreground)',
                  inputBorder: 'var(--border)',
                  inputLabelText: 'var(--foreground)',
                },
              },
            },
          }}
          theme="default"
          providers={[]}
        />
      </div>
    </div>
  )
}
