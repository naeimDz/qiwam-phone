// lib/actions/suppliers.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as suppliersDb from '@/lib/supabase/db/suppliers'
import * as authDb from '@/lib/supabase/db/auth'
import { Supplier } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get all suppliers for current user's store
 */
export async function getSuppliersAction(activeOnly: boolean = false): Promise<ActionResult<Supplier[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const suppliers = await suppliersDb.getSuppliersByStore(user.storeid, activeOnly)
    return { success: true, data: suppliers }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الموردين' }
  }
}

/**
 * Create new supplier
 */
export async function createSupplierAction(formData: FormData): Promise<ActionResult<Supplier>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    const contact_person = formData.get('contact_person') as string | null
    const phone = formData.get('phone') as string | null
    const email = formData.get('email') as string | null
    const address = formData.get('address') as string | null
    const notes = formData.get('notes') as string | null
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم المورد مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم المورد يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 100) {
      return { success: false, error: 'اسم المورد طويل جداً (100 حرف كحد أقصى)' }
    }

    // Check if name already exists
    const exists = await suppliersDb.supplierNameExists(user.storeid, name.trim())
    if (exists) {
      return { success: false, error: 'اسم المورد موجود مسبقاً' }
    }

    const supplier = await suppliersDb.insertSupplier({
      storeid: user.storeid,
      name: name.trim(),
      contact_person: contact_person?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
      active: true
    })

    revalidatePath('/admin/suppliers')
    return { success: true, data: supplier }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة المورد' }
  }
}

/**
 * Update supplier
 */
export async function updateSupplierAction(supplierId: string, formData: FormData): Promise<ActionResult<Supplier>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    const contact_person = formData.get('contact_person') as string | null
    const phone = formData.get('phone') as string | null
    const email = formData.get('email') as string | null
    const address = formData.get('address') as string | null
    const notes = formData.get('notes') as string | null
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم المورد مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم المورد يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 100) {
      return { success: false, error: 'اسم المورد طويل جداً (100 حرف كحد أقصى)' }
    }

    // Check if name already exists (excluding current supplier)
    const exists = await suppliersDb.supplierNameExists(user.storeid, name.trim(), supplierId)
    if (exists) {
      return { success: false, error: 'اسم المورد موجود مسبقاً' }
    }

    const supplier = await suppliersDb.updateSupplier(supplierId, {
      name: name.trim(),
      contact_person: contact_person?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null
    })

    revalidatePath('/admin/suppliers')
    return { success: true, data: supplier }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث المورد' }
  }
}

/**
 * Toggle supplier active status
 */
export async function toggleSupplierActiveAction(supplierId: string, active: boolean): Promise<ActionResult<Supplier>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can deactivate
    if (!active && user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتعطيل الموردين' }
    }

    const supplier = await suppliersDb.toggleSupplierActive(supplierId, active)

    revalidatePath('/admin/suppliers')
    return { success: true, data: supplier }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث حالة المورد' }
  }
}

/**
 * Delete supplier (soft delete)
 */
export async function deleteSupplierAction(supplierId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can delete
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بحذف الموردين' }
    }

    await suppliersDb.deleteSupplier(supplierId)

    revalidatePath('/admin/suppliers')
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف المورد' }
  }
}