// lib/actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase'
import * as authDb from '@/lib/supabase/db/auth'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

interface SignupPayload {
  email: string
  password: string
  fullname: string
  phone: string
  storeName?: string
  taxNumber?: string
}

interface SignupResult {
  success: boolean
  error?: string
  userId?: string
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Algerian phone validation
 * Formats: 0771234567, +213771234567, 213771234567
 */
function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return /^0[567]\d{8}$/.test(cleaned)
  }

  if (cleaned.startsWith('+213') && cleaned.length === 13) {
    return /^\+213[567]\d{8}$/.test(cleaned)
  }

  if (cleaned.startsWith('213') && cleaned.length === 12) {
    return /^213[567]\d{8}$/.test(cleaned)
  }

  return false
}

/**
 * Map Supabase auth errors to user-friendly messages
 */
function mapAuthError(error: string): string {
  if (error.includes('already registered')) {
    return 'هذا البريد الإلكتروني مسجل بالفعل'
  }

  if (error.includes('Password should be')) {
    return 'كلمة السر ضعيفة جداً'
  }

  if (error.includes('Invalid email')) {
    return 'البريد الإلكتروني غير صحيح'
  }

  if (error.includes('Email rate limit')) {
    return 'حاول لاحقاً - عدد محاولات كتير'
  }

  return 'فشل التسجيل'
}

/**
 * Validate signup payload
 */
function validateSignup(payload: SignupPayload): { valid: boolean; error?: string } {
  if (!payload.email || !isValidEmail(payload.email)) {
    return { valid: false, error: 'البريد الإلكتروني غير صحيح' }
  }

  if (!payload.fullname || payload.fullname.trim().length < 3) {
    return { valid: false, error: 'الاسم يجب أن يكون 3 أحرف على الأقل' }
  }

  if (!payload.phone || !isValidAlgerianPhone(payload.phone)) {
    return { valid: false, error: 'رقم الهاتف غير صحيح (صيغة جزائرية: 0771234567)' }
  }

  if (!payload.password || payload.password.length < 8) {
    return { valid: false, error: 'كلمة السر يجب أن تكون 8 أحرف على الأقل' }
  }

  if (!/[A-Z]/.test(payload.password)) {
    return { valid: false, error: 'كلمة السر يجب أن تحتوي على حرف كبير' }
  }

  if (!/[0-9]/.test(payload.password)) {
    return { valid: false, error: 'كلمة السر يجب أن تحتوي على رقم' }
  }


  if (payload.storeName && payload.storeName.length > 100) {
    return { valid: false, error: 'اسم المحل طويل جداً' }
  }

  if (payload.taxNumber && !/^\d{9}$/.test(payload.taxNumber)) {
    return { valid: false, error: 'الرقم الضريبي يجب أن يكون 9 أرقام' }
  }

  return { valid: true }
}

/**
 * Sign in with email and password
 */
export async function signInAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
    }

    const supabase = await createClientServer()

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
    const currentUser = await authDb.getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء' }
    }

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
    const currentUser = await authDb.getCurrentUser()
    if (!currentUser || currentUser.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء' }
    }

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

/**
 * Signup user with email/password
 * لا يتطلب تفعيل الايميل - يتم التفعيل تلقائياً
 */
export async function signupAction(payload: SignupPayload): Promise<SignupResult> {
  const validation = validateSignup(payload)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    const supabase = await createClientServer()

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          fullname: payload.fullname,
          phone: payload.phone,
          store_name: payload.storeName || undefined,
          tax_number: payload.taxNumber || undefined,
        },
      },
    })

    if (error) {
      console.error('[SIGNUP ERROR]', error.message)
      return {
        success: false,
        error: mapAuthError(error.message),
      }
    }

    if (!data.user?.id) {
      return {
        success: false,
        error: 'فشل إنشاء الحساب',
      }
    }

    console.log(`[SIGNUP] User created: ${data.user.id} (${payload.email})`)

    revalidatePath('/login', 'page')
    return {
      success: true,
      userId: data.user.id,
    }
  } catch (error) {
    console.error('[SIGNUP EXCEPTION]', error)
    return {
      success: false,
      error: 'حصلت مشكلة غير متوقعة',
    }
  }
}


export async function forgotPasswordAction({ phone }: { phone: string }) {
    const supabase = await createClientServer()

  try {
    // تحويل الرقم إلى الصيغة المخزنة
    const email = `${phone}@store.com`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'فشل إرسال البريد',
      }
    }

    return {
      success: true,
      message: 'تم إرسال رابط استرجاع كلمة السر',
    }
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error)
    return {
      success: false,
      error: 'حصلت مشكلة غير متوقعة',
    }
  }
}


export async function resetPasswordAction({ password }: { password: string }) {
      const supabase = await createClientServer()

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'فشل تحديث كلمة السر',
      }
    }

    return {
      success: true,
      message: 'تم تحديث كلمة السر بنجاح',
    }
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error)
    return {
      success: false,
      error: 'حصلت مشكلة غير متوقعة',
    }
  }
}