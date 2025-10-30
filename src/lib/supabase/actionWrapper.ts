// ============================================
// 📁 lib/middleware/actionWrapper.ts
// ============================================
import { revalidatePath } from 'next/cache'
import { ActionError } from '@/lib/errors/ActionError'
import { z } from 'zod'
import { getAuthContext } from './actionAuth';
import { ActionResult } from '../types/action.types';


/**
 * ✅ Wrapper: يجمع كل المحاولات الشائعة (Auth + Error Handling + Logging)
 */
export async function executeAction<T>(
  actionName: string,
  handler: (context: { userId: string; storeId: string }) => Promise<T>,
  options: {
    revalidatePaths?: string[]
    logErrors?: boolean
  } = {}
): Promise<ActionResult<T>> {
  try {
    // 1. التحقق من الـ Auth
    const context = await getAuthContext()
    
    // 2. تنفيذ الـ Logic
    const data = await handler(context)
    
    // 3. Revalidate Paths (إن وجدت)
    if (options.revalidatePaths) {
      for (const path of options.revalidatePaths) {
        revalidatePath(path)
      }
    }
    
    return { success: true, data }
  } catch (error) {
    // 4. معالجة الأخطاء
    const message = handleActionError(error, actionName, options.logErrors)
    return { success: false, error: message }
  }
}

/**
 * ✅ معالجة موحدة للأخطاء
 */
function handleActionError(error: unknown, actionName: string, logErrors: boolean = true): string {
  if (logErrors) {
    console.error(`[${actionName}]`, error)
  }

  // Zod Validation Error
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0]
    const field = firstIssue.path.join('.')
    return `${field}: ${firstIssue.message}`
  }

  // Custom Action Error
  if (error instanceof ActionError) {
    return error.message
  }

  // Unknown Error
  if (error instanceof Error) {
    return error.message
  }

  return 'حدث خطأ غير متوقع'
}