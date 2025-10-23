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
    loading: !initialUser,
  })

  const supabase = useMemo(() => createClientBrowser(), [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({ user: null, store: null, settings: null, loading: false })
        }

        if (event === 'SIGNED_IN' && session) {
          const user = session.user
          setState((prev) => ({
            ...prev,
            user: { id: user.id, email: user.email } as AuthUser,
            loading: false,
          }))
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

export const useAuth = () => useContext(AuthContext)
