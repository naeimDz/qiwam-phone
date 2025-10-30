// ============================================
// lib/hooks/useMutation.ts
// ============================================
'use client'
import { useState, useCallback } from 'react'
import type { ActionResult } from '@/lib/types/action.types'

interface MutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void | Promise<void>
  onError?: (error: string, variables: V) => void
  onSettled?: (data: T | null, error: string | null, variables: V) => void
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<ActionResult<T>>,
  options?: MutationOptions<T, V>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = useCallback(
    async (variables: V): Promise<ActionResult<T>> => {
      setLoading(true)
      setError(null)

      try {
        const result = await mutationFn(variables)

        if (!result.success) {
          setError(result.error)
          options?.onError?.(result.error, variables)
          options?.onSettled?.(null, result.error, variables)
          return result
        }

        setData(result.data)
        await options?.onSuccess?.(result.data, variables)
        options?.onSettled?.(result.data, null, variables)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'خطأ غير متوقع'
        setError(message)
        options?.onError?.(message, variables)
        options?.onSettled?.(null, message, variables)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [mutationFn, options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    mutate,
    loading,
    error,
    data,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    isIdle: !loading && !error && data === null,
  }
}