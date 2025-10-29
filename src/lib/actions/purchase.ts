// lib/actions/purchase.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as purchaseDb from '@/lib/supabase/db/purchase'
import * as purchaseItemsDb from '@/lib/supabase/db/purchaseItems'
import * as authDb from '@/lib/supabase/db/auth'
import { Purchase, PurchaseWithDetails, PurchaseItem } from '@/lib/types'

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// Error logging utility
interface ErrorLog {
  timestamp: string
  action: string
  error: any
  context?: Record<string, any>
}

const logActionError = (actionName: string, error: any, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    action: actionName,
    error: {
      message: error?.message,
      code: error?.code,
      details: error?.details
    },
    context
  }
  console.error(`[ACTION: ${actionName}]`, errorLog)
  return errorLog
}

/**
 * Get all purchases for current user's store
 */
export async function getPurchasesAction(): Promise<ActionResult<PurchaseWithDetails[]>> {
  const actionName = 'getPurchasesAction'
  
  try {
    console.log(`[${actionName}] البدء: جلب جميع عمليات الشراء`)
    
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    console.log(`[${actionName}] جاري جلب البيانات للمتجر ${user.storeid}`)
    const purchases = await purchaseDb.getPurchasesByStore(user.storeid)
    
    console.log(`[${actionName}] تم بنجاح: ${purchases.length} عملية شراء`)
    return { success: true, data: purchases }
  } catch (error: any) {
    logActionError(actionName, error)
    return { success: false, error: 'فشل تحميل عمليات الشراء' }
  }
}

/**
 * Get purchase by ID with items
 */
export async function getPurchaseWithItemsAction(purchaseId: string) {
  const actionName = 'getPurchaseWithItemsAction'
  
  try {
    if (!purchaseId) {
      throw new Error('purchaseId مطلوب')
    }

    console.log(`[${actionName}] البدء: جلب فاتورة الشراء ${purchaseId}`)
    
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const [purchase, items] = await Promise.all([
      purchaseDb.getPurchaseById(purchaseId),
      purchaseItemsDb.getPurchaseItems(purchaseId)
    ])

    if (!purchase) {
      console.log(`[${actionName}] فاتورة الشراء غير موجودة`)
      return { success: false, error: 'فاتورة الشراء غير موجودة' }
    }

    console.log(`[${actionName}] تم بنجاح: ${items.length} عنصر`)
    return { success: true, data: { purchase, items } }
  } catch (error: any) {
    logActionError(actionName, error, { purchaseId })
    return { success: false, error: 'فشل تحميل فاتورة الشراء' }
  }
}

/**
 * Create new purchase
 */
export async function createPurchaseAction(formData: FormData): Promise<ActionResult<Purchase>> {
  const actionName = 'createPurchaseAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const supplierid = formData.get('supplierid') as string | null
    const notes = formData.get('notes') as string | null

    console.log(`[${actionName}] البدء: إنشاء فاتورة شراء جديدة`)

    // Generate document number
    //const docnumber = await purchaseDb.generatePurchaseDocNumber(user.storeid)

    const purchase = await purchaseDb.insertPurchase({
      storeid: user.storeid,
      supplierid: supplierid || null,
      // docnumber,
      docdate: new Date(),
      notes: notes?.trim() || null,
      status: 'draft',
      createdbyid: user.id,
      modifiedbyid: null,
      doc_sequence: null,
      fiscal_year: 0,
      payment_method: null
    })

    console.log(`[${actionName}] تم بنجاح: فاتورة ${purchase.id}`)
    revalidatePath('/purchases')
    return { success: true, data: purchase }
  } catch (error: any) {
    logActionError(actionName, error)
    return { success: false, error: 'فشل إنشاء فاتورة الشراء' }
  }
}

/**
 * Add item to purchase
 */
export async function addItemToPurchaseAction(
  purchaseId: string,
  formData: FormData
): Promise<ActionResult<PurchaseItem>> {
  const actionName = 'addItemToPurchaseAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    console.log(`[${actionName}] البدء: إضافة منتج لفاتورة ${purchaseId}`)

    // Check purchase exists and is draft
    const purchase = await purchaseDb.getPurchaseById(purchaseId)
    if (!purchase) {
      console.log(`[${actionName}] فاتورة الشراء غير موجودة`)
      return { success: false, error: 'فاتورة الشراء غير موجودة' }
    }

    if (purchase.status !== 'draft') {
      console.warn(`[${actionName}] محاولة تعديل فاتورة منشورة`)
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    const item_type = formData.get('item_type') as 'phone' | 'accessory'
    const product_id = formData.get('product_id') as string
    const qty = parseInt(formData.get('qty') as string) || 1
    const unitprice = parseFloat(formData.get('unitprice') as string)

    // Validation
    if (!item_type || !product_id) {
      console.warn(`[${actionName}] بيانات ناقصة: item_type أو product_id`)
      return { success: false, error: 'يجب اختيار منتج' }
    }

    if (isNaN(unitprice) || unitprice < 0) {
      console.warn(`[${actionName}] سعر الشراء غير صحيح: ${unitprice}`)
      return { success: false, error: 'سعر الشراء غير صحيح' }
    }

    if (qty < 1 || isNaN(qty)) {
      console.warn(`[${actionName}] كمية غير صحيحة: ${qty}`)
      return { success: false, error: 'الكمية يجب أن تكون أكبر من 0' }
    }

    console.log(`[${actionName}] معاملات التحقق نجحت، جاري إضافة العنصر`)

    const item = await purchaseItemsDb.insertPurchaseItem({
      purchaseid: purchaseId,
      item_type,
      phone_id: item_type === 'phone' ? product_id : null,
      accessory_id: item_type === 'accessory' ? product_id : null,
      qty,
      unitprice
    })

    console.log(`[${actionName}] تم بنجاح: العنصر ${item.id}`)
    revalidatePath(`/purchases/${purchaseId}`)
    return { success: true, data: item }
  } catch (error: any) {
    logActionError(actionName, error, { purchaseId })
    return { success: false, error: 'فشل إضافة المنتج' }
  }
}

