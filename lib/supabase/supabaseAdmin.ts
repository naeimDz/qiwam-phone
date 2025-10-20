// lib/supabase/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseServiceKey } from './config'

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = () =>
  createClient(supabaseUrl, supabaseServiceKey)
