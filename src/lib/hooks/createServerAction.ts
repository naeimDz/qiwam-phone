// ============================================
// lib/utils/createServerAction.ts
// ============================================
'use server'
import type { ActionResult } from '@/lib/types/action.types'

/**
 * Wrapper for server actions to handle errors consistently
 * @example
 * export const getUser = createServerAction(async (id: string) => {
 *   const user = await db.user.findUnique({ where: { id } })
 *   if (!user) throw new Error('User not found')
 *   return user
 * })
 */
export function createServerAction<T, P extends any[]>(
  handler: (...args: P) => Promise<T>
) {
  return async (...args: P): Promise<ActionResult<T>> => {
    try {
      const data = await handler(...args)
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('Server Action Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في الخادم',
      }
    }
  }
}