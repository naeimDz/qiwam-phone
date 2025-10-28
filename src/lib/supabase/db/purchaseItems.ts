// lib/supabase/db/purchaseItems.ts
// DB Layer - Purchase items (invoice lines) with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { PurchaseItem, PurchaseItemWithDetails } from '@/lib/types'

type PurchaseItemInsert = Omit<PurchaseItem, 'id' | 'linetotal' | 'createdat'>

// Error logging utility
interface ErrorLog {
  timestamp: string
  function: string
  error: any
  context?: Record<string, any>
}

const logError = (functionName: string, error: any, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      status: error?.status
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
  return errorLog
}

/**
 * Get all items for a purchase
 */
export async function getPurchaseItems(purchaseId: string): Promise<PurchaseItemWithDetails[]> {
  const functionName = 'getPurchaseItems'
  
  try {
    if (!purchaseId) {
      throw new Error('purchaseId مطلوب')
    }

    console.log(`[${functionName}] البدء: جلب عناصر فاتورة الشراء ${purchaseId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase_item')
      .select('*')
      .eq('purchaseid', purchaseId)
      .order('createdat', { ascending: true })

    if (error) {
      logError(functionName, error, { purchaseId })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد عناصر لفاتورة الشراء: ${purchaseId}`)
      return []
    }

    console.log(`[${functionName}] تم جلب ${data.length} عناصر، جاري جلب التفاصيل`)
    
    // Get product details
    const itemsWithDetails = await Promise.all(
      data.map(async (item) => {
        try {
          let product_name = 'Unknown'
          let brand_name = null
          
          if (item.item_type === 'phone' && item.phone_id) {
            try {
              const { data: phone, error: phoneError } = await supabase
                .from('phone')
                .select('name, brand:brandid(name)')
                .eq('id', item.phone_id)
                .single()
              
              if (phoneError) {
                if (phoneError.code === 'PGRST116') {
                  console.warn(`[${functionName}] تحذير: الهاتف ${item.phone_id} محذوف`)
                  product_name = 'Phone (deleted)'
                } else {
                  logError(`${functionName}::getPhoneDetails`, phoneError, { phoneId: item.phone_id })
                  product_name = 'Phone (error loading)'
                }
              } else if (phone) {
                product_name = phone?.name || 'Phone (unknown)'
                brand_name = Array.isArray(phone?.brand) 
                  ? phone?.brand[0]?.name || null 
                  : phone?.brand || null
              }
            } catch (phoneErr) {
              logError(`${functionName}::phoneProcessing`, phoneErr, { phoneId: item.phone_id, itemId: item.id })
              console.warn(`[${functionName}] تحذير: فشل في جلب تفاصيل الهاتف`)
              product_name = 'Phone (error)'
            }
          } else if (item.item_type === 'accessory' && item.accessory_id) {
            try {
              const { data: accessory, error: accessoryError } = await supabase
                .from('accessory')
                .select('name, brand:brandid(name)')
                .eq('id', item.accessory_id)
                .single()
              
              if (accessoryError) {
                if (accessoryError.code === 'PGRST116') {
                  console.warn(`[${functionName}] تحذير: الإكسسوار ${item.accessory_id} محذوف`)
                  product_name = 'Accessory (deleted)'
                } else {
                  logError(`${functionName}::getAccessoryDetails`, accessoryError, { accessoryId: item.accessory_id })
                  product_name = 'Accessory (error loading)'
                }
              } else if (accessory) {
                product_name = accessory?.name || 'Accessory (unknown)'
                brand_name = Array.isArray(accessory?.brand)
                  ? accessory?.brand[0]?.name || null
                  : accessory?.brand || null
              }
            } catch (accessoryErr) {
              logError(`${functionName}::accessoryProcessing`, accessoryErr, { accessoryId: item.accessory_id, itemId: item.id })
              console.warn(`[${functionName}] تحذير: فشل في جلب تفاصيل الإكسسوار`)
              product_name = 'Accessory (error)'
            }
          } else {
            console.warn(`[${functionName}] تحذير: نوع منتج غير معروف أو معرّف مفقود`, { itemType: item.item_type })
          }
          
          return {
            ...item,
            product_name,
            brand_name
          }
        } catch (itemErr) {
          logError(`${functionName}::processItem`, itemErr, { itemId: item.id, itemType: item.item_type })
          console.error(`[${functionName}] خطأ في معالجة العنصر ${item.id}`)
          return {
            ...item,
            product_name: 'Error loading product',
            brand_name: null
          }
        }
      })
    )
    
    console.log(`[${functionName}] تم بنجاح: ${itemsWithDetails.length} عنصر مع التفاصيل`)
    return itemsWithDetails
  } catch (error: any) {
    logError(functionName, error, { purchaseId })
    throw new Error(`فشل في جلب عناصر فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert purchase item (add product to purchase invoice)
 * Note: Triggers will update stock and audit logs automatically
 */
export async function insertPurchaseItem(data: PurchaseItemInsert): Promise<PurchaseItem> {
  const functionName = 'insertPurchaseItem'
  
  try {
    if (!data.purchaseid) throw new Error('purchaseid مطلوب')
    if (!data.item_type) throw new Error('item_type مطلوب')
    if (!data.phone_id && !data.accessory_id) throw new Error('يجب تحديد phone_id أو accessory_id')
    if (data.qty < 1) throw new Error('الكمية يجب أن تكون أكبر من 0')
    if (data.unitprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: إضافة منتج لفاتورة شراء ${data.purchaseid}`, {
      itemType: data.item_type,
      qty: data.qty,
      unitprice: data.unitprice
    })
    
    // Calculate line total
    const linetotal = data.unitprice * data.qty
    
    if (isNaN(linetotal) || linetotal < 0) {
      throw new Error('فشل في حساب الإجمالي: النتيجة غير صحيحة')
    }

    console.log(`[${functionName}] إجمالي السطر المحسوب: ${linetotal}`)
    
    const supabase = await createClientServer()
    
    const { data: item, error } = await supabase
      .from('purchase_item')
      .insert([{
        ...data,
        linetotal
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { purchaseid: data.purchaseid, itemType: data.item_type })
      throw error
    }

    if (!item) {
      throw new Error('فشل في إرجاع العنصر المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: العنصر ${item.id} (Trigger سيحدّث المخزون والـ Audit Log)`)
    return item
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة المنتج: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update purchase item (change qty, price)
 * Note: Triggers will update totals automatically
 */
export async function updatePurchaseItem(
  itemId: string,
  qty: number,
  unitprice: number
): Promise<PurchaseItem> {
  const functionName = 'updatePurchaseItem'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')
    if (qty < 1) throw new Error('الكمية يجب أن تكون أكبر من 0')
    if (unitprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: تحديث العنصر ${itemId}`, {
      qty,
      unitprice
    })
    
    const linetotal = unitprice * qty
    
    if (isNaN(linetotal) || linetotal < 0) {
      throw new Error('فشل في حساب الإجمالي: النتيجة غير صحيحة')
    }

    console.log(`[${functionName}] إجمالي السطر المحسوب: ${linetotal}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase_item')
      .update({
        qty,
        unitprice,
        linetotal
      })
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('العنصر غير موجود')
      }
      logError(functionName, error, { itemId, qty, unitprice })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع العنصر المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح (Trigger سيحدّث الإجماليات)`)
    return data
  } catch (error: any) {
    logError(functionName, error, { itemId, qty, unitprice })
    throw new Error(`فشل في تحديث العنصر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Delete purchase item
 * Note: Triggers will revert stock changes automatically
 */
export async function deletePurchaseItem(itemId: string): Promise<void> {
  const functionName = 'deletePurchaseItem'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')

    console.log(`[${functionName}] البدء: حذف العنصر ${itemId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('purchase_item')
      .delete()
      .eq('id', itemId)

    if (error) {
      logError(functionName, error, { itemId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: العنصر ${itemId} محذوف (Trigger سيعيد المخزون)`)
  } catch (error: any) {
    logError(functionName, error, { itemId })
    throw new Error(`فشل في حذف العنصر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get purchase item by ID
 */
export async function getPurchaseItemById(itemId: string): Promise<PurchaseItem | null> {
  const functionName = 'getPurchaseItemById'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')

    console.log(`[${functionName}] البدء: جلب العنصر ${itemId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase_item')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] العنصر ${itemId} غير موجود`)
        return null
      }
      logError(functionName, error, { itemId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات العنصر فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { itemId })
    throw new Error(`فشل في جلب العنصر: ${error?.message || 'خطأ غير معروف'}`)
  }
}