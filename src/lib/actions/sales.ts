// lib/actions/sales.actions.ts
// Actions Layer - Sales business logic + authorization
// Orchestrates DB calls and user-facing workflow

'use server'

import { revalidatePath } from 'next/cache'
import * as salesDb from '@/lib/supabase/db/sales'
import * as saleItemsDb from '@/lib/supabase/db/saleItems'
import * as authDb from '@/lib/supabase/db/auth'
import { Sale, SaleItem } from '@/lib/types'
import { ActionResult } from '../types/action.types'



// ==================== SALE ACTIONS ====================

/**
 * Get all sales for current user's store
 */
export async function getSalesAction(): Promise<ActionResult<any[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const sales = await salesDb.getSalesByStore(user.storeid)
    return { success: true, data: sales }
  } catch (error: any) {
    console.error('getSalesAction error:', error)
    return { success: false, error: 'فشل تحميل المبيعات' }
  }
}

/**
 * Get sale with items
 */
export async function getSaleWithItemsAction(
  saleId: string
): Promise<ActionResult<{ sale: Sale; items: SaleItem[] }>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!saleId) {
      return { success: false, error: 'معرف الفاتورة مطلوب' }
    }

    const [sale, items] = await Promise.all([
      salesDb.getSaleById(saleId),
      saleItemsDb.getSaleItems(saleId)
    ])

    if (!sale) {
      return { success: false, error: 'الفاتورة غير موجودة' }
    }

    return { success: true, data: { sale, items } }
  } catch (error: any) {
    console.error('getSaleWithItemsAction error:', error)
    return { success: false, error: 'فشل تحميل الفاتورة' }
  }
}

/**
 * Create new sale
 * 
 * Flow:
 * 1. Authorization & validation
 * 2. Generate document number
 * 3. Call DB insertSale
 * 4. Triggers automatically:
 *    - tr_auto_assign_doc_sequence (if needed)
 *    - tr_audit_sale_changes
 * 5. Revalidate cache
 */
export async function createSaleAction(formData: FormData): Promise<ActionResult<Sale>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customerid = formData.get('customerid') as string | null
    const saletype = formData.get('saletype') as 'cash' | 'credit' | null
    const invoice_type = formData.get('invoice_type') as 'full_invoice' | 'quick_sale' | null
    const notes = formData.get('notes') as string | null

    // Validation
    if (!saletype || !['cash', 'credit'].includes(saletype)) {
      return { success: false, error: 'اختر نوع البيع' }
    }

    if (!invoice_type || !['full_invoice', 'quick_sale'].includes(invoice_type)) {
      return { success: false, error: 'اختر نوع الفاتورة' }
    }

    // Generate document number
    const docnumber = await salesDb.generateNextDocNumber(user.storeid)

    // DB Call
    const sale = await salesDb.insertSale({
      storeid: user.storeid,
      customerid: customerid || null,
      docnumber,
      docdate: new Date(),
      saletype,
      invoice_type,
      notes: notes?.trim() || null,
      status: 'draft',
      createdbyid: user.id,
      modifiedbyid: null,
      doc_sequence: null,
      fiscal_year: new Date().getFullYear(),
      invoice_status: 'draft',
      timestamp_posted: null
    })

    revalidatePath('/sales')
    return { success: true, data: sale }
  } catch (error: any) {
    console.error('createSaleAction error:', error)
    return { success: false, error: 'فشل إنشاء الفاتورة' }
  }
}

/**
 * Add item to sale
 * 
 * Flow:
 * 1. Authorization & validation
 * 2. Verify sale is draft
 * 3. Validate product availability
 * 4. Call DB insertSaleItem
 * 5. Triggers automatically:
 *    - tr_create_stock_movement_on_sale
 *    - tr_update_phone_status_on_sale (for phones)
 *    - tr_update_sale_total
 * 6. Revalidate cache
 */
