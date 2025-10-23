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

    // انتظار تحديث الكوكيز وإعادة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // إعادة تحميل الصفحة بدلاً من التحويل
    window.location.href = '/'
    
    return data
  }

   const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) throw new Error('بيانات الدخول غير صحيحة')
    if (!data.session) throw new Error('فشل تسجيل الدخول')

    // انتظار تحديث الكوكيز وإعادة تحميل البيانات
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // إعادة تحميل الصفحة بدلاً من التحويل
    window.location.href = '/'
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { signup, signIn, signOut }
}