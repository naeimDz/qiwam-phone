// ============================================================================
// AuthContext.tsx (lib/provider/AuthContext.tsx)
// ============================================================================
// ✅ Single source of truth for auth state
// ✅ No localStorage
// ✅ No window.location.reload()
// ✅ Properly syncs with Supabase auth state
'use client'

import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser, Store, StoreSettings } from '@/lib/types'
import { createClientBrowser } from '../supabase/supabaseClient'

interface AuthContextValue {
  user: AuthUser | null
  store: Store | null
  settings: StoreSettings | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  store: null,
  settings: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refreshUserData: async () => {},
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
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])
  
  const [state, setState] = useState({
    user: initialUser,
    store: initialStore,
    settings: initialSettings,
    loading: false, // ✅ Start with false since we have initial data from server
    error: null as string | null,
  })

  // ✅ Refresh user data from server (called after login/signup)
  const refreshUserData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Trigger a server-side refresh by navigating to current page
      router.refresh()
      
      // Small delay to let router.refresh() complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setState(prev => ({ ...prev, loading: false }))
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'فشل تحديث البيانات' 
      }))
    }
  }, [router])

  // ✅ Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        store: null,
        settings: null,
        loading: false,
        error: null,
      })
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'فشل تسجيل الخروج',
      }))
    }
  }, [supabase, router])

  // ✅ Listen to auth state changes (for signout, token refresh, etc)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // On SIGNED_OUT, clear state and redirect
        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            store: null,
            settings: null,
            loading: false,
            error: null,
          })
          router.push('/login')
          router.refresh()
        }

        // On SIGNED_IN (from another tab or token refresh), refresh data
        if (event === 'SIGNED_IN' && session && !state.user) {
          await refreshUserData()
        }

        // On TOKEN_REFRESHED, just continue (no need to reload)
        if (event === 'TOKEN_REFRESHED') {
          // Tokens are already updated in cookies by middleware
          // No action needed here
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, state.user, refreshUserData])

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    store: state.store,
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    signOut,
    refreshUserData,
  }), [state, signOut, refreshUserData])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
