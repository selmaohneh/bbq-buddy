'use client'

import { createSession } from '@/app/actions/create-session'
import { SessionForm } from '@/components/SessionForm'

export default function NewSessionPage() {
  return <SessionForm action={createSession} />
}