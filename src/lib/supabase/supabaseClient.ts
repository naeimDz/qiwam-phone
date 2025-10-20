// lib/supabase/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey, commonAuthConfig } from './config'

export const createClientBrowser = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: commonAuthConfig
  })