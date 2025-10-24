// lib/actions/categories.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as categoriesDb from '@/lib/supabase/db/categories'
import * as authDb from '@/lib/supabase/db/auth'
import { Category } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get all categories for current user's store
 */
export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const categories = await categoriesDb.getCategoriesByStore(user.storeid)
    return { success: true, data: categories }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الفئات' }
  }
}

/**
 * Create new category
 */
export async function createCategoryAction(formData: FormData): Promise<ActionResult<Category>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الفئة مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم الفئة يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 50) {
      return { success: false, error: 'اسم الفئة طويل جداً (50 حرف كحد أقصى)' }
    }

    // Check if name already exists
    const exists = await categoriesDb.categoryNameExists(user.storeid, name.trim())
    if (exists) {
      return { success: false, error: 'اسم الفئة موجود مسبقاً' }
    }

    const category = await categoriesDb.insertCategory(user.storeid, name.trim())

    revalidatePath('/admin/categories')
    return { success: true, data: category }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة الفئة' }
  }
}

/**
 * Update category
 */
export async function updateCategoryAction(categoryId: string, formData: FormData): Promise<ActionResult<Category>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const name = formData.get('name') as string
    
    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الفئة مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم الفئة يجب أن يكون حرفين على الأقل' }
    }

    if (name.trim().length > 50) {
      return { success: false, error: 'اسم الفئة طويل جداً (50 حرف كحد أقصى)' }
    }

    // Check if name already exists (excluding current category)
    const exists = await categoriesDb.categoryNameExists(user.storeid, name.trim(), categoryId)
    if (exists) {
      return { success: false, error: 'اسم الفئة موجود مسبقاً' }
    }

    const category = await categoriesDb.updateCategory(categoryId, name.trim())

    revalidatePath('/admin/categories')
    return { success: true, data: category }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث الفئة' }
  }
}

/**
 * Delete category (soft delete)
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can delete
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بحذف الفئات' }
    }

    await categoriesDb.deleteCategory(categoryId)

    revalidatePath('/admin/categories')
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف الفئة' }
  }
}