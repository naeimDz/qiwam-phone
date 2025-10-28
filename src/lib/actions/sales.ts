// lib/actions/sales.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as salesDb from '@/lib/supabase/db/sales'
import * as saleItemsDb from '@/lib/supabase/db/saleItems'
import * as authDb from '@/lib/supabase/db/auth'
import { Sale, SaleWithDetails, SaleItem } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get all sales for current user's store
 */
export async function getSalesAction(): Promise<ActionResult<SaleWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const sales = await salesDb.getSalesByStore(user.storeid)
    return { success: true, data: sales }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل المبيعات' }
  }
}

/**
 * Get sale by ID with items
 */
export async function getSaleWithItemsAction(saleId: string) {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
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
    return { success: false, error: 'فشل تحميل الفاتورة' }
  }
}

/**
 * Create new sale
 */
export async function createSaleAction(formData: FormData): Promise<ActionResult<Sale>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customerid = formData.get('customerid') as string | null
    const saletype = formData.get('saletype') as 'cash' | 'credit'
    const invoice_type = formData.get('invoice_type') as 'full_invoice' | 'quick_sale'
    const notes = formData.get('notes') as string | null

    // Generate document number
    const docnumber = await salesDb.generateSaleDocNumber(user.storeid)

    const sale = await salesDb.insertSale({
      storeid: user.storeid,
      customerid: customerid || null,
      docnumber,
      docdate: new Date(),
      saletype: saletype || 'cash',
      invoice_type: invoice_type || 'full_invoice',
      notes: notes?.trim() || null,
      status: 'draft',
      createdbyid: user.id,
      modifiedbyid: null
    })

    revalidatePath('/sales')
    return { success: true, data: sale }
  } catch (error: any) {
    return { success: false, error: 'فشل إنشاء الفاتورة' }
  }
}

/**
 * Add item to sale
 */
export async function addItemToSaleAction(
  saleId: string,
  formData: FormData
): Promise<ActionResult<SaleItem>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Check sale exists and is draft
    const sale = await salesDb.getSaleById(saleId)
    if (!sale) {
      return { success: false, error: 'الفاتورة غير موجودة' }
    }

    if (sale.status !== 'draft') {
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    const item_type = formData.get('item_type') as 'phone' | 'accessory'
    const product_id = formData.get('product_id') as string
    const qty = parseInt(formData.get('qty') as string) || 1
    const base_price = parseFloat(formData.get('base_price') as string)
    const unitprice = parseFloat(formData.get('unitprice') as string)
    const discount = parseFloat(formData.get('discount') as string) || 0

    // Validation
    if (!item_type || !product_id) {
      return { success: false, error: 'يجب اختيار منتج' }
    }

    if (isNaN(base_price) || base_price < 0) {
      return { success: false, error: 'السعر الأساسي غير صحيح' }
    }

    if (isNaN(unitprice) || unitprice < 0) {
      return { success: false, error: 'سعر البيع غير صحيح' }
    }

    if (discount < 0 || discount > unitprice) {
      return { success: false, error: 'الخصم غير صحيح' }
    }

    // Check product availability
    const availability = await saleItemsDb.canSellProduct(item_type, product_id, qty)
    if (!availability.available) {
      return { success: false, error: availability.message }
    }

    // Get IMEI for phones
    let imei_snapshot = null
    if (item_type === 'phone') {
      const { createClientServer } = await import('@/lib/supabase')
      const supabase = await createClientServer()
      const { data: phone } = await supabase
        .from('phone')
        .select('imei')
        .eq('id', product_id)
        .single()
      imei_snapshot = phone?.imei || null
    }

    const item = await saleItemsDb.insertSaleItem({
      saleid: saleId,
      item_type,
      phone_id: item_type === 'phone' ? product_id : null,
      accessory_id: item_type === 'accessory' ? product_id : null,
      qty,
      base_price,
      unitprice,
      discount,
      imei_snapshot
    })

    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: item }
  } catch (error: any) {
    return { success: false, error: 'فشل إضافة المنتج' }
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

    // Get item to check sale status
    const item = await saleItemsDb.getSaleItemById(itemId)
    if (!item) {
      return { success: false, error: 'العنصر غير موجود' }
    }

    const sale = await salesDb.getSaleById(item.saleid)
    if (!sale || sale.status !== 'draft') {
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    await saleItemsDb.deleteSaleItem(itemId)

    revalidatePath(`/sales/${item.saleid}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل حذف المنتج' }
  }
}

/**
 * Post sale (finalize)
 */
export async function postSaleAction(saleId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const sale = await salesDb.getSaleById(saleId)
    if (!sale) {
      return { success: false, error: 'الفاتورة غير موجودة' }
    }

    if (sale.status !== 'draft') {
      return { success: false, error: 'الفاتورة منشورة مسبقاً' }
    }

    // Check has items
    const items = await saleItemsDb.getSaleItems(saleId)
    if (items.length === 0) {
      return { success: false, error: 'يجب إضافة منتج واحد على الأقل' }
    }

    // Update status to posted
    const { createClientServer } = await import('@/lib/supabase')
    const supabase = await createClientServer()
    await supabase
      .from('sale')
      .update({ status: 'posted', updatedat: new Date().toISOString() })
      .eq('id', saleId)

    revalidatePath('/sales')
    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل نشر الفاتورة' }
  }
}

/**
 * Cancel sale
 */
export async function cancelSaleAction(saleId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner/manager can cancel
    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بإلغاء الفواتير' }
    }

    await salesDb.cancelSale(saleId)

    revalidatePath('/sales')
    revalidatePath(`/sales/${saleId}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    return { success: false, error: 'فشل إلغاء الفاتورة' }
  }
}

/**
 * Get sales summary
 */
export async function getSalesSummaryAction(days: number = 30) {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const summary = await salesDb.getSalesSummary(user.storeid, days)
    return { success: true, data: summary }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل الإحصائيات' }
  }
}