export async function addItemToSaleAction(
  saleId: string,
  itemType: 'phone' | 'accessory',
  productId: string,
  qty: number,
  basePrice: number,
  unitPrice: number,
  discount: number = 0
): Promise<ActionResult<SaleItem>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Validation
    if (!saleId) {
      return { success: false, error: 'معرف الفاتورة مطلوب' }
    }

    if (!itemType || !['phone', 'accessory'].includes(itemType)) {
      return { success: false, error: 'نوع المنتج غير صحيح' }
    }

    if (!productId) {
      return { success: false, error: 'اختر منتج' }
    }

    if (qty < 1 || !Number.isInteger(qty)) {
      return { success: false, error: 'الكمية يجب أن تكون رقم صحيح موجب' }
    }

    if (isNaN(basePrice) || basePrice < 0) {
      return { success: false, error: 'السعر الأساسي غير صحيح' }
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    if (discount < 0 || discount > unitPrice) {
      return { success: false, error: 'الخصم غير صحيح' }
    }

    // Verify sale exists and is draft
    const sale = await salesDb.getSaleById(saleId)
    if (!sale) {
      return { success: false, error: 'الفاتورة غير موجودة' }
    }

    if (sale.status !== 'draft') {
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    // Validate product availability
    const availability = await validateProductAvailability(itemType, productId, qty)
    if (!availability.available) {
      return { success: false, error: availability.message }
    }

    // Get product details
    const product = itemType === 'phone'
      ? await saleItemsDb.getPhoneById(productId)
      : await saleItemsDb.getAccessoryById(productId)

    if (!product) {
      return { success: false, error: 'المنتج غير موجود' }
    }

    // Get IMEI for phones
    let imeiSnapshot = null
    if (itemType === 'phone') {
      imeiSnapshot = (product as any).imei || null
    }

    // Calculate line total
    const lineTotal = (unitPrice - discount) * qty
    if (isNaN(lineTotal) || lineTotal < 0) {
      return { success: false, error: 'فشل في حساب الإجمالي' }
    }

    // DB Call
    const item = await saleItemsDb.insertSaleItem({
      saleid: saleId,
      item_type: itemType,
      phone_id: itemType === 'phone' ? productId : null,
      accessory_id: itemType === 'accessory' ? productId : null,
      qty,
      base_price: basePrice,
      unitprice: unitPrice,
      discount,
      imei_snapshot: imeiSnapshot
    })

    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: item }
  } catch (error: any) {
    console.error('addItemToSaleAction error:', error)
    return { success: false, error: 'فشل إضافة المنتج' }
  }
}

/**
 * Update item in sale
 */
export async function updateItemInSaleAction(
  itemId: string,
  qty: number,
  unitPrice: number,
  discount: number
): Promise<ActionResult<SaleItem>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Validation
    if (!itemId) {
      return { success: false, error: 'معرف العنصر مطلوب' }
    }

    if (qty < 1 || !Number.isInteger(qty)) {
      return { success: false, error: 'الكمية غير صحيحة' }
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    if (discount < 0 || discount > unitPrice) {
      return { success: false, error: 'الخصم غير صحيح' }
    }

    // Verify item exists
    const item = await saleItemsDb.getSaleItemById(itemId)
    if (!item) {
      return { success: false, error: 'العنصر غير موجود' }
    }

    // Verify sale is draft
    const sale = await salesDb.getSaleById(item.saleid)
    if (!sale || sale.status !== 'draft') {
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    // Calculate line total
    const lineTotal = (unitPrice - discount) * qty
    if (isNaN(lineTotal) || lineTotal < 0) {
      return { success: false, error: 'فشل في حساب الإجمالي' }
    }

    // DB Call
    const updated = await saleItemsDb.updateSaleItem(itemId, {
      qty,
      unitprice: unitPrice,
      discount,
      linetotal: lineTotal
    })

    revalidatePath(`/sales/${item.saleid}`)
    return { success: true, data: updated }
  } catch (error: any) {
    console.error('updateItemInSaleAction error:', error)
    return { success: false, error: 'فشل تحديث العنصر' }
  }
}

/**
 * Remove item from sale
 */
export async function removeItemFromSaleAction(itemId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!itemId) {
      return { success: false, error: 'معرف العنصر مطلوب' }
    }

    // Get item and verify
    const item = await saleItemsDb.getSaleItemById(itemId)
    if (!item) {
      return { success: false, error: 'العنصر غير موجود' }
    }

    // Verify sale is draft
    const sale = await salesDb.getSaleById(item.saleid)
    if (!sale || sale.status !== 'draft') {
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    // DB Call
    await saleItemsDb.deleteSaleItem(itemId)

    revalidatePath(`/sales/${item.saleid}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error('removeItemFromSaleAction error:', error)
    return { success: false, error: 'فشل حذف العنصر' }
  }
}

/**
 * Post (finalize) sale
 * 
 * Flow:
 * 1. Authorization
 * 2. Verify sale is draft & has items
 * 3. Call DB updateSaleStatus
 * 4. Triggers automatically:
 *    - tr_audit_sale_changes
 * 5. Revalidate cache
 */
export async function postSaleAction(saleId: string): Promise<ActionResult<Sale>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!saleId) {
      return { success: false, error: 'معرف الفاتورة مطلوب' }
    }

    // Verify sale exists and is draft
    const sale = await salesDb.getSaleById(saleId)
    if (!sale) {
      return { success: false, error: 'الفاتورة غير موجودة' }
    }

    if (sale.status !== 'draft') {
      return { success: false, error: 'الفاتورة منشورة مسبقاً' }
    }

    // Verify has items
    const items = await saleItemsDb.getSaleItems(saleId)
    if (items.length === 0) {
      return { success: false, error: 'أضف منتج واحد على الأقل' }
    }

    // Verify has total amount
    if ((sale.total || 0) <= 0) {
      return { success: false, error: 'إجمالي الفاتورة يجب أن يكون أكبر من صفر' }
    }

    // DB Call
    const posted = await salesDb.updateSaleStatus(saleId, 'posted')

    revalidatePath('/sales')
    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: posted }
  } catch (error: any) {
    console.error('postSaleAction error:', error)
    return { success: false, error: 'فشل نشر الفاتورة' }
  }
}

/**
 * Cancel sale
 */
export async function cancelSaleAction(saleId: string): Promise<ActionResult<Sale>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بإلغاء الفواتير' }
    }

    if (!saleId) {
      return { success: false, error: 'معرف الفاتورة مطلوب' }
    }

    // DB Call
    const cancelled = await salesDb.updateSaleStatus(saleId, 'cancelled')

    revalidatePath('/sales')
    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: cancelled }
  } catch (error: any) {
    console.error('cancelSaleAction error:', error)
    return { success: false, error: 'فشل إلغاء الفاتورة' }
  }
}

/**
 * Get sales summary
 */
export async function getSalesSummaryAction(days: number = 30): Promise<ActionResult<any>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (days < 1 || days > 365) {
      return { success: false, error: 'عدد الأيام غير صحيح' }
    }

    const summary = await salesDb.getSalesSummary(user.storeid, days)
    return { success: true, data: summary }
  } catch (error: any) {
    console.error('getSalesSummaryAction error:', error)
    return { success: false, error: 'فشل حساب الإحصائيات' }
  }
}

// ==================== HELPERS ====================

/**
 * Validate product availability
 */
async function validateProductAvailability(
  productType: 'phone' | 'accessory',
  productId: string,
  qty: number
): Promise<{ available: boolean; message: string }> {
  try {
    if (productType === 'phone') {
      const phone = await saleItemsDb.getPhoneById(productId)
      if (!phone) {
        return { available: false, message: 'الهاتف غير موجود' }
      }
      if (phone.status !== 'available') {
        return { available: false, message: 'الهاتف غير متاح' }
      }
      return { available: true, message: 'متاح' }
    } else if (productType === 'accessory') {
      const accessory = await saleItemsDb.getAccessoryById(productId)
      if (!accessory) {
        return { available: false, message: 'الإكسسوار غير موجود' }
      }
      if (!accessory.active) {
        return { available: false, message: 'الإكسسوار معطل' }
      }
      const quantity = (accessory as any).quantity || 0
      if (quantity < qty) {
        return { available: false, message: `المخزون غير كافٍ (متوفر: ${quantity})` }
      }
      return { available: true, message: 'متاح' }
    }

    return { available: false, message: 'نوع المنتج غير معروف' }
  } catch (error: any) {
    console.error('validateProductAvailability error:', error)
    return { available: false, message: 'فشل التحقق من توفر المنتج' }
  }
}




