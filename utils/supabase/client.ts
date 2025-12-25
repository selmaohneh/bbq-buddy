import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance - created once per browser session
let client: SupabaseClient | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (client) {
    return client
  }

  // Create a supabase client on the browser with project's credentials
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Note: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY corresponds to the Anon key
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  )

  return client
}
