// src/contexts/AuthContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientBrowser } from '@/lib/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

/**
 * Types for store/settings — replace with your actual types
 */
type Store = any | null
type StoreSettings = any | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  // business data
  store: Store
  settings: StoreSettings
  reloadBusinessData: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Helper: fetch store/settings from server-side endpoints.
 * You should implement these endpoints (server-only) to use server keys and do RLS checks.
 */
async function fetchStore(userId: string) {
  try {
    const res = await fetch(`/api/store?userId=${encodeURIComponent(userId)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchSettings(userId: string) {
  try {
    const res = await fetch(`/api/settings?userId=${encodeURIComponent(userId)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession?: Session | null
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [loading, setLoading] = useState<boolean>(initialSession ? false : true)
  const [error, setError] = useState<string | null>(null)

  const [store, setStore] = useState<Store>(null)
  const [settings, setSettings] = useState<StoreSettings>(null)
  const [businessLoading, setBusinessLoading] = useState(false)

  // refreshSession: attempt to refresh/get session from supabase client
  const refreshSession = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: getErr } = await supabase.auth.getSession()
      if (getErr) {
        setError(getErr.message)
        setUser(null)
        setSession(null)
      } else {
        setUser(data?.session?.user ?? null)
        setSession(data?.session ?? null)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to refresh session')
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // signOut helper
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // supabase will update cookies; onAuthStateChange will update state
      setUser(null)
      setSession(null)
      setStore(null)
      setSettings(null)
      router.replace('/login')
    } catch (err) {
      // best-effort
      setError('فشل تسجيل الخروج')
    }
  }, [supabase, router])

  // load business data (store & settings) after user signed in
  const reloadBusinessData = useCallback(async () => {
    if (!user?.id) {
      setStore(null)
      setSettings(null)
      return
    }
    setBusinessLoading(true)
    try {
      const [s, sett] = await Promise.all([fetchStore(user.id), fetchSettings(user.id)])
      setStore(s)
      setSettings(sett)
    } catch {
      setStore(null)
      setSettings(null)
    } finally {
      setBusinessLoading(false)
    }
  }, [user])

  // main effect: init session (hydrate) + subscribe to auth changes
  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | null = null

    const init = async () => {
      // 1) If there's no initialSession, try to read current session from client
      if (!initialSession) {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (!mounted) return
          if (error) {
            setError(error.message)
            setUser(null)
            setSession(null)
          } else {
            setUser(data?.session?.user ?? null)
            setSession(data?.session ?? null)
          }
        } catch (err: any) {
          if (!mounted) return
          setError(err?.message ?? 'Failed to get session')
          setUser(null)
          setSession(null)
        } finally {
          if (mounted) setLoading(false)
        }
      } else {
        // we already have initialSession from server; mark not loading
        if (mounted) setLoading(false)
      }

      // 2) Load business data if user already present
      if (mounted && (initialSession?.user ?? user)) {
        await reloadBusinessData()
      }

      // 3) Subscribe to auth changes and keep local state in sync
      if (!mounted) return
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return
        // update session & user immediately
        setSession(session ?? null)
        setUser(session?.user ?? null)
        setError(null)
        setLoading(false)

        // On SIGNED_IN, reload business data
        if (event === 'SIGNED_IN') {
          await reloadBusinessData()
          // optionally redirect after sign-in
          // router.replace('/dashboard')
        }

        if (event === 'SIGNED_OUT') {
          setStore(null)
          setSettings(null)
          // router.replace('/login') // optional
        }
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    }

    init()

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [supabase, initialSession, reloadBusinessData, user])

  const isAuthenticated = useMemo(() => !!user && !loading, [user, loading])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signOut,
    refreshSession,
    store,
    settings,
    reloadBusinessData,
  }), [
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signOut,
    refreshSession,
    store,
    settings,
    reloadBusinessData,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
