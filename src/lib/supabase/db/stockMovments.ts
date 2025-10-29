// lib/supabase/db/stockMovements.ts
// DB Layer - Stock movement queries ONLY
// NO BUSINESS LOGIC - Read-only operations
// âš ï¸ Movements are created automatically by triggers

import { createClientServer } from '@/lib/supabase'
import {
  StockMovement,
  StockMovementWithDetails,
  StockMovementStats
} from '@/lib/types'

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

// ==================== HELPERS ====================

function getEmptyMovementStats(): StockMovementStats {
  return {
    total_in: 0,
    total_out: 0,
    total_adjustments: 0,
    total_returns: 0,
    net_movement: 0
  }
}

// ==================== STOCK MOVEMENT QUERIES ====================

/**
 * Get all stock movements for store
 * âœ… Read-only - movements created by triggers
 */
export async function getStockMovements(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getStockMovements'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب حركات المخزون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movements for specific product
 */
export async function getMovementsByProduct(
  storeid: string,
  itemType: 'phone' | 'accessory',
  productId: string
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsByProduct'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!itemType) throw new Error('itemType مطلوب')
    if (!productId) throw new Error('productId مطلوب')

    const supabase = await createClientServer()

    const idColumn = itemType === 'phone' ? 'phone_id' : 'accessory_id'

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .eq('item_type', itemType)
      .eq(idColumn, productId)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, itemType, productId })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, itemType, productId })
    throw new Error(`فشل في جلب حركات المنتج: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movements by date range
 */
export async function getMovementsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الحركات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movements with advanced filters
 */
export async function getMovementsFiltered(
  storeid: string,
  filters: {
    movementType?: 'in' | 'out' | 'adjustment' | 'return'
    itemType?: 'phone' | 'accessory'
    isAdjustment?: boolean
    startDate?: Date
    endDate?: Date
  },
  limit: number = 50,
  offset: number = 0
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsFiltered'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    let query = supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)

    // Apply filters
    if (filters.movementType) {
      query = query.eq('movement_type', filters.movementType)
    }

    if (filters.itemType) {
      query = query.eq('item_type', filters.itemType)
    }

    if (filters.isAdjustment !== undefined) {
      query = query.eq('is_adjustment', filters.isAdjustment)
    }

    if (filters.startDate) {
      query = query.gte('createdat', filters.startDate.toISOString())
    }

    if (filters.endDate) {
      query = query.lte('createdat', filters.endDate.toISOString())
    }

    const { data, error } = await query
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, filters, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, filters, limit, offset })
    throw new Error(`فشل في تحميل الحركات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movement by ID
 */
export async function getMovementById(
  movementId: string
): Promise<StockMovementWithDetails | null> {
  const functionName = 'getMovementById'

  try {
    if (!movementId) throw new Error('movementId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('id', movementId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { movementId })
      throw error
    }

    if (!data) return null

    return {
      ...data,
      product_name: data.phone?.[0]?.name || data.accessory?.[0]?.name || 'Unknown',
      created_by_name: data.created_by_user?.[0]?.fullname || 'System'
    }
  } catch (error: any) {
    logError(functionName, error, { movementId })
    throw new Error(`فشل في جلب الحركة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movements by batch ID
 */
export async function getMovementsByBatch(
  storeid: string,
  batchId: string
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsByBatch'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!batchId) throw new Error('batchId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .eq('batch_id', batchId)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, batchId })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, batchId })
    throw new Error(`فشل في جلب حركات الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movements by source
 */
export async function getMovementsBySource(
  storeid: string,
  sourceTable: string,
  sourceId: string
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsBySource'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!sourceTable) throw new Error('sourceTable مطلوب')
    if (!sourceId) throw new Error('sourceId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, sourceTable, sourceId })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, sourceTable, sourceId })
    throw new Error(`فشل في جلب حركات المصدر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== ANALYTICS & REPORTING ====================

/**
 * Get movement summary/stats by date range
 */
export async function getMovementsBySummary(
  storeid: string,
  days: number = 30
): Promise<StockMovementStats> {
  const functionName = 'getMovementsBySummary'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('stock_movement')
      .select('movement_type, qty, is_adjustment')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      return getEmptyMovementStats()
    }

    // Calculate stats
    const stats: StockMovementStats = {
      total_in: 0,
      total_out: 0,
      total_adjustments: 0,
      total_returns: 0,
      net_movement: 0
    }

    data.forEach(movement => {
      const qty = movement.qty || 0

      if (movement.movement_type === 'in') {
        stats.total_in += qty
      } else if (movement.movement_type === 'out') {
        stats.total_out += qty
      } else if (movement.movement_type === 'return') {
        stats.total_returns += qty
      }

      if (movement.is_adjustment) {
        stats.total_adjustments += qty
      }
    })

    stats.net_movement = stats.total_in - stats.total_out + stats.total_returns

    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الملخص: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get movement count by type
 */
export async function getMovementCountByType(
  storeid: string,
  days: number = 30
): Promise<{
  in: number
  out: number
  adjustment: number
  return: number
}> {
  const functionName = 'getMovementCountByType'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('stock_movement')
      .select('movement_type')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    const counts = {
      in: 0,
      out: 0,
      adjustment: 0,
      return: 0
    }

    if (!data || data.length === 0) {
      return counts
    }

    data.forEach(movement => {
      if (movement.movement_type === 'in') counts.in++
      else if (movement.movement_type === 'out') counts.out++
      else if (movement.movement_type === 'adjustment') counts.adjustment++
      else if (movement.movement_type === 'return') counts.return++
    })

    return counts
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب العدد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get recent movements (last N)
 */
export async function getRecentMovements(
  storeid: string,
  limit: number = 10
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getRecentMovements'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by_user:createdby(fullname)
      `)
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, limit })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(movement => ({
      ...movement,
      product_name: movement.phone?.[0]?.name || movement.accessory?.[0]?.name || 'Unknown',
      created_by_name: movement.created_by_user?.[0]?.fullname || 'System'
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, limit })
    throw new Error(`فشل في جلب الحركات الأخيرة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * âš ï¸ IMPORTANT: DO NOT CREATE MANUAL INSERT FUNCTIONS
 * 
 * Stock movements are created automatically by triggers:
 * - tr_create_stock_movement_on_sale
 * - tr_update_phone_status_on_sale
 * - tr_create_stock_movement_on_purchase
 * - tr_revert_stock_on_sale_item_delete
 * - tr_revert_phone_status_on_return
 * 
 * This DB layer is READ-ONLY for reporting and analytics
 */