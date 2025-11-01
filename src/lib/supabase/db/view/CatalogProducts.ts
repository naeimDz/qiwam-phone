import { PurchaseSearchResult } from "@/lib/types"
import { createClientServer } from "../../supabaseServer"




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



/**
 * Get all products (phones + accessories) for store
 * ✅ Single query using unified view
 */
export async function getCatalogProducts(
  storeid: string,
  limit: number = 100,
  offset: number = 0
): Promise<PurchaseSearchResult[]> {
  const functionName = 'getAllProducts'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('v_purchase_products')
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
 * Search products by name or identifier (IMEI, barcode, SKU)
 */
export async function searchCatalogProducts(
  storeid: string,
  query: string,
  limit: number = 20
): Promise<PurchaseSearchResult[]> {
  const functionName = 'searchProducts'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!query || query.trim().length === 0) throw new Error('query مطلوبة')
    if (query.trim().length < 2) throw new Error('query يجب أن تكون أطول من حرفين')

    const supabase = await createClientServer()

    const searchQuery = `%${query.trim()}%`

    const { data, error } = await supabase
      .from('v_purchase_products')
      .select('*')
      .eq('storeid', storeid)
      .or(
        `name.ilike.${searchQuery},` +
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