/**
 * Remove item from purchase
 */
export async function removeItemFromPurchaseAction(itemId: string): Promise<ActionResult> {
  const actionName = 'removeItemFromPurchaseAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    console.log(`[${actionName}] البدء: حذف العنصر ${itemId}`)

    // Get item to check purchase status
    const item = await purchaseItemsDb.getPurchaseItemById(itemId)
    if (!item) {
      console.log(`[${actionName}] العنصر غير موجود`)
      return { success: false, error: 'العنصر غير موجود' }
    }

    const purchase = await purchaseDb.getPurchaseById(item.purchaseid)
    if (!purchase || purchase.status !== 'draft') {
      console.warn(`[${actionName}] محاولة حذف من فاتورة منشورة`)
      return { success: false, error: 'لا يمكن تعديل فاتورة منشورة' }
    }

    await purchaseItemsDb.deletePurchaseItem(itemId)

    console.log(`[${actionName}] تم بنجاح`)
    revalidatePath(`/purchases/${item.purchaseid}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    logActionError(actionName, error, { itemId })
    return { success: false, error: 'فشل حذف العنصر' }
  }
}

/**
 * Post purchase (finalize)
 */
export async function postPurchaseAction(purchaseId: string): Promise<ActionResult> {
  const actionName = 'postPurchaseAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    console.log(`[${actionName}] البدء: نشر فاتورة الشراء ${purchaseId}`)

    const purchase = await purchaseDb.getPurchaseById(purchaseId)
    if (!purchase) {
      console.log(`[${actionName}] فاتورة الشراء غير موجودة`)
      return { success: false, error: 'فاتورة الشراء غير موجودة' }
    }

    if (purchase.status !== 'draft') {
      console.warn(`[${actionName}] محاولة نشر فاتورة منشورة مسبقاً`)
      return { success: false, error: 'فاتورة الشراء منشورة مسبقاً' }
    }

    // Check has items
    const items = await purchaseItemsDb.getPurchaseItems(purchaseId)
    if (items.length === 0) {
      console.warn(`[${actionName}] محاولة نشر فاتورة فارغة`)
      return { success: false, error: 'يجب إضافة منتج واحد على الأقل' }
    }

    // Update status to posted
    const { createClientServer } = await import('@/lib/supabase')
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('purchase')
      .update({ status: 'posted', updatedat: new Date().toISOString() })
      .eq('id', purchaseId)

    if (error) {
      console.error(`[${actionName}] خطأ في تحديث الحالة`)
      throw error
    }

    console.log(`[${actionName}] تم بنجاح`)
    revalidatePath('/purchases')
    revalidatePath(`/purchases/${purchaseId}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    logActionError(actionName, error, { purchaseId })
    return { success: false, error: 'فشل نشر فاتورة الشراء' }
  }
}

/**
 * Cancel purchase
 */
export async function cancelPurchaseAction(purchaseId: string): Promise<ActionResult> {
  const actionName = 'cancelPurchaseAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Only owner can cancel
    if (user.role !== 'owner') {
      console.warn(`[${actionName}] محاولة إلغاء من مستخدم بدون صلاحيات`)
      return { success: false, error: 'غير مصرح لك بإلغاء الفواتير' }
    }

    console.log(`[${actionName}] البدء: إلغاء فاتورة الشراء ${purchaseId}`)

    await purchaseDb.cancelPurchase(purchaseId)

    console.log(`[${actionName}] تم بنجاح`)
    revalidatePath('/purchases')
    revalidatePath(`/purchases/${purchaseId}`)
    return { success: true, data: undefined }
  } catch (error: any) {
    logActionError(actionName, error, { purchaseId })
    return { success: false, error: 'فشل إلغاء فاتورة الشراء' }
  }
}

/**
 * Get purchases summary
 */
export async function getPurchasesSummaryAction(days: number = 30) {
  const actionName = 'getPurchasesSummaryAction'
  
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      console.warn(`[${actionName}] المستخدم بدون متجر`)
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    console.log(`[${actionName}] البدء: حساب الإحصائيات`)

    const summary = await purchaseDb.getPurchasesSummary(user.storeid, days)
    
    console.log(`[${actionName}] تم بنجاح`)
    return { success: true, data: summary }
  } catch (error: any) {
    logActionError(actionName, error, { days })
    return { success: false, error: 'فشل تحميل الإحصائيات' }
  }
}