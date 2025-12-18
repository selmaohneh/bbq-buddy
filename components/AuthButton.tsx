'use client'

import { useSupabase } from '@/app/supabase-provider'
import Link from 'next/link'
import Avatar from './Avatar'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const { session, supabase } = useSupabase()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      if (!session?.user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single()
        
      if (!ignore && data) {
        setAvatarUrl(data.avatar_url)
      }
    }
    
    if (session) {
        getProfile()
    } else {
        setAvatarUrl(null)
    }

    return () => {
        ignore = true
    }
  }, [session, supabase])

  if (session) {
    return (
      <Link href="/profile" className="flex items-center gap-2">
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
           <Avatar uid={session.user.id} url={avatarUrl} size={36} />
        </div>
      </Link>
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