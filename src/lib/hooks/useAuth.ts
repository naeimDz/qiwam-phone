// lib/hooks/useAuth.ts
// ONLY HOOK EXCEPTION - Lightweight wrapper for auth state

'use client'

import { useEffect, useState } from 'react'
import { createClientBrowser } from '@/lib/supabase'
import { AuthUser } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientBrowser()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          return null
        }
        
        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('id, storeid, fullname, role')
            .eq('id', user.id)
            .is('deleted_at', null)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: user.email ?? null,
              storeid: profile.storeid,
              fullname: profile.fullname,
              role: profile.role,
            })
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('id, storeid, fullname, role')
            .eq('id', session.user.id)
            .is('deleted_at', null)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email ?? null,
              storeid: profile.storeid,
              fullname: profile.fullname,
              role: profile.role,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

/**
 * Hook to require authentication (redirects if not authenticated)
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  return { user, loading }
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(allowedRoles: AuthUser['role'][]) {
  const { user } = useAuth()
  
  if (!user) return false
  return allowedRoles.includes(user.role)
}