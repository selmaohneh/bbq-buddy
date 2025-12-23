import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { SessionDetailView } from '@/components/SessionDetailView'
import { SessionWithProfile } from '@/types/session'

interface SessionDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Session Detail Page
 *
 * Displays a read-only view of any BBQ session.
 * Accessible to all authenticated users for public sessions.
 */
export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch session with profile join
  const { data: session, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      profiles!sessions_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !session) {
    notFound()
  }

  // Check if user is authenticated to determine is_own_session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Flatten profile data
  const sessionWithProfile: SessionWithProfile = {
    ...session,
    username: session.profiles?.username || 'Unknown',
    avatar_url: session.profiles?.avatar_url || null,
    is_own_session: user?.id === session.user_id,
    // Remove the nested profiles object (TypeScript workaround)
    profiles: undefined as any,
  }

  return <SessionDetailView session={sessionWithProfile} />
}
