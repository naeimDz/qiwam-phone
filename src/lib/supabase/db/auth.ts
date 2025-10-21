// lib/supabase/db/auth.ts
// DB Layer - Authentication queries only

import { createClientServer } from '@/lib/supabase'
import { AuthUser, UserProfile } from '@/lib/types'


/**
 * Get current authenticated user with store info
 * This is the FOUNDATION - every operation starts here
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClientServer()
  
  // Get auth user from Supabase Auth (email, phone, password managed here)
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !authUser) {
    return null
  }

  // Get user profile from users table (storeid, role, fullname)
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, storeid, fullname, role, active')
    .eq('id', authUser.id)
    .is('deleted_at', null)
    .single()

  if (profileError || !userProfile || !userProfile.active) {
    return null
  }

  return {
    id: userProfile.id,
    email: authUser.email ?? null,
    storeid: userProfile.storeid,
    fullname: userProfile.fullname,
    role: userProfile.role,
  }
}

/**
 * Get user by ID (for admin operations)
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all users for a specific store
 */
export async function getUsersByStore(storeid: string): Promise<UserProfile[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('createdat', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: UserProfile['role']): Promise<UserProfile> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('users')
    .update({ role, updatedat: new Date().toISOString() })
    .eq('id', userId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('users')
    .update({ 
      deleted_at: new Date().toISOString(),
      updatedat: new Date().toISOString() 
    })
    .eq('id', userId)

  if (error) throw error
}


/**
 * Create user profile (after Supabase Auth signup)
 * Called by signup trigger or manually after auth.signUp()
 */
export async function createUserProfile(
  authUserId: string,
  storeid: string,
  fullname: string,
  role: UserProfile['role'] = 'seller'
): Promise<UserProfile> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: authUserId, // IMPORTANT: Use auth user ID, not auto-generated
      storeid,
      fullname,
      role,
      active: true
    }])
    .select('*')
    .single()

  if (error) throw error
  return data
}