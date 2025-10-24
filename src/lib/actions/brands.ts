// lib/actions/brands.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as brandsDb from '@/lib/supabase/db/brands'
import * as authDb from '@/lib/supabase/db/auth'
import { Brand } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get all brands for current user's store
 */
export async function getBrandsAction(): Promise<ActionResult<Brand[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const brands = await brandsDb.getBrandsByStore(user.storeid)
    return { success: true, data: brands }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل العلامات التجارية' }
  }
}

/**
 * Create new brand
 */
export async function createBrandAction(formData: FormData): Promise<ActionResult<Brand>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم العلامة التجارية مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم العلامة التجارية يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 50) {
      return { success: false, error: 'اسم العلامة التجارية طويل جداً (50 حرف كحد أقصى)' }
    }

    // Check if name already exists
    const exists = await brandsDb.brandNameExists(user.storeid, name.trim())
    if (exists) {
      return { success: false, error: 'اسم العلامة التجارية موجود مسبقاً' }
    }

    const brand = await brandsDb.insertBrand(user.storeid, name.trim())

    revalidatePath('/admin/brands')
    return { success: true, data: brand }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة العلامة التجارية' }
  }
}

/**
 * Update brand
 */
export async function updateBrandAction(brandId: string, formData: FormData): Promise<ActionResult<Brand>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم العلامة التجارية مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم العلامة التجارية يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 50) {
      return { success: false, error: 'اسم العلامة التجارية طويل جداً (50 حرف كحد أقصى)' }
    }

    // Check if name already exists (excluding current brand)
    const exists = await brandsDb.brandNameExists(user.storeid, name.trim(), brandId)
    if (exists) {
      return { success: false, error: 'اسم العلامة التجارية موجود مسبقاً' }
    }

    const brand = await brandsDb.updateBrand(brandId, name.trim())

    //revalidatePath('/admin/brands')
    return { success: true, data: brand }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث العلامة التجارية' }
  }
}

/**
 * Delete brand (soft delete)
 */
export async function deleteBrandAction(brandId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can delete
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بحذف العلامات التجارية' }
    }

    await brandsDb.deleteBrand(brandId)

    //revalidatePath('/admin/brands')
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف العلامة التجارية' }
  }
}