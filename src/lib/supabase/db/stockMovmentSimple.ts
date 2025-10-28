// lib/db/stockMovements.ts
// DB Layer - Stock movement tracking (READ-ONLY with proper structure)

import { createClientServer } from '@/lib/supabase'
import { StockMovementJoined, StockMovementWithDetails } from '@/lib/types/index'

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
      details: error?.details
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
}

/**
 * Get all stock movements with product details (ONE QUERY!)
 * ✅ استخدم join بدلاً من N+1 queries
 */
export async function getStockMovements(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getStockMovements'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: جلب حركات المخزون`, { storeid, limit, offset })

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('stock_movement')
      .select(`
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
      `)
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    if (!data) return []

    const movements: StockMovementWithDetails[] = (data as StockMovementJoined[]).map(m => ({
      ...m,
      product_name:
        m.item_type === 'phone'
          ? m.phone?.[0]?.name || 'Phone (محذوف)'
          : m.accessory?.[0]?.name || 'Accessory (محذوف)',
      created_by_name: m.created_by_user?.[0]?.fullname || 'System',
    }))

    console.log(`[${functionName}] ✅ تم: ${movements.length} حركة`)
    return movements
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب حركات المخزون: ${error?.message}`)
  }
}

/**
 * Get movements for specific product (ONE QUERY!)
 */
export async function getMovementsByProduct(
  storeid: string,
  itemType: 'phone' | 'accessory',
  productId: string
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsByProduct'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!productId) throw new Error('productId مطلوب')
    if (!['phone', 'accessory'].includes(itemType)) throw new Error('itemType غير صحيح')

    console.log(`[${functionName}] البدء: جلب حركات ${itemType} ${productId}`)

    const supabase = await createClientServer()
    
    // ✅ استخدم الـ column الصحيح (phone_id أو accessory_id)
    const column = itemType === 'phone' ? 'phone_id' : 'accessory_id'
    
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
      .eq(column, productId)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, itemType, productId })
      throw error
    }

    if (!data) return []

    const movements = data.map(m => ({
      ...m,
      product_name: itemType === 'phone' 
        ? m.phone?.name || 'Phone (محذوف)'
        : m.accessory?.name || 'Accessory (محذوف)',
      created_by_name: m.created_by_user?.fullname || 'System'
    }))

    console.log(`[${functionName}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error: any) {
    logError(functionName, error, { storeid, itemType, productId })
    throw new Error(`فشل في جلب حركات المنتج: ${error?.message}`)
  }
}

/**
 * Get movements by date range (ONE QUERY!)
 */
export async function getMovementsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<StockMovementWithDetails[]> {
  const functionName = 'getMovementsByDateRange'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('تواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية يجب أن يكون قبل النهاية')

    console.log(`[${functionName}] البدء: جلب حركات من ${startDate} إلى ${endDate}`)

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

    if (!data) return []

    const movements = data.map(m => ({
      ...m,
      product_name: m.item_type === 'phone' 
        ? m.phone?.name || 'Phone (محذوف)'
        : m.accessory?.name || 'Accessory (محذوف)',
      created_by_name: m.created_by_user?.fullname || 'System'
    }))

    console.log(`[${functionName}] ✅ تم: ${movements.length} حركة`)
    return movements

  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الحركات: ${error?.message}`)
  }
}

/**
 * Get stock movement stats (للـ analytics و dashboards)
 */
export async function getStockMovementStats(
  storeid: string,
  days: number = 30
) {
  const functionName = 'getStockMovementStats'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

    console.log(`[${functionName}] البدء: حساب إحصائيات آخر ${days} يوم`)

    const supabase = await createClientServer()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('stock_movement')
      .select('movement_type, qty')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

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

    const stats = {
      total_in: 0,
      total_out: 0,
      total_adjustments: 0,
      total_returns: 0,
      net_movement: 0,
      days_with_activity: new Set<string>()
    }
    
    data.forEach(m => {
      const quantity = m.qty || 0
      
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
    
    stats.net_movement = stats.total_in + stats.total_returns - stats.total_out + stats.total_adjustments
    
    console.log(`[${functionName}] ✅ تم`)
    return {
      ...stats,
      days_with_activity: stats.days_with_activity.size
    }

  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message}`)
  }
}

/**
 * ⚠️ DO NOT INSERT MANUALLY in most cases
 * Most stock movements are created automatically by TRIGGERS
 * This is only for manual adjustments
 */
export async function insertStockMovementAdjustment(
  storeid: string,
  itemType: 'phone' | 'accessory',
  productId: string,
  quantity: number,
  notes: string,
  createdById: string
): Promise<any> {
  const functionName = 'insertStockMovementAdjustment'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!productId) throw new Error('productId مطلوب')
    if (quantity === 0) throw new Error('الكمية لا يمكن أن تكون 0')
    if (!notes) throw new Error('يجب شرح التعديل')

    console.log(`[${functionName}] البدء: تعديل يدوي`, { itemType, productId, quantity })

    const supabase = await createClientServer()
    
    const column = itemType === 'phone' ? 'phone_id' : 'accessory_id'
    
    const { data, error } = await supabase
      .from('stock_movement')
      .insert([{
        storeid,
        item_type: itemType,
        [column]: productId,
        movement_type: 'adjustment',
        qty: quantity,
        source_table: 'adjustment',
        source_id: null,
        notes,
        createdby: createdById,
        is_adjustment: true,
        adjustment_reason: notes
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid, itemType, productId })
      throw error
    }

    console.log(`[${functionName}] ✅ تم`)
    return data

  } catch (error: any) {
    logError(functionName, error, { storeid, itemType, productId })
    throw new Error(`فشل في إضافة تعديل: ${error?.message}`)
  }
}