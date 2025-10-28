// lib/supabase/db/saleItems.ts
// DB Layer - Sale items (invoice lines) with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { SaleItem, SaleItemWithDetails } from '@/lib/types'

type SaleItemInsert = Omit<SaleItem, 'id' | 'linetotal' | 'createdat'>

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
 * Get all items for a sale
 */
export async function getSaleItems(saleId: string): Promise<SaleItemWithDetails[]> {
  const functionName = 'getSaleItems'
  
  try {
    if (!saleId) {
      throw new Error('saleId مطلوب')
    }

    console.log(`[${functionName}] البدء: جلب عناصر الفاتورة ${saleId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('sale_item')
      .select('*')
      .eq('saleid', saleId)
      .order('createdat', { ascending: true })

    if (error) {
      logError(functionName, error, { saleId })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد عناصر للفاتورة: ${saleId}`)
      return []
    }

    console.log(`[${functionName}] تم جلب ${data.length} عناصر، جاري جلب التفاصيل`)
    
    // Get product details
    const itemsWithDetails = await Promise.all(
      data.map(async (item, index) => {
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
    logError(functionName, error, { saleId })
    throw new Error(`فشل في جلب عناصر الفاتورة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert sale item (add product to invoice)
 */
export async function insertSaleItem(data: SaleItemInsert): Promise<SaleItem> {
  const functionName = 'insertSaleItem'
  
  try {
    if (!data.saleid) throw new Error('saleid مطلوب')
    if (!data.item_type) throw new Error('item_type مطلوب')
    if (!data.phone_id && !data.accessory_id) throw new Error('يجب تحديد phone_id أو accessory_id')
    if (data.qty < 1) throw new Error('الكمية يجب أن تكون أكبر من 0')
    if (data.unitprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')
    if (data.base_price < 0) throw new Error('السعر الأساسي لا يمكن أن يكون سالب')
    if (data.discount < 0 || data.discount > data.unitprice) throw new Error('الخصم غير صحيح')

    console.log(`[${functionName}] البدء: إضافة منتج لفاتورة ${data.saleid}`, {
      itemType: data.item_type,
      qty: data.qty,
      unitprice: data.unitprice,
      discount: data.discount
    })

    
    const supabase = await createClientServer()
    
    const { data: item, error } = await supabase
      .from('sale_item')
      .insert([{
        ...data,
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { saleid: data.saleid, itemType: data.item_type })
      throw error
    }

    if (!item) {
      throw new Error('فشل في إرجاع العنصر المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: العنصر ${item.id}`)
    return item
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة المنتج: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update sale item (change qty, price, discount)
 */
export async function updateSaleItem(
  itemId: string,
  qty: number,
  unitprice: number,
  discount: number
): Promise<SaleItem> {
  const functionName = 'updateSaleItem'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')
    if (qty < 1) throw new Error('الكمية يجب أن تكون أكبر من 0')
    if (unitprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')
    if (discount < 0 || discount > unitprice) throw new Error('الخصم غير صحيح')

    console.log(`[${functionName}] البدء: تحديث العنصر ${itemId}`, {
      qty,
      unitprice,
      discount
    })
    
    const linetotal = (unitprice - discount) * qty
    
    if (isNaN(linetotal) || linetotal < 0) {
      throw new Error('فشل في حساب الإجمالي: النتيجة غير صحيحة')
    }

    console.log(`[${functionName}] إجمالي السطر المحسوب: ${linetotal}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('sale_item')
      .update({
        qty,
        unitprice,
        discount,
        linetotal
      })
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('العنصر غير موجود')
      }
      logError(functionName, error, { itemId, qty, unitprice, discount })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع العنصر المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { itemId, qty, unitprice, discount })
    throw new Error(`فشل في تحديث العنصر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Delete sale item
 */
export async function deleteSaleItem(itemId: string): Promise<void> {
  const functionName = 'deleteSaleItem'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')

    console.log(`[${functionName}] البدء: حذف العنصر ${itemId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('sale_item')
      .delete()
      .eq('id', itemId)

    if (error) {
      logError(functionName, error, { itemId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: العنصر ${itemId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { itemId })
    throw new Error(`فشل في حذف العنصر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Check if product can be sold (availability check)
 */
export async function canSellProduct(
  productType: 'phone' | 'accessory',
  productId: string,
  qty: number
): Promise<{ available: boolean; message: string }> {
  const functionName = 'canSellProduct'
  
  try {
    if (!productType) throw new Error('productType مطلوب')
    if (!productId) throw new Error('productId مطلوب')
    if (qty < 1) throw new Error('الكمية يجب أن تكون أكبر من 0')

    console.log(`[${functionName}] البدء: فحص توفر ${productType} ${productId} (كمية: ${qty})`)
    
    const supabase = await createClientServer()
    
    if (productType === 'phone') {
      try {
        const { data: phone, error } = await supabase
          .from('phone')
          .select('status, id')
          .eq('id', productId)
          .is('deleted_at', null)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`[${functionName}] الهاتف ${productId} غير موجود`)
            return { available: false, message: 'الهاتف غير موجود' }
          }
          logError(`${functionName}::phoneQuery`, error, { productId })
          throw error
        }

        if (!phone) {
          console.log(`[${functionName}] بيانات الهاتف فارغة`)
          return { available: false, message: 'الهاتف غير موجود' }
        }
        
        if (phone.status !== 'available') {
          const statusMsg = phone.status === 'sold' ? 'مباع' : 'غير متاح'
          console.log(`[${functionName}] الهاتف ${phone.status === 'sold' ? 'مباع' : 'غير متاح'}`)
          return { available: false, message: `الهاتف ${statusMsg}` }
        }
        
        console.log(`[${functionName}] الهاتف متاح`)
        return { available: true, message: 'متاح' }
      } catch (phoneErr) {
        logError(`${functionName}::phoneCheck`, phoneErr, { productId })
        throw new Error(`فشل في فحص توفر الهاتف: ${phoneErr}`)
      }
    } else if (productType === 'accessory') {
      try {
        const { data: accessory, error } = await supabase
          .from('accessory')
          .select('quantity, active, id')
          .eq('id', productId)
          .is('deleted_at', null)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`[${functionName}] الإكسسوار ${productId} غير موجود`)
            return { available: false, message: 'الإكسسوار غير موجود' }
          }
          logError(`${functionName}::accessoryQuery`, error, { productId })
          throw error
        }

        if (!accessory) {
          console.log(`[${functionName}] بيانات الإكسسوار فارغة`)
          return { available: false, message: 'الإكسسوار غير موجود' }
        }
        
        if (!accessory.active) {
          console.log(`[${functionName}] الإكسسوار معطل`)
          return { available: false, message: 'الإكسسوار معطل' }
        }
        
        if ((accessory.quantity || 0) < qty) {
          console.log(`[${functionName}] المخزون غير كافٍ: المطلوب ${qty}، المتوفر ${accessory.quantity}`)
          return { 
            available: false, 
            message: `المخزون غير كافٍ (متوفر: ${accessory.quantity})` 
          }
        }
        
        console.log(`[${functionName}] الإكسسوار متاح (المخزون: ${accessory.quantity})`)
        return { available: true, message: 'متاح' }
      } catch (accessoryErr) {
        logError(`${functionName}::accessoryCheck`, accessoryErr, { productId })
        throw new Error(`فشل في فحص توفر الإكسسوار: ${accessoryErr}`)
      }
    } else {
      throw new Error(`نوع المنتج غير معروف: ${productType}`)
    }
  } catch (error: any) {
    logError(functionName, error, { productType, productId, qty })
    throw new Error(`فشل في فحص توفر المنتج: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get sale item by ID
 */
export async function getSaleItemById(itemId: string): Promise<SaleItem | null> {
  const functionName = 'getSaleItemById'
  
  try {
    if (!itemId) throw new Error('itemId مطلوب')

    console.log(`[${functionName}] البدء: جلب العنصر ${itemId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('sale_item')
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