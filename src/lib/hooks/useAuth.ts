// lib/hooks/useAuth.ts
// ✅ Unified auth hook - single source of truth
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/lib/provider/AuthContext'

/**
 * Hook to access auth state from anywhere in the app
 * Usage: const { user, store, settings, loading } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}
