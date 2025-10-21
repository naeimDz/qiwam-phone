// lib/actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase'
import * as authDb from '@/lib/supabase/db/auth'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Sign in with email and password
 * Note: Phone is stored in auth.users, not in public.users
 */
export async function signInAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
    }

    const supabase = await createClientServer()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return { success: false, error: 'بيانات الدخول غير صحيحة' }
    }

    revalidatePath('/', 'layout')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }
  }
}

/**
 * Sign out
 */
export async function signOutAction(): Promise<ActionResult> {
  try {
    const supabase = await createClientServer()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: 'فشل تسجيل الخروج' }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    return { success: false, error: 'حدث خطأ أثناء تسجيل الخروج' }
  }
}

/**
 * Get current user (for client components)
 */
export async function getCurrentUserAction() {
  try {
    const user = await authDb.getCurrentUser()
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'فشل تحميل بيانات المستخدم' }
  }
}

/**
 * Update user role (owner only)
 */
export async function updateUserRoleAction(
  userId: string, 
  role: 'owner' | 'seller' | 'technician'
): Promise<ActionResult> {
  try {
    // Verify current user is owner
    const currentUser = await authDb.getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء' }
    }

    // Prevent owner from changing their own role
    if (currentUser.id === userId) {
      return { success: false, error: 'لا يمكنك تغيير دورك الخاص' }
    }

    await authDb.updateUserRole(userId, role)

    revalidatePath('/admin/users')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'فشل تحديث دور المستخدم' }
  }
}

/**
 * Delete user (soft delete, owner only)
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    // Verify current user is owner
    const currentUser = await authDb.getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء' }
    }

    // Prevent owner from deleting themselves
    if (currentUser.id === userId) {
      return { success: false, error: 'لا يمكنك حذف حسابك الخاص' }
    }

    await authDb.deleteUser(userId)

    revalidatePath('/admin/users')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: 'فشل حذف المستخدم' }
  }
}