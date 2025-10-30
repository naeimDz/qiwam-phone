// ============================================
// lib/hooks/useFetchClient.ts
// ============================================
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { ActionResult } from '@/lib/types/action.types'

interface UseFetchOptions<T> {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  retry?: number
  retryDelay?: number
  staleTime?: number
}

export function useFetchClient<T>(
  fetcher: () => Promise<ActionResult<T>>,
  options: UseFetchOptions<T> = {}
) {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
    staleTime = 0,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)

  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetch = useCallback(
    async (isRefetch = false) => {
      // Check if data is still fresh
      if (
        staleTime > 0 &&
        lastFetchTimeRef.current &&
        Date.now() - lastFetchTimeRef.current < staleTime &&
        data !== null
      ) {
        return
      }

      if (isRefetch) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        const result = await fetcher()

        if (!result.success) {
          throw new Error(result.error)
        }

        setData(result.data)
        lastFetchTimeRef.current = Date.now()
        retryCountRef.current = 0
        onSuccess?.(result.data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const message = err instanceof Error ? err.message : 'خطأ غير متوقع'
        
        // Retry logic
        if (retryCountRef.current < retry) {
          retryCountRef.current++
          setTimeout(() => fetch(isRefetch), retryDelay)
          return
        }

        setError(message)
        onError?.(message)
      } finally {
        setLoading(false)
        setIsRefetching(false)
      }
    },
    [fetcher, onSuccess, onError, retry, retryDelay, staleTime, data]
  )

  const refetch = useCallback(() => {
    lastFetchTimeRef.current = 0
    return fetch(true)
  }, [fetch])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setIsRefetching(false)
    retryCountRef.current = 0
    lastFetchTimeRef.current = 0
  }, [])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetch()
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [enabled, fetch])

  // Refetch interval
  useEffect(() => {
    if (enabled && refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetch(true)
      }, refetchInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, refetchInterval, fetch])

  return {
    data,
    error,
    loading,
    isRefetching,
    refetch,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    isIdle: !loading && !error && data === null,
  }
}
