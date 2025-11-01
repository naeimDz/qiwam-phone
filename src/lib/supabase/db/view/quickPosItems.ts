// lib/supabase/db/views/quickPosItems.ts
// DB Layer - Quick POS items view (optimized for fast checkout)
// ✅ Accessories only with stock alerts

import { createClientServer } from '@/lib/supabase'

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
}

// ==================== TYPES ====================

export type QuickPosItem = {
  id: string
  storeid: string
  name: string
  category_name: string | null
  barcode: string | null
  sku: string | null
  quantity: number
  sellprice: number
  minqty: number
  stock_status: 'low_stock' | 'ok'
}

export type QuickPosItemWithCalculations = QuickPosItem & {
  stock_percentage: number // quantity / minqty * 100
  is_low_stock: boolean
}

// ==================== READ OPERATIONS ====================

/**
 * Get all quick POS items (accessories with stock info)
 * ✅ Optimized for fast POS checkout
 */
export async function getQuickPosItems(
  storeid: string,
  limit: number = 100,
  offset: number = 0
): Promise<QuickPosItem[]> {
  const functionName = 'getQuickPosItems'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .order('category_name, name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب عناصر POS: ${error?.message}`)
  }
}

/**
 * Get quick POS items by category
 */
export async function getQuickPosItemsByCategory(
  storeid: string,
  categoryName: string,
  limit: number = 50
): Promise<QuickPosItem[]> {
  const functionName = 'getQuickPosItemsByCategory'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!categoryName) throw new Error('categoryName مطلوبة')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .eq('category_name', categoryName)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, categoryName })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, categoryName })
    throw new Error(`فشل في جلب العناصر: ${error?.message}`)
  }
}

/**
 * Get low stock items only
 */
export async function getLowStockPosItems(
  storeid: string,
  limit: number = 50
): Promise<QuickPosItem[]> {
  const functionName = 'getLowStockPosItems'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .eq('stock_status', 'low_stock')
      .order('category_name, name', { ascending: true })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب العناصر المنخفضة: ${error?.message}`)
  }
}

/**
 * Search POS items by name, barcode, or SKU
 */
export async function searchQuickPosItems(
  storeid: string,
  query: string,
  limit: number = 20
): Promise<QuickPosItem[]> {
  const functionName = 'searchQuickPosItems'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!query || query.trim().length === 0) throw new Error('query مطلوبة')
    if (query.trim().length < 2) throw new Error('query يجب أن تكون أطول من حرفين')

    const supabase = await createClientServer()

    const searchQuery = `%${query.trim()}%`

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .or(
        `name.ilike.${searchQuery},` +
        `barcode.ilike.${searchQuery},` +
        `sku.ilike.${searchQuery}`
      )
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, query })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, query })
    throw new Error(`فشل في البحث: ${error?.message}`)
  }
}

/**
 * Get POS item by barcode (for scanner input)
 */
export async function getPosItemByBarcode(
  storeid: string,
  barcode: string
): Promise<QuickPosItem | null> {
  const functionName = 'getPosItemByBarcode'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!barcode) throw new Error('barcode مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .eq('barcode', barcode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { storeid, barcode })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { storeid, barcode })
    throw new Error(`فشل في جلب العنصر: ${error?.message}`)
  }
}

/**
 * Get POS item by SKU
 */
export async function getPosItemBySku(
  storeid: string,
  sku: string
): Promise<QuickPosItem | null> {
  const functionName = 'getPosItemBySku'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!sku) throw new Error('sku مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)
      .eq('sku', sku)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { storeid, sku })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { storeid, sku })
    throw new Error(`فشل في جلب العنصر: ${error?.message}`)
  }
}

/**
 * Get all categories used in POS items
 */
export async function getPosCategories(storeid: string): Promise<string[]> {
  const functionName = 'getPosCategories'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('category_name')
      .eq('storeid', storeid)
      .order('category_name', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    // Extract unique category names
    const categories = [...new Set(data.map(item => item.category_name))].filter(
      cat => cat !== null
    ) as string[]

    return categories
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الفئات: ${error?.message}`)
  }
}

/**
 * Get POS summary stats
 */
export async function getPosSummary(storeid: string) {
  const functionName = 'getPosSummary'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_quick_pos_items')
      .select('*')
      .eq('storeid', storeid)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      return {
        total_items: 0,
        total_quantity: 0,
        low_stock_count: 0,
        avg_price: 0,
        total_inventory_value: 0
      }
    }

    let totalQty = 0
    let lowStockCount = 0
    let totalValue = 0

    data.forEach(item => {
      totalQty += item.quantity || 0
      if (item.stock_status === 'low_stock') {
        lowStockCount++
      }
      totalValue += (item.quantity || 0) * (item.sellprice || 0)
    })

    const avgPrice = data.length > 0 ? totalValue / totalQty : 0

    return {
      total_items: data.length,
      total_quantity: totalQty,
      low_stock_count: lowStockCount,
      avg_price: Math.round(avgPrice * 100) / 100,
      total_inventory_value: Math.round(totalValue * 100) / 100
    }
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في حساب الملخص: ${error?.message}`)
  }
}