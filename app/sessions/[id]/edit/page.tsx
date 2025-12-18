import { createClient } from '@/utils/supabase/server'
import { SessionForm } from '@/components/SessionForm'
import { updateSession } from '@/app/actions/update-session'
import { deleteSession } from '@/app/actions/delete-session'
import { notFound, redirect } from 'next/navigation'
import { Session } from '@/types/session'

interface EditSessionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Session
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !session) {
    notFound()
  }

  // 3. Bind ID to actions
  const updateSessionWithId = updateSession.bind(null, id)
  
  // NOTE: deleteSession needs to be called from the client with imageUrls,
  // so we pass the raw function reference, and the client component handles the binding/arguments.

  return (
    <SessionForm 
        initialData={session as Session} 
        action={updateSessionWithId} 
        deleteAction={deleteSession}
    />
  )
}
