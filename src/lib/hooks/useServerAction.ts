// ============================================
// lib/hooks/useServerAction.ts
// ============================================
'use client'
import { useState, useCallback, useRef } from 'react'
import type { ActionResult } from '@/lib/types/action.types'

interface UseServerActionOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: string) => void
  onSettled?: () => void
  resetOnExecute?: boolean
}

export function useServerAction<T, P extends any[]>(
  action: (...args: P) => Promise<ActionResult<T>>,
  options?: UseServerActionOptions<T>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [success, setSuccess] = useState(false)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (...args: P): Promise<ActionResult<T>> => {
      // Reset states
      if (options?.resetOnExecute !== false) {
        setError(null)
        setSuccess(false)
      }
      
      setLoading(true)

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        const result = await action(...args)

        if (!result.success) {
          setError(result.error)
          setSuccess(false)
          options?.onError?.(result.error)
          return result // Return the error result
        }

        setData(result.data)
        setSuccess(true)
        setError(null)
        await options?.onSuccess?.(result.data)
        return result // Return the success result
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          const abortResult: ActionResult<T> = { 
            success: false, 
            error: 'تم إلغاء العملية' 
          }
          return abortResult
        }
        
        const message = err instanceof Error ? err.message : 'خطأ غير متوقع'
        setError(message)
        setSuccess(false)
        options?.onError?.(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
        options?.onSettled?.()
        abortControllerRef.current = null
      }
    },
    [action, options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
    setSuccess(false)
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    execute,
    loading,
    error,
    data,
    success,
    reset,
    abort,
    isIdle: !loading && !error && !data,
    isError: !loading && error !== null,
    isSuccess: !loading && success,
  }
}

