// ==================== AUTH DB LAYER ====================
// lib/supabase/db/auth.ts

import { AuthUser, UserProfile } from '@/lib/types'
import { createClientServer } from '@/lib/supabase'
import { cache } from 'react'


// Error logging utility
interface ErrorLog {
  timestamp: string
  function: string
  error: any
  context?: Record<string, any>
}

const logError = (functionName: string, error: any, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      status: error?.status
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
  return errorLog
}



/**
 * Get current authenticated user with store info
 * Foundation - every operation starts here
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const functionName = 'getCurrentUser'
  
  try {
    console.log(`[${functionName}] 🚀 RUNNING (Cache Miss): جلب المستخدم الفعلي`)
    const supabase = await createClientServer()
    
    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      console.log(`[${functionName}] المستخدم غير مصرح`)
      return null
    }

    console.log(`[${functionName}] المستخدم المصرح: ${authUser.email}`)

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, storeid, fullname, role, active')
      .eq('id', authUser.id)
      .is('deleted_at', null)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log(`[${functionName}] ملف المستخدم غير موجود`)
        return null
      }
      logError(`${functionName}::getProfile`, profileError)
      throw profileError
    }

    if (!userProfile || !userProfile.active) {
      console.log(`[${functionName}] المستخدم غير نشط`)
      return null
    }

    const result = {
      id: userProfile.id,
      email: authUser.email ?? null,
      storeid: userProfile.storeid,
      fullname: userProfile.fullname,
      role: userProfile.role,
    }

    console.log(`[${functionName}] تم بنجاح: ${result.fullname}`)
    return result
  } catch (error: any) {
    logError(functionName, error)
    return null
  }
})

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const functionName = 'getUserById'
  
  try {
    if (!userId) throw new Error('userId مطلوب')

    console.log(`[${functionName}] البدء: جلب المستخدم ${userId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] المستخدم غير موجود`)
        return null
      }
      logError(functionName, error, { userId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات المستخدم فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { userId })
    throw new Error(`فشل في جلب المستخدم: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get all users for a specific store
 */
export async function getUsersByStore(storeid: string): Promise<UserProfile[]> {
  const functionName = 'getUsersByStore'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب المستخدمين للمتجر ${storeid}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} مستخدم`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب المستخدمين: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: UserProfile['role']): Promise<UserProfile> {
  const functionName = 'updateUserRole'
  
  try {
    if (!userId) throw new Error('userId مطلوب')
    if (!role) throw new Error('الدور مطلوب')

    const validRoles: UserProfile['role'][] = ['owner', 'seller', 'technician']
    if (!validRoles.includes(role)) {
      throw new Error(`دور غير صحيح: ${role}`)
    }

    console.log(`[${functionName}] البدء: تحديث دور المستخدم ${userId} إلى ${role}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('users')
      .update({ role, updatedat: new Date().toISOString() })
      .eq('id', userId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('المستخدم غير موجود أو محذوف')
      }
      logError(functionName, error, { userId, role })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع المستخدم المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { userId, role })
    throw new Error(`فشل في تحديث دور المستخدم: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Soft delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const functionName = 'deleteUser'
  
  try {
    if (!userId) throw new Error('userId مطلوب')

    console.log(`[${functionName}] البدء: حذف المستخدم ${userId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString() 
      })
      .eq('id', userId)

    if (error) {
      logError(functionName, error, { userId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: المستخدم ${userId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { userId })
    throw new Error(`فشل في حذف المستخدم: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Create user profile (after Supabase Auth signup)
 * Called by signup trigger or manually after auth.signUp()
 */
export async function createUserProfile(
  authUserId: string,
  storeid: string,
  fullname: string,
  role: UserProfile['role'] = 'seller'
): Promise<UserProfile> {
  const functionName = 'createUserProfile'
  
  try {
    if (!authUserId) throw new Error('authUserId مطلوب')
    if (!storeid) throw new Error('storeid مطلوب')
    if (!fullname) throw new Error('الاسم الكامل مطلوب')

    const validRoles: UserProfile['role'][] = ['owner', 'seller', 'technician']
    if (!validRoles.includes(role)) {
      throw new Error(`دور غير صحيح: ${role}`)
    }

    console.log(`[${functionName}] البدء: إنشاء ملف مستخدم جديد`, { authUserId, fullname, role })
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authUserId,
        storeid,
        fullname,
        role,
        active: true
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { authUserId, storeid, fullname, role })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع ملف المستخدم المُنشأ')
    }

    console.log(`[${functionName}] تم بنجاح: المستخدم ${data.id}`)
    return data
  } catch (error: any) {
    logError(functionName, error, { authUserId, storeid, fullname, role })
    throw new Error(`فشل في إنشاء ملف المستخدم: ${error?.message || 'خطأ غير معروف'}`)
  }
}