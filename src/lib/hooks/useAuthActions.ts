// lib/hooks/useAuthActions.ts
// ✅ Unified auth actions using AuthContext
// ✅ No window.location.reload()
// ✅ No race conditions with setTimeout
// ✅ Properly uses router.refresh() for SSR data updates
'use client'

import { useRouter } from 'next/navigation'
import { createClientBrowser } from '@/lib/supabase/supabaseClient'
import { useAuth } from './useAuth'

export function useAuthActions() {
  const router = useRouter()
  const supabase = createClientBrowser()
  const { refreshUserData, signOut: contextSignOut } = useAuth()

  const signup = async ({
    email,
    password,
    fullname,
    phone,
    storeName,
    taxNumber,
  }: {
    email: string
    password: string
    fullname: string
    phone: string
    storeName?: string
    taxNumber?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // ✅ No email confirmation needed
        data: { fullname, phone, storeName, taxNumber },
      },
    })

    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('فشل إنشاء الحساب')

    // ✅ Use router.refresh() to get updated user data from server
    await refreshUserData()
    
    // ✅ Navigate to home page after successful signup
    router.push('/')
    
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) throw new Error('بيانات الدخول غير صحيحة')
    if (!data.session) throw new Error('فشل تسجيل الدخول')

    // ✅ Use router.refresh() to get updated user data from server
    await refreshUserData()
    
    // ✅ Navigate to home page after successful login
    router.push('/')
  }

  // ✅ Use signOut from context (already handles cleanup)
  const signOut = contextSignOut

  return { signup, signIn, signOut }
}