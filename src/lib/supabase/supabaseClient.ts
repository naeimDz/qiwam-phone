// lib/supabase/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey, commonAuthConfig } from './config'

let client: SupabaseClient | null = null

export const createClientBrowser = () => {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: commonAuthConfig,
    })
  }
  return client
}
