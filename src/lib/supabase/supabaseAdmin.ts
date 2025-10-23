// lib/supabase/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'
import { supabaseUrl } from './config'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY!) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
