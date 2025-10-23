// ============================================================================
// 2. AuthContext.tsx (lib/provider/AuthContext.tsx)
// ============================================================================
// الهدف: تمرير user, store, settings للـ components
'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { AuthUser, Store, StoreSettings } from '@/lib/types'
import { createClientBrowser } from '../supabase/supabaseClient'

interface AuthContextValue {
  user: AuthUser | null
  store: Store | null
  settings: StoreSettings | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  store: null,
  settings: null,
  loading: true,
})

export function AuthProvider({
  initialUser,
  initialStore,
  initialSettings,
  children,
}: {
  initialUser: AuthUser | null
  initialStore: Store | null
  initialSettings: StoreSettings | null
  children: React.ReactNode
}) {
  const [state, setState] = useState({
    user: initialUser,
    store: initialStore,
    settings: initialSettings,
    loading: !initialUser, // ✅ لا تبدأ بـ true، ابدأ بـ !initialUser
  })

  const supabase = useMemo(() => createClientBrowser(), [])

  useEffect(() => {
    // التحقق من الجلسة الحالية
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && !state.user) {
        // إعادة تحميل الصفحة للحصول على بيانات المستخدم من الخادم
        window.location.reload()
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({ user: null, store: null, settings: null, loading: false })
          window.location.href = '/login'
        }

        if (event === 'SIGNED_IN' && session) {
          // إعادة تحميل الصفحة للحصول على بيانات كاملة
          window.location.reload()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  )
}
