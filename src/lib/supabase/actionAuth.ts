// ============================================
// 📁 lib/middleware/actionAuth.ts
// ============================================
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { AuthError } from '@/lib/errors/ActionError'

/**
 * ✅ Middleware: التحقق من الـ Authentication والـ Authorization
 * يضمن توفر userId و storeId قبل تنفيذ الـ Logic
 */
export async function getAuthContext() {
  const user = await getCurrentUser()
  
  if (!user?.storeid) {
    throw new AuthError()
  }
  
  return {
    userId: user.id,
    storeId: user.storeid,
  }
}
