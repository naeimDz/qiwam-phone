// lib/supabase/db/views/allProducts.ts
// DB Layer - Read-only view queries for all products (phones + accessories)
// ✅ Single unified view for product catalog

import { createClientServer } from '@/lib/supabase'
import { AllProductsView } from '@/lib/types'

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

export type AllProductsFiltered = AllProductsView & {
  is_phone: boolean
  is_accessory: boolean
}

// ==================== READ OPERATIONS ====================

/**
 * Get all products (phones + accessories) for store
 * ✅ Single query using unified view
 */
export async function getAllProducts(
  storeid: string,
  limit: number = 100,
  offset: number = 0
): Promise<AllProductsView[]> {
  const functionName = 'getAllProducts'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب المنتجات: ${error?.message}`)
  }
}

/**
 * Get available products only (for POS quick sale)
 */
export async function getAvailableProducts(
  storeid: string,
  limit: number = 100,
  offset: number = 0
): Promise<AllProductsView[]> {
  const functionName = 'getAvailableProducts'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .gt('available_qty', 0)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب المنتجات المتاحة: ${error?.message}`)
  }
}

/**
 * Get products by type (phones only or accessories only)
 */
export async function getProductsByType(
  storeid: string,
  productType: 'phone' | 'accessory',
  limit: number = 100,
  offset: number = 0
): Promise<AllProductsView[]> {
  const functionName = 'getProductsByType'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!['phone', 'accessory'].includes(productType)) throw new Error('product_type غير صحيح')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .eq('product_type', productType)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, productType })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, productType })
    throw new Error(`فشل في جلب المنتجات: ${error?.message}`)
  }
}

/**
 * Search products by name or identifier (IMEI, barcode, SKU)
 */
export async function searchProducts(
  storeid: string,
  query: string,
  limit: number = 20
): Promise<AllProductsView[]> {
  const functionName = 'searchProducts'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!query || query.trim().length === 0) throw new Error('query مطلوبة')
    if (query.trim().length < 2) throw new Error('query يجب أن تكون أطول من حرفين')

    const supabase = await createClientServer()

    const searchQuery = `%${query.trim()}%`

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .or(
        `name.ilike.${searchQuery},` +
        `identifier.ilike.${searchQuery},` +
        `brand_name.ilike.${searchQuery}`
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
    throw new Error(`فشل في البحث عن المنتجات: ${error?.message}`)
  }
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(
  storeid: string,
  brandId: string,
  limit: number = 100,
  offset: number = 0
): Promise<AllProductsView[]> {
  const functionName = 'getProductsByBrand'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!brandId) throw new Error('brandId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .eq('brandid', brandId)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, brandId })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, brandId })
    throw new Error(`فشل في جلب المنتجات: ${error?.message}`)
  }
}

/**
 * Get products by price range
 */
export async function getProductsByPriceRange(
  storeid: string,
  minPrice: number,
  maxPrice: number,
  limit: number = 100,
  offset: number = 0
): Promise<AllProductsView[]> {
  const functionName = 'getProductsByPriceRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (minPrice < 0) throw new Error('minPrice لا يمكن أن يكون سالب')
    if (maxPrice < minPrice) throw new Error('maxPrice يجب أن يكون أكبر من minPrice')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('*')
      .eq('storeid', storeid)
      .gte('display_price', minPrice)
      .lte('display_price', maxPrice)
      .order('display_price', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, minPrice, maxPrice })
      throw error
    }

    if (!data) return []

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, minPrice, maxPrice })
    throw new Error(`فشل في جلب المنتجات: ${error?.message}`)
  }
}

/**
 * Get products count summary
 */
export async function getProductsCountSummary(storeid: string) {
  const functionName = 'getProductsCountSummary'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_all_products')
      .select('product_type')
      .eq('storeid', storeid)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      return {
        total_products: 0,
        total_phones: 0,
        total_accessories: 0,
        total_available: 0
      }
    }

    const summary = {
      total_products: data.length,
      total_phones: 0,
      total_accessories: 0,
      total_available: 0
    }

    data.forEach(p => {
      if (p.product_type === 'phone') {
        summary.total_phones++
      } else {
        summary.total_accessories++
      }
      
      if ((p as any).available_qty > 0) {
        summary.total_available++
      }
    })

    return summary
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في حساب ملخص المنتجات: ${error?.message}`)
  }
}