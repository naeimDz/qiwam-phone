// lib/db/stockMovements.ts
// DB Layer - Stock movement tracking (READ-ONLY + Manual Adjustments)
// ✅ Optimized with proper joins, no N+1 queries

import { createClientServer } from '@/lib/supabase'
import type { 
  StockMovement,
  StockMovementJoined, 
  StockMovementWithDetails,
  StockMovementStats 
} from '@/lib/types/index'

// ==================== Types ====================
interface ErrorLog {
  timestamp: string
  function: string
  error: {
    message?: string
    code?: string
    details?: unknown
  }
  context?: Record<string, unknown>
}

interface GetMovementsParams {
  storeid: string
  limit?: number
  offset?: number
  itemType?: 'phone' | 'accessory'
  productId?: string
  startDate?: Date
  endDate?: Date
  movementType?: StockMovement['movement_type']
}

// ==================== Utilities ====================
const logError = (functionName: string, error: unknown, context?: Record<string, unknown>): void => {
  const err = error as { message?: string; code?: string; details?: unknown }
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: err?.message,
      code: err?.code,
      details: err?.details
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
}

const validateStoreId = (storeid: string): void => {
  if (!storeid || storeid.trim() === '') {
    throw new Error('storeid مطلوب')
  }
}

const validateLimit = (limit: number): void => {
  if (limit < 1 || limit > 500) {
    throw new Error('limit يجب أن يكون بين 1 و 500')
  }
}

const validateDateRange = (startDate: Date, endDate: Date): void => {
  if (!startDate || !endDate) {
    throw new Error('تواريخ مطلوبة')
  }
  if (startDate > endDate) {
    throw new Error('تاريخ البداية يجب أن يكون قبل النهاية')
  }
}

// ==================== Core Query Builder ====================
/**
 * Build the base query with all joins
 * ✅ ONE query with all joins - no N+1 problem
 */
const getBaseQuery = async (): Promise<any> => {
  const supabase = await createClientServer()
  
  // Return the query builder, NOT the response
  return supabase.from('stock_movement').select(`
    id,
    storeid,
    item_type,
    phone_id,
    accessory_id,
    movement_type,
    source_table,
    source_id,
    qty,
    cost_per_unit,
    is_adjustment,
    notes,
    createdat,
    createdby,
    batch_id,
    source_reference_id,
    reference_number,
    adjustment_reason,
    reverse_of_movement_id,
    phone:phone_id(id, name),
    accessory:accessory_id(id, name),
    created_by_user:createdby(fullname)
  `) as any
}

/**
 * Transform joined data to StockMovementWithDetails
 * ✅ Clean mapping without array access issues
 */
const transformMovement = (m: StockMovementJoined): StockMovementWithDetails => {
  // Handle both single objects and arrays from Supabase joins
  const phone = Array.isArray(m.phone) ? m.phone[0] : m.phone
  const accessory = Array.isArray(m.accessory) ? m.accessory[0] : m.accessory
  const user = Array.isArray(m.created_by_user) ? m.created_by_user[0] : m.created_by_user

  return {
    ...m,
    product_name: m.item_type === 'phone'
      ? phone?.name || 'Phone (محذوف)'
      : accessory?.name || 'Accessory (محذوف)',
    created_by_name: user?.fullname || 'System'
  }
}

// ==================== READ Operations ====================

/**
 * Get all stock movements with product details
 * ✅ ONE QUERY with proper joins
 */
export async function getStockMovements(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<StockMovementWithDetails[]> {
  const fn = 'getStockMovements'
  
  try {
    validateStoreId(storeid)
    validateLimit(limit)

    console.log(`[${fn}] البدء: جلب حركات المخزون`, { storeid, limit, offset })

    const query = await getBaseQuery()
    const { data, error } = await query
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    if (!data) return []

    const movements = (data as StockMovementJoined[]).map(transformMovement)

    console.log(`[${fn}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error) {
    logError(fn, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب حركات المخزون: ${(error as Error)?.message}`)
  }
}

/**
 * Get movements for specific product
 * ✅ ONE QUERY with proper filtering
 */
export async function getMovementsByProduct(
  storeid: string,
  itemType: 'phone' | 'accessory',
  productId: string
): Promise<StockMovementWithDetails[]> {
  const fn = 'getMovementsByProduct'
  
  try {
    validateStoreId(storeid)
    if (!productId) throw new Error('productId مطلوب')
    if (!['phone', 'accessory'].includes(itemType)) {
      throw new Error('itemType غير صحيح')
    }

    console.log(`[${fn}] البدء: جلب حركات ${itemType} ${productId}`)

    const column = itemType === 'phone' ? 'phone_id' : 'accessory_id'
    
    const query = await getBaseQuery()
    const { data, error } = await query
      .eq('storeid', storeid)
      .eq('item_type', itemType)
      .eq(column, productId)
      .order('createdat', { ascending: false })

    if (error) throw error
    if (!data) return []

    const movements = (data as StockMovementJoined[]).map(transformMovement)

    console.log(`[${fn}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error) {
    logError(fn, error, { storeid, itemType, productId })
    throw new Error(`فشل في جلب حركات المنتج: ${(error as Error)?.message}`)
  }
}

/**
 * Get movements by date range
 * ✅ ONE QUERY with date filtering
 */
export async function getMovementsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<StockMovementWithDetails[]> {
  const fn = 'getMovementsByDateRange'
  
  try {
    validateStoreId(storeid)
    validateDateRange(startDate, endDate)

    console.log(`[${fn}] البدء: جلب حركات من ${startDate} إلى ${endDate}`)

    const query = await getBaseQuery()
    const { data, error } = await query
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .order('createdat', { ascending: false })

    if (error) throw error
    if (!data) return []

    const movements = (data as StockMovementJoined[]).map(transformMovement)

    console.log(`[${fn}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error) {
    logError(fn, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الحركات: ${(error as Error)?.message}`)
  }
}

/**
 * 🆕 Advanced filtered query
 * ✅ Flexible filtering with one query
 */
export async function getMovementsFiltered(
  params: GetMovementsParams
): Promise<StockMovementWithDetails[]> {
  const fn = 'getMovementsFiltered'
  
  try {
    validateStoreId(params.storeid)
    const limit = params.limit || 50
    const offset = params.offset || 0
    validateLimit(limit)

    console.log(`[${fn}] البدء:`, params)

    let query = await getBaseQuery()
    query = query.eq('storeid', params.storeid)

    // Apply filters
    if (params.itemType) {
      query = query.eq('item_type', params.itemType)
    }
    if (params.productId && params.itemType) {
      const column = params.itemType === 'phone' ? 'phone_id' : 'accessory_id'
      query = query.eq(column, params.productId)
    }
    if (params.movementType) {
      query = query.eq('movement_type', params.movementType)
    }
    if (params.startDate) {
      query = query.gte('createdat', params.startDate.toISOString())
    }
    if (params.endDate) {
      query = query.lte('createdat', params.endDate.toISOString())
    }

    const { data, error } = await query
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    if (!data) return []

    const movements = (data as StockMovementJoined[]).map(transformMovement)

    console.log(`[${fn}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error) {
    logError(fn, error)
    throw new Error(`فشل في جلب الحركات: ${(error as Error)?.message}`)
  }
}

/**
 * Get stock movement statistics
 * ✅ Efficient aggregation query
 */
export async function getStockMovementStats(
  storeid: string,
  days: number = 30
): Promise<StockMovementStats> {
  const fn = 'getStockMovementStats'
  
  try {
    validateStoreId(storeid)
    if (days < 1 || days > 365) {
      throw new Error('days يجب أن يكون بين 1 و 365')
    }

    console.log(`[${fn}] البدء: حساب إحصائيات آخر ${days} يوم`)

    const supabase = await createClientServer()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('stock_movement')
      .select('movement_type, qty, createdat')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        total_in: 0,
        total_out: 0,
        total_adjustments: 0,
        total_returns: 0,
        net_movement: 0,
        days_with_activity: 0
      }
    }

    // Calculate stats
    const stats = {
      total_in: 0,
      total_out: 0,
      total_adjustments: 0,
      total_returns: 0,
      days_with_activity: new Set<string>()
    }
    
    data.forEach(m => {
      const quantity = m.qty || 0
      const date = new Date(m.createdat).toISOString().split('T')[0]
      stats.days_with_activity.add(date)
      
      switch (m.movement_type) {
        case 'in':
          stats.total_in += quantity
          break
        case 'out':
          stats.total_out += quantity
          break
        case 'adjustment':
          stats.total_adjustments += quantity
          break
        case 'return':
          stats.total_returns += quantity
          break
      }
    })
    
    const net_movement = stats.total_in + stats.total_returns - stats.total_out + stats.total_adjustments

    console.log(`[${fn}] ✅ تم`)
    return {
      total_in: stats.total_in,
      total_out: stats.total_out,
      total_adjustments: stats.total_adjustments,
      total_returns: stats.total_returns,
      net_movement,
      days_with_activity: stats.days_with_activity.size
    }

  } catch (error) {
    logError(fn, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${(error as Error)?.message}`)
  }
}

/**
 * 🆕 Get movements grouped by product
 * ✅ Useful for inventory reports
 */
export async function getMovementsByProducts(
  storeid: string,
  days: number = 30
): Promise<Map<string, StockMovementWithDetails[]>> {
  const fn = 'getMovementsByProducts'
  
  try {
    validateStoreId(storeid)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const movements = await getMovementsByDateRange(storeid, startDate, new Date())
    
    // Group by product
    const grouped = new Map<string, StockMovementWithDetails[]>()
    
    movements.forEach(m => {
      const key = m.item_type === 'phone' ? m.phone_id : m.accessory_id
      if (!key) return
      
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(m)
    })

    console.log(`[${fn}] ✅ تم: ${grouped.size} منتج`)
    return grouped

  } catch (error) {
    logError(fn, error, { storeid, days })
    throw new Error(`فشل في تجميع الحركات: ${(error as Error)?.message}`)
  }
}

// ==================== WRITE Operations (Adjustments Only) ====================

/**
 * ⚠️ Manual stock adjustment
 * Most movements are created by TRIGGERS
 */
export async function insertStockMovementAdjustment(
  storeid: string,
  itemType: 'phone' | 'accessory',
  productId: string,
  quantity: number,
  notes: string,
  createdById: string
): Promise<StockMovement> {
  const fn = 'insertStockMovementAdjustment'
  
  try {
    validateStoreId(storeid)
    if (!productId) throw new Error('productId مطلوب')
    if (quantity === 0) throw new Error('الكمية لا يمكن أن تكون 0')
    if (!notes?.trim()) throw new Error('يجب شرح التعديل')
    if (!['phone', 'accessory'].includes(itemType)) {
      throw new Error('itemType غير صحيح')
    }

    console.log(`[${fn}] البدء: تعديل يدوي`, { itemType, productId, quantity })

    const supabase = await createClientServer()
    const column = itemType === 'phone' ? 'phone_id' : 'accessory_id'
    
    const { data, error } = await supabase
      .from('stock_movement')
      .insert({
        storeid,
        item_type: itemType,
        [column]: productId,
        movement_type: 'adjustment' as const,
        qty: quantity,
        source_table: 'adjustment',
        source_id: null,
        notes: notes.trim(),
        createdby: createdById,
        is_adjustment: true,
        adjustment_reason: notes.trim()
      })
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('فشل في إنشاء التعديل')

    console.log(`[${fn}] ✅ تم`)
    return data as StockMovement

  } catch (error) {
    logError(fn, error, { storeid, itemType, productId, quantity })
    throw new Error(`فشل في إضافة تعديل: ${(error as Error)?.message}`)
  }
}

/**
 * 🆕 Batch insert adjustments
 * ✅ Insert multiple adjustments in one transaction
 */
export async function insertBatchAdjustments(
  storeid: string,
  adjustments: Array<{
    itemType: 'phone' | 'accessory'
    productId: string
    quantity: number
    notes: string
  }>,
  createdById: string,
  batchId?: string
): Promise<StockMovement[]> {
  const fn = 'insertBatchAdjustments'
  
  try {
    validateStoreId(storeid)
    if (!adjustments.length) throw new Error('لا توجد تعديلات')
    if (adjustments.length > 100) throw new Error('الحد الأقصى 100 تعديل')

    console.log(`[${fn}] البدء: ${adjustments.length} تعديل`)

    const batch = batchId || crypto.randomUUID()
    const supabase = await createClientServer()
    
    const records = adjustments.map(adj => {
      const column = adj.itemType === 'phone' ? 'phone_id' : 'accessory_id'
      return {
        storeid,
        item_type: adj.itemType,
        [column]: adj.productId,
        movement_type: 'adjustment' as const,
        qty: adj.quantity,
        source_table: 'adjustment',
        source_id: null,
        notes: adj.notes.trim(),
        createdby: createdById,
        is_adjustment: true,
        adjustment_reason: adj.notes.trim(),
        batch_id: batch
      }
    })

    const { data, error } = await supabase
      .from('stock_movement')
      .insert(records)
      .select('*')

    if (error) throw error
    if (!data) throw new Error('فشل في إنشاء التعديلات')

    console.log(`[${fn}] ✅ تم: ${data.length} تعديل`)
    return data as StockMovement[]

  } catch (error) {
    logError(fn, error, { storeid, count: adjustments.length })
    throw new Error(`فشل في إضافة التعديلات: ${(error as Error)?.message}`)
  }
}