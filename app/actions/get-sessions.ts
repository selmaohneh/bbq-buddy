'use server'

import { createClient } from '@/utils/supabase/server'
import { Session } from '@/types/session'

const PAGE_SIZE = 5

export async function getSessions(page: number = 0): Promise<Session[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false }) // Secondary sort
    .range(from, to)

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data as Session[]
}
