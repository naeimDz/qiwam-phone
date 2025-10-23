'use client'

import { useRouter } from 'next/navigation'
import { createClientBrowser } from '@/lib/supabase/supabaseClient'

export function useAuthActions() {
  const router = useRouter()
  const supabase = createClientBrowser()

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
        emailRedirectTo: undefined, // ✅ إلغاء تأكيد الإيميل
        data: { fullname, phone, storeName, taxNumber },
      },
    })

    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('فشل إنشاء الحساب')

    // ✅ انتظار تحديث الكوكيز قبل التحويل
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push('/dashboard')
    router.refresh() // ✅ إجبار تحديث الصفحة
    
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) throw new Error('بيانات الدخول غير صحيحة')
    if (!data.session) throw new Error('فشل تسجيل الدخول')

    // ✅ انتظار تحديث الكوكيز
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push('/dashboard')
    router.refresh()
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { signup, signIn, signOut }
}