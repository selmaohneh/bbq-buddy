'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/app/supabase-provider'

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  updated_at: string | null
}

type ProfileContextType = {
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  setProfile: (profile: Profile | null) => void // Allow manual optimistic updates
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { supabase, session } = useSupabase()
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!session?.user) {
      setProfileState(null)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error('Error fetching profile:', error)
      }

      setProfileState(data)
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [session, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Explicitly expose setProfile for optimistic updates
  const setProfile = useCallback((newProfile: Profile | null) => {
    setProfileState(newProfile)
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
