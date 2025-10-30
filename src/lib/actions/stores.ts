// lib/actions/stores.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as storesDb from '@/lib/supabase/db/stores'
import * as authDb from '@/lib/supabase/db/auth'
import { StoreSettings } from '@/lib/types'
import { ActionResult } from '../types/action.types'



/**
 * Get current store info
 */
export async function getStoreAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const store = await storesDb.getStoreById(user.storeid)
    if (!store) {
      return { success: false, error: 'المتجر غير موجود' }
    }

    return { success: true, data: store }
  } catch (error) {
    return { success: false, error: 'فشل تحميل بيانات المتجر' }
  }
}

/**
 * Get store settings
 */
export async function getStoreSettingsAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const settings = await storesDb.getStoreSettings(user.storeid)
    if (!settings) {
      return { success: false, error: 'إعدادات المتجر غير موجودة' }
    }

    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: 'فشل تحميل إعدادات المتجر' }
  }
}

/**
 * Update store settings (owner/manager only)
 */
export async function updateStoreSettingsAction(
  updates: Partial<Omit<StoreSettings, 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>
): Promise<ActionResult<StoreSettings>> {
  try {
    // Verify user permissions
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتعديل الإعدادات' }
    }

    // Check store is active
    const isActive = await storesDb.isStoreActive(user.storeid)
    if (!isActive) {
      return { success: false, error: 'المتجر غير نشط أو انتهت صلاحية الاشتراك' }
    }

    const updatedSettings = await storesDb.updateStoreSettings(user.storeid, updates)

    revalidatePath('/admin/settings')
    return { success: true, data: updatedSettings }
  } catch (error) {
    return { success: false, error: 'فشل تحديث إعدادات المتجر' }
  }
}

/**
 * Get store with settings (combined)
 */
export async function getStoreWithSettingsAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const { store, settings } = await storesDb.getStoreWithSettings(user.storeid)

    if (!store) {
      return { success: false, error: 'المتجر غير موجود' }
    }

    return { success: true, data: { store, settings } }
  } catch (error) {
    return { success: false, error: 'فشل تحميل بيانات المتجر' }
  }
}

/**
 * Check if store is active
 */
export async function checkStoreActiveAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const isActive = await storesDb.isStoreActive(user.storeid)

    return { success: true, data: { isActive } }
  } catch (error) {
    return { success: false, error: 'فشل التحقق من حالة المتجر' }
  }
}