// lib/actions/views.actions.ts
// Actions Layer - Views for catalogs, POS, dashboards
// READ-ONLY - Queries optimized Supabase views

'use server'

import * as allProductsDb from '@/lib/supabase/db/view/allProducts'
import * as catalogProductsDb from '@/lib/supabase/db/view/CatalogProducts'
import * as quickPosDb from '@/lib/supabase/db/view/quickPosItems'
import * as authDb from '@/lib/supabase/db/auth'
import { AllProductsView, PurchaseSearchResult, QuickPosItem } from '@/lib/types'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ==================== ALL PRODUCTS VIEW ACTIONS ====================

/**
 * Get all products (phones + accessories) for store catalog
 */
export async function getAllProductsAction(
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (limit < 1 || limit > 500) {
      return { success: false, error: 'الحد يجب أن يكون بين 1 و 500' }
    }

    const products = await allProductsDb.getAllProducts(user.storeid, limit, offset)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getAllProductsAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات' }
  }
}

/**
 * Get available products only (for inventory checking)
 */
export async function getAvailableProductsAction(
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const products = await allProductsDb.getAvailableProducts(user.storeid, limit, offset)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getAvailableProductsAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات المتاحة' }
  }
}

/**
 * Get products by type (phones or accessories)
 */
export async function getProductsByTypeAction(
  productType: 'phone' | 'accessory',
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!['phone', 'accessory'].includes(productType)) {
      return { success: false, error: 'نوع المنتج غير صحيح' }
    }

    const products = await allProductsDb.getProductsByType(
      user.storeid,
      productType,
      limit,
      offset
    )
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getProductsByTypeAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات' }
  }
}

/**
 * Search products by name, IMEI, barcode, SKU, brand
 */
export async function searchProductsAction(
  query: string,
  limit: number = 20
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!query || query.trim().length === 0) {
      return { success: false, error: 'أدخل كلمة البحث' }
    }

    if (query.trim().length < 2) {
      return { success: false, error: 'كلمة البحث قصيرة جداً' }
    }

    if (limit < 1 || limit > 100) {
      return { success: false, error: 'الحد غير صحيح' }
    }

    const products = await allProductsDb.searchProducts(user.storeid, query, limit)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('searchProductsAction error:', error)
    return { success: false, error: 'فشل البحث' }
  }
}

/**
 * Get products by brand
 */
export async function getProductsByBrandAction(
  brandId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!brandId) {
      return { success: false, error: 'معرف العلامة التجارية مطلوب' }
    }

    const products = await allProductsDb.getProductsByBrand(user.storeid, brandId, limit, offset)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getProductsByBrandAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات' }
  }
}

/**
 * Get products by price range
 */
export async function getProductsByPriceRangeAction(
  minPrice: number,
  maxPrice: number,
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<AllProductsView[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (minPrice < 0 || maxPrice < 0) {
      return { success: false, error: 'الأسعار لا يمكن أن تكون سالبة' }
    }

    if (maxPrice < minPrice) {
      return { success: false, error: 'السعر الأقصى يجب أن يكون أكبر من السعر الأدنى' }
    }

    const products = await allProductsDb.getProductsByPriceRange(
      user.storeid,
      minPrice,
      maxPrice,
      limit,
      offset
    )
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getProductsByPriceRangeAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات' }
  }
}

/**
 * Get products count summary
 */
export async function getProductsCountSummaryAction(): Promise<
  ActionResult<{
    total_products: number
    total_phones: number
    total_accessories: number
    total_available: number
  }>
> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const summary = await allProductsDb.getProductsCountSummary(user.storeid)
    return { success: true, data: summary }
  } catch (error: any) {
    console.error('getProductsCountSummaryAction error:', error)
    return { success: false, error: 'فشل حساب الملخص' }
  }
}



// ==================== Catalog Products View Actions ====================

/**
 * Get catalog products (phones + accessories) for store
 */
export async function getCatalogProductsAction(
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<PurchaseSearchResult[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (limit < 1 || limit > 500) {
      return { success: false, error: 'الحد يجب أن يكون بين 1 و 500' }
    }

    const products = await catalogProductsDb.getCatalogProducts(user.storeid, limit, offset)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('getAllProductsAction error:', error)
    return { success: false, error: 'فشل تحميل المنتجات' }
  }
}



/**
 * Search Catalog Product by name, IMEI, barcode, SKU, brand
 */
export async function searchCatalogProductAction(
  query: string,
  limit: number = 20
): Promise<ActionResult<PurchaseSearchResult[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!query || query.trim().length === 0) {
      return { success: false, error: 'أدخل كلمة البحث' }
    }

    if (query.trim().length < 2) {
      return { success: false, error: 'كلمة البحث قصيرة جداً' }
    }

    if (limit < 1 || limit > 100) {
      return { success: false, error: 'الحد غير صحيح' }
    }

    const products = await catalogProductsDb.searchCatalogProducts(user.storeid, query, limit)
    return { success: true, data: products }
  } catch (error: any) {
    console.error('searchProductsAction error:', error)
    return { success: false, error: 'فشل البحث' }
  }
}








// ==================== QUICK POS ITEMS VIEW ACTIONS ====================

/**
 * Get all quick POS items (for fast checkout)
 */
export async function getQuickPosItemsAction(
  limit: number = 100,
  offset: number = 0
): Promise<ActionResult<QuickPosItem[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const items = await quickPosDb.getQuickPosItems(user.storeid, limit, offset)
    return { success: true, data: items }
  } catch (error: any) {
    console.error('getQuickPosItemsAction error:', error)
    return { success: false, error: 'فشل تحميل عناصر POS' }
  }
}

/**
 * Get POS items by category
 */
export async function getQuickPosItemsByCategoryAction(
  categoryName: string,
  limit: number = 50
): Promise<ActionResult<QuickPosItem[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!categoryName) {
      return { success: false, error: 'اسم الفئة مطلوب' }
    }

    const items = await quickPosDb.getQuickPosItemsByCategory(user.storeid, categoryName, limit)
    return { success: true, data: items }
  } catch (error: any) {
    console.error('getQuickPosItemsByCategoryAction error:', error)
    return { success: false, error: 'فشل تحميل العناصر' }
  }
}

/**
 * Get low stock items alert
 */
export async function getLowStockPosItemsAction(
  limit: number = 50
): Promise<ActionResult<QuickPosItem[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const items = await quickPosDb.getLowStockPosItems(user.storeid, limit)
    return { success: true, data: items }
  } catch (error: any) {
    console.error('getLowStockPosItemsAction error:', error)
    return { success: false, error: 'فشل تحميل العناصر المنخفضة' }
  }
}

/**
 * Search POS items by name, barcode, or SKU
 */
export async function searchQuickPosItemsAction(
  query: string,
  limit: number = 20
): Promise<ActionResult<QuickPosItem[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!query || query.trim().length === 0) {
      return { success: false, error: 'أدخل كلمة البحث' }
    }

    const items = await quickPosDb.searchQuickPosItems(user.storeid, query, limit)
    return { success: true, data: items }
  } catch (error: any) {
    console.error('searchQuickPosItemsAction error:', error)
    return { success: false, error: 'فشل البحث' }
  }
}

/**
 * Get POS item by barcode (for scanner)
 */
export async function getPosItemByBarcodeAction(barcode: string): Promise<ActionResult<QuickPosItem>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!barcode) {
      return { success: false, error: 'الباركود مطلوب' }
    }

    const item = await quickPosDb.getPosItemByBarcode(user.storeid, barcode)
    if (!item) {
      return { success: false, error: 'العنصر غير موجود' }
    }

    return { success: true, data: item }
  } catch (error: any) {
    console.error('getPosItemByBarcodeAction error:', error)
    return { success: false, error: 'فشل جلب العنصر' }
  }
}

/**
 * Get POS item by SKU
 */
export async function getPosItemBySkuAction(sku: string): Promise<ActionResult<QuickPosItem>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!sku) {
      return { success: false, error: 'SKU مطلوب' }
    }

    const item = await quickPosDb.getPosItemBySku(user.storeid, sku)
    if (!item) {
      return { success: false, error: 'العنصر غير موجود' }
    }

    return { success: true, data: item }
  } catch (error: any) {
    console.error('getPosItemBySkuAction error:', error)
    return { success: false, error: 'فشل جلب العنصر' }
  }
}

/**
 * Get all POS categories
 */
export async function getPosCategoriesAction(): Promise<ActionResult<string[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const categories = await quickPosDb.getPosCategories(user.storeid)
    return { success: true, data: categories }
  } catch (error: any) {
    console.error('getPosCategoriesAction error:', error)
    return { success: false, error: 'فشل تحميل الفئات' }
  }
}

/**
 * Get POS inventory summary
 */
export async function getPosSummaryAction(): Promise<
  ActionResult<{
    total_items: number
    total_quantity: number
    low_stock_count: number
    avg_price: number
    total_inventory_value: number
  }>
> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const summary = await quickPosDb.getPosSummary(user.storeid)
    return { success: true, data: summary }
  } catch (error: any) {
    console.error('getPosSummaryAction error:', error)
    return { success: false, error: 'فشل حساب الملخص' }
  }
}