// lib/actions/phones.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as phonesDb from '@/lib/supabase/db/phones'
import * as authDb from '@/lib/supabase/db/auth'
import { Phone, PhoneWithDetails } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get all phones for current user's store
 */
export async function getPhonesAction(): Promise<ActionResult<PhoneWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const phones = await phonesDb.getPhonesByStore(user.storeid)
    return { success: true, data: phones }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الهواتف' }
  }
}

/**
 * Get available phones only
 */
export async function getAvailablePhonesAction(): Promise<ActionResult<PhoneWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const phones = await phonesDb.getAvailablePhones(user.storeid)
    return { success: true, data: phones }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الهواتف المتاحة' }
  }
}

/**
 * Add new phone
 */
export async function addPhoneAction(formData: FormData): Promise<ActionResult<Phone>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Extract form data
    const name = formData.get('name') as string
    const brandid = formData.get('brandid') as string | null
    const model = formData.get('model') as string | null
    const imei = formData.get('imei') as string
    const supplierid = formData.get('supplierid') as string | null
    const buyprice = parseFloat(formData.get('buyprice') as string)
    const sellprice = parseFloat(formData.get('sellprice') as string)
    const warranty_months = parseInt(formData.get('warranty_months') as string) || 0
    const warranty_notes = formData.get('warranty_notes') as string | null
    const notes = formData.get('notes') as string | null

    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الهاتف مطلوب' }
    }

    if (!imei || imei.trim().length === 0) {
      return { success: false, error: 'رقم IMEI مطلوب' }
    }

    if (imei.trim().length < 15 || imei.trim().length > 17) {
      return { success: false, error: 'رقم IMEI غير صحيح (يجب أن يكون 15-17 رقم)' }
    }

    if (isNaN(buyprice) || buyprice < 0) {
      return { success: false, error: 'سعر الشراء غير صحيح' }
    }

    if (isNaN(sellprice) || sellprice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    if (sellprice < buyprice) {
      return { success: false, error: 'سعر البيع يجب أن يكون أكبر من سعر الشراء' }
    }

    // Check if IMEI already exists
    const imeiAlreadyExists = await phonesDb.imeiExists(user.storeid, imei.trim())
    if (imeiAlreadyExists) {
      return { success: false, error: 'رقم IMEI موجود مسبقاً في المتجر' }
    }

    const phone = await phonesDb.insertPhone({
      storeid: user.storeid,
      name: name.trim(),
      brandid: brandid || null,
      model: model?.trim() || null,
      imei: imei.trim(),
      supplierid: supplierid || null,
      status: 'available',
      buyprice,
      sellprice,
      warranty_months,
      warranty_notes: warranty_notes?.trim() || null,
      notes: notes?.trim() || null
    })

    revalidatePath('/inventory/phones')
    return { success: true, data: phone }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة الهاتف' }
  }
}

/**
 * Update phone details
 */
export async function updatePhoneAction(phoneId: string, formData: FormData): Promise<ActionResult<Phone>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Check if phone exists and is editable
    const phone = await phonesDb.getPhoneById(phoneId)
    if (!phone) {
      return { success: false, error: 'الهاتف غير موجود' }
    }

    if (phone.status === 'sold') {
      return { success: false, error: 'لا يمكن تعديل هاتف مباع' }
    }

    // Extract form data
    const name = formData.get('name') as string
    const brandid = formData.get('brandid') as string | null
    const model = formData.get('model') as string | null
    const imei = formData.get('imei') as string
    const supplierid = formData.get('supplierid') as string | null
    const buyprice = parseFloat(formData.get('buyprice') as string)
    const sellprice = parseFloat(formData.get('sellprice') as string)
    const warranty_months = parseInt(formData.get('warranty_months') as string) || 0
    const warranty_notes = formData.get('warranty_notes') as string | null
    const notes = formData.get('notes') as string | null

    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الهاتف مطلوب' }
    }

    if (!imei || imei.trim().length === 0) {
      return { success: false, error: 'رقم IMEI مطلوب' }
    }

    if (imei.trim().length < 15 || imei.trim().length > 17) {
      return { success: false, error: 'رقم IMEI غير صحيح' }
    }

    if (isNaN(buyprice) || buyprice < 0) {
      return { success: false, error: 'سعر الشراء غير صحيح' }
    }

    if (isNaN(sellprice) || sellprice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    // Check if IMEI changed and already exists
    if (imei !== phone.imei) {
      const imeiAlreadyExists = await phonesDb.imeiExists(user.storeid, imei.trim(), phoneId)
      if (imeiAlreadyExists) {
        return { success: false, error: 'رقم IMEI موجود مسبقاً' }
      }
    }

    const updated = await phonesDb.updatePhone(phoneId, {
      name: name.trim(),
      brandid: brandid || null,
      model: model?.trim() || null,
      imei: imei.trim(),
      supplierid: supplierid || null,
      buyprice,
      sellprice,
      warranty_months,
      warranty_notes: warranty_notes?.trim() || null,
      notes: notes?.trim() || null
    })

    revalidatePath('/inventory/phones')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث الهاتف' }
  }
}

/**
 * Search phone by IMEI
 */
export async function searchPhoneByImeiAction(imei: string): Promise<ActionResult<PhoneWithDetails | null>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!imei || imei.trim().length === 0) {
      return { success: false, error: 'رقم IMEI مطلوب' }
    }

    const phone = await phonesDb.getPhoneByImei(user.storeid, imei.trim())
    return { success: true, data: phone }
  } catch (error: any) {
    return { success: false, error: 'فشل البحث عن الهاتف' }
  }
}

/**
 * Delete phone (soft delete, owner/manager only)
 */
export async function deletePhoneAction(phoneId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can delete
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بحذف الهواتف' }
    }

    // Check phone status
    const phone = await phonesDb.getPhoneById(phoneId)
    if (!phone) {
      return { success: false, error: 'الهاتف غير موجود' }
    }

    if (phone.status === 'sold') {
      return { success: false, error: 'لا يمكن حذف هاتف مباع' }
    }

    await phonesDb.deletePhone(phoneId)

    revalidatePath('/inventory/phones')
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف الهاتف' }
  }
}

/**
 * Get phones stats
 */
export async function getPhonesStatsAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const stats = await phonesDb.getPhonesCountByStatus(user.storeid)
    return { success: true, data: stats }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الإحصائيات' }
  }
}