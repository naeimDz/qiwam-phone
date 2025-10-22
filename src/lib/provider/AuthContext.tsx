// ============================================================================
// 2. AuthContext.tsx (lib/provider/AuthContext.tsx)
// ============================================================================
// الهدف: تمرير user, store, settings للـ components

'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientBrowser } from '@/lib/supabase'
import { AuthUser, Store, StoreSettings } from '@/lib/types'

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
  children 
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
    loading: false,
  })

  useEffect(() => {
    const supabase = createClientBrowser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({ user: null, store: null, settings: null, loading: false })
        }
        // للـ SIGNED_IN: الـ RLS بتجيب البيانات الصحيحة تلقائياً
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)