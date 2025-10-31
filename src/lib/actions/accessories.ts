// lib/actions/accessories.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as accessoriesDb from '@/lib/supabase/db/accessories'
import * as authDb from '@/lib/supabase/db/auth'
import { Accessory, AccessoryWithDetails } from '@/lib/types'
import { ActionResult } from '../types/action.types'


/**
 * Get all accessories for current user's store
 */
export async function getAccessoriesAction(activeOnly: boolean = false, storeid?: string): Promise<ActionResult<AccessoryWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const accessories = await accessoriesDb.getAccessoriesByStore(user.storeid, activeOnly)
    return { success: true, data: accessories }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الإكسسوارات' }
  }
}

/**
 * Get low stock accessories
 */
export async function getLowStockAccessoriesAction(): Promise<ActionResult<AccessoryWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const accessories = await accessoriesDb.getAccessoriesLowStock(user.storeid)
    return { success: true, data: accessories }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الإكسسوارات منخفضة المخزون' }
  }
}

/**
 * Add new accessory
 */
export async function addAccessoryAction(formData: FormData): Promise<ActionResult<Accessory>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Extract form data
    const name = formData.get('name') as string
    const brandid = formData.get('brandid') as string | null
    const categoryid = formData.get('categoryid') as string | null
    const supplierid = formData.get('supplierid') as string | null
    const sku = formData.get('sku') as string | null
    const barcode = formData.get('barcode') as string | null
    const quantity = parseInt(formData.get('quantity') as string) || 0
    const minqty = parseInt(formData.get('minqty') as string) || 0
    const buyprice = parseFloat(formData.get('buyprice') as string)
    const sellprice = parseFloat(formData.get('sellprice') as string)
    const notes = formData.get('notes') as string | null

    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الإكسسوار مطلوب' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'اسم الإكسسوار يجب أن يكون حرفين على الأقل' }
    }

    if (isNaN(quantity) || quantity < 0) {
      return { success: false, error: 'الكمية غير صحيحة' }
    }

    if (isNaN(minqty) || minqty < 0) {
      return { success: false, error: 'الحد الأدنى للكمية غير صحيح' }
    }

    if (isNaN(buyprice) || buyprice < 0) {
      return { success: false, error: 'سعر الشراء غير صحيح' }
    }

    if (isNaN(sellprice) || sellprice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    // Check if SKU/Barcode already exists
    if (sku && sku.trim()) {
      const skuExists = await accessoriesDb.accessoryCodeExists(user.storeid, sku.trim(), 'sku')
      if (skuExists) {
        return { success: false, error: 'رمز SKU موجود مسبقاً' }
      }
    }

    if (barcode && barcode.trim()) {
      const barcodeExists = await accessoriesDb.accessoryCodeExists(user.storeid, barcode.trim(), 'barcode')
      if (barcodeExists) {
        return { success: false, error: 'الباركود موجود مسبقاً' }
      }
    }

    const accessory = await accessoriesDb.insertAccessory({
      storeid: user.storeid,
      name: name.trim(),
      brandid: brandid || null,
      categoryid: categoryid || null,
      supplierid: supplierid || null,
      sku: sku?.trim() || null,
      barcode: barcode?.trim() || null,
      quantity,
      minqty,
      buyprice,
      sellprice,
      active: true,
      notes: notes?.trim() || null
    })

    revalidatePath('/inventory/accessories')
    return { success: true, data: accessory }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة الإكسسوار' }
  }
}

/**
 * Update accessory
 */
export async function updateAccessoryAction(accessoryId: string, formData: FormData): Promise<ActionResult<Accessory>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Check if accessory exists
    const accessory = await accessoriesDb.getAccessoryById(accessoryId)
    if (!accessory) {
      return { success: false, error: 'الإكسسوار غير موجود' }
    }

    // Extract form data
    const name = formData.get('name') as string
    const brandid = formData.get('brandid') as string | null
    const categoryid = formData.get('categoryid') as string | null
    const supplierid = formData.get('supplierid') as string | null
    const sku = formData.get('sku') as string | null
    const barcode = formData.get('barcode') as string | null
    const minqty = parseInt(formData.get('minqty') as string) || 0
    const buyprice = parseFloat(formData.get('buyprice') as string)
    const sellprice = parseFloat(formData.get('sellprice') as string)
    const notes = formData.get('notes') as string | null

    // Validation
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'اسم الإكسسوار مطلوب' }
    }

    if (isNaN(minqty) || minqty < 0) {
      return { success: false, error: 'الحد الأدنى للكمية غير صحيح' }
    }

    if (isNaN(buyprice) || buyprice < 0) {
      return { success: false, error: 'سعر الشراء غير صحيح' }
    }

    if (isNaN(sellprice) || sellprice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    // Check if SKU/Barcode changed and exists
    if (sku && sku.trim() && sku !== accessory.sku) {
      const skuExists = await accessoriesDb.accessoryCodeExists(user.storeid, sku.trim(), 'sku', accessoryId)
      if (skuExists) {
        return { success: false, error: 'رمز SKU موجود مسبقاً' }
      }
    }

    if (barcode && barcode.trim() && barcode !== accessory.barcode) {
      const barcodeExists = await accessoriesDb.accessoryCodeExists(user.storeid, barcode.trim(), 'barcode', accessoryId)
      if (barcodeExists) {
        return { success: false, error: 'الباركود موجود مسبقاً' }
      }
    }

    const updated = await accessoriesDb.updateAccessory(accessoryId, {
      name: name.trim(),
      brandid: brandid || null,
      categoryid: categoryid || null,
      supplierid: supplierid || null,
      sku: sku?.trim() || null,
      barcode: barcode?.trim() || null,
      minqty,
      buyprice,
      sellprice,
      notes: notes?.trim() || null
    })

    revalidatePath('/inventory/accessories')
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: 'فشل تحديث الإكسسوار' }
  }
}

/**
 * Adjust stock quantity (manual adjustment)
 */
export async function adjustStockAction(
  accessoryId: string, 
  adjustment: number,
  reason: string
): Promise<ActionResult<Accessory>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can adjust stock
    if (user.role !== 'owner' ) {
      return { success: false, error: 'غير مصرح لك بتعديل المخزون' }
    }

    if (adjustment === 0) {
      return { success: false, error: 'يجب أن يكون التعديل أكبر أو أقل من صفر' }
    }

    const accessory = await accessoriesDb.updateAccessoryQuantity(accessoryId, adjustment)

    revalidatePath('/inventory/accessories')
    return { success: true, data: accessory }
  } catch (error: any) {
    if (error.message.includes('سالبة')) {
      return { success: false, error: 'الكمية لا يمكن أن تكون سالبة' }
    }
    return { success: false, error: 'فشل تعديل المخزون' }
  }
}

/**
 * Delete accessory (soft delete, owner/manager only)
 */
export async function deleteAccessoryAction(accessoryId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner and manager can delete
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بحذف الإكسسوارات' }
    }

    await accessoriesDb.deleteAccessory(accessoryId)

    revalidatePath('/inventory/accessories')
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف الإكسسوار' }
  }
}

/**
 * Get accessories inventory stats
 */
export async function getAccessoriesInventoryStatsAction() {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const stats = await accessoriesDb.getAccessoriesInventoryValue(user.storeid)
    return { success: true, data: stats }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الإحصائيات' }
  }
}