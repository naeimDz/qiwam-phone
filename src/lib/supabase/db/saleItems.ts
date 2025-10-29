// lib/supabase/db/saleItems.ts
// DB Layer - Sale items (invoice lines)
// Queries only - NO validation, NO business logic

import { createClientServer } from '@/lib/supabase'
import { SaleItem, SaleItemWithDetails } from '@/lib/types'

type SaleItemInsert = Omit<SaleItem, 'id' | 'linetotal' | 'createdat'>

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

// ==================== READ OPERATIONS ====================

/**
 * Get all items for a sale with product details
 */
export async function getSaleItems(saleId: string): Promise<SaleItemWithDetails[]> {
  const functionName = 'getSaleItems'

  try {
    if (!saleId) throw new Error('saleId مطلوب')

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
      return []
    }

    // Get product details for each item
    const itemsWithDetails = await Promise.all(
      data.map(async (item) => {
        let product_name = 'Unknown'
        let brand_name = null

        if (item.item_type === 'phone' && item.phone_id) {
          try {
            const { data: phone } = await supabase
              .from('phone')
              .select(`
                name,
                brand:brandid (
                  name
                )
              `)
              .eq('id', item.phone_id)
              .single()

            if (phone) {
              product_name = phone.name || 'Phone'
               brand_name = (phone as any)?.brand?.name || null
            }
          } catch (err) {
            console.warn(`Failed to load phone ${item.phone_id}`)
            product_name = 'Phone (unavailable)'
          }
        } else if (item.item_type === 'accessory' && item.accessory_id) {
          try {
            const { data: accessory } = await supabase
              .from('accessory')
              .select('name, brand:brandid(name)')
              .eq('id', item.accessory_id)
              .single()

            if (accessory) {
              product_name = accessory.name || 'Accessory'
              brand_name = (accessory as any)?.brand?.name || null

            }
          } catch (err) {
            console.warn(`Failed to load accessory ${item.accessory_id}`)
            product_name = 'Accessory (unavailable)'
          }
        }

        return {
          ...item,
          product_name,
          brand_name
        }
      })
    )

    return itemsWithDetails
  } catch (error: any) {
    logError(functionName, error, { saleId })
    throw new Error(`فشل في جلب عناصر الفاتورة: ${error?.message}`)
  }
}

/**
 * Get sale item by ID
 */
export async function getSaleItemById(itemId: string): Promise<SaleItem | null> {
  const functionName = 'getSaleItemById'

  try {
    if (!itemId) throw new Error('itemId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale_item')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logError(functionName, error, { itemId })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { itemId })
    throw new Error(`فشل في جلب العنصر: ${error?.message}`)
  }
}

/**
 * Get phone details for validation
 */
export async function getPhoneById(phoneId: string) {
  const functionName = 'getPhoneById'

  try {
    if (!phoneId) throw new Error('phoneId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('phone')
      .select('id, name, status, sellprice, imei')
      .eq('id', phoneId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logError(functionName, error, { phoneId })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { phoneId })
    throw new Error(`فشل في جلب الهاتف: ${error?.message}`)
  }
}

/**
 * Get accessory details for validation
 */
export async function getAccessoryById(accessoryId: string) {
  const functionName = 'getAccessoryById'

  try {
    if (!accessoryId) throw new Error('accessoryId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('accessory')
      .select('id, name, quantity, active, sellprice')
      .eq('id', accessoryId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logError(functionName, error, { accessoryId })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { accessoryId })
    throw new Error(`فشل في جلب الإكسسوار: ${error?.message}`)
  }
}

// ==================== WRITE OPERATIONS ====================

/**
 * Insert sale item (add product to invoice)
 * Triggers automatically:
 *    - tr_create_stock_movement_on_sale
 *    - tr_update_sale_total (if needed)
 *    - tr_audit_sale_item_changes
 */
export async function insertSaleItem(data: SaleItemInsert): Promise<SaleItem> {
  const functionName = 'insertSaleItem'

  try {
    if (!data.saleid) throw new Error('saleid مطلوب')
    if (!data.item_type) throw new Error('item_type مطلوب')

    const supabase = await createClientServer()

    const { data: item, error } = await supabase
      .from('sale_item')
      .insert([data])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { saleid: data.saleid, itemType: data.item_type })
      throw error
    }

    if (!item) {
      throw new Error('فشل في إرجاع العنصر المُضاف')
    }

    return item
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة المنتج: ${error?.message}`)
  }
}

/**
 * Update sale item (qty, price, discount, linetotal)
 * Triggers automatically:
 *    - tr_update_sale_total
 *    - tr_audit_sale_item_changes
 */
export async function updateSaleItem(
  itemId: string,
  updateData: {
    qty: number
    unitprice: number
    discount: number
    linetotal: number
  }
): Promise<SaleItem> {
  const functionName = 'updateSaleItem'

  try {
    if (!itemId) throw new Error('itemId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale_item')
      .update(updateData)
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('العنصر غير موجود')
      }
      logError(functionName, error, { itemId, updateData })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع العنصر المُحدّث')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { itemId, updateData })
    throw new Error(`فشل في تحديث العنصر: ${error?.message}`)
  }
}

/**
 * Delete sale item
 * Triggers automatically:
 *    - tr_revert_stock_on_sale_item_delete
 *    - tr_update_sale_total
 *    - tr_audit_sale_item_changes
 */
export async function deleteSaleItem(itemId: string): Promise<void> {
  const functionName = 'deleteSaleItem'

  try {
    if (!itemId) throw new Error('itemId مطلوب')

    const supabase = await createClientServer()

    const { error } = await supabase
      .from('sale_item')
      .delete()
      .eq('id', itemId)

    if (error) {
      logError(functionName, error, { itemId })
      throw error
    }
  } catch (error: any) {
    logError(functionName, error, { itemId })
    throw new Error(`فشل في حذف العنصر: ${error?.message}`)
  }
}