// lib/db/stockMovements.ts
// DB Layer - Stock movement tracking (mostly READ-ONLY)

import { createClientServer } from '@/lib/supabase'
import { StockMovement, StockMovementWithDetails } from '@/lib/types'

/**
 * Get all stock movements for a store (paginated)
 */
export async function getStockMovements(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<StockMovementWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('stock_movement')
    .select(`
      *,
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .order('createdat', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  // Get product names separately (since they're in different tables)
  const movements = await Promise.all(
    data.map(async (m) => {
      let product_name = 'Unknown'
      
      if (m.product_type === 'phone') {
        const { data: phone } = await supabase
          .from('phone')
          .select('name')
          .eq('id', m.product_id)
          .single()
        product_name = phone?.name || 'Phone (deleted)'
      } else if (m.product_type === 'accessory') {
        const { data: accessory } = await supabase
          .from('accessory')
          .select('name')
          .eq('id', m.product_id)
          .single()
        product_name = accessory?.name || 'Accessory (deleted)'
      }
      
      return {
        ...m,
        product_name,
        created_by_name: m.created_by?.fullname || 'System'
      }
    })
  )
  
  return movements
}

/**
 * Get movements for a specific product
 */
export async function getMovementsByProduct(
  storeid: string,
  productType: 'phone' | 'accessory',
  productId: string
): Promise<StockMovementWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('stock_movement')
    .select(`
      *,
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .eq('product_type', productType)
    .eq('product_id', productId)
    .order('createdat', { ascending: false })

  if (error) throw error
  
  // Get product name
  let product_name = 'Unknown'
  if (productType === 'phone') {
    const { data: phone } = await supabase
      .from('phone')
      .select('name')
      .eq('id', productId)
      .single()
    product_name = phone?.name || 'Phone (deleted)'
  } else {
    const { data: accessory } = await supabase
      .from('accessory')
      .select('name')
      .eq('id', productId)
      .single()
    product_name = accessory?.name || 'Accessory (deleted)'
  }
  
  return data.map(m => ({
    ...m,
    product_name,
    created_by_name: m.created_by?.fullname || 'System'
  }))
}

/**
 * Get movements by date range
 */
export async function getMovementsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<StockMovementWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('stock_movement')
    .select(`
      *,
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .gte('createdat', startDate.toISOString())
    .lte('createdat', endDate.toISOString())
    .order('createdat', { ascending: false })

  if (error) throw error
  
  // Get product names
  const movements = await Promise.all(
    data.map(async (m) => {
      let product_name = 'Unknown'
      
      if (m.product_type === 'phone') {
        const { data: phone } = await supabase
          .from('phone')
          .select('name')
          .eq('id', m.product_id)
          .single()
        product_name = phone?.name || 'Phone (deleted)'
      } else if (m.product_type === 'accessory') {
        const { data: accessory } = await supabase
          .from('accessory')
          .select('name')
          .eq('id', m.product_id)
          .single()
        product_name = accessory?.name || 'Accessory (deleted)'
      }
      
      return {
        ...m,
        product_name,
        created_by_name: m.created_by?.fullname || 'System'
      }
    })
  )
  
  return movements
}

/**
 * Insert stock movement (manual adjustment only)
 * Note: Most movements are created by triggers
 */
export async function insertStockMovement(
  storeid: string,
  productType: 'phone' | 'accessory',
  productId: string,
  movementType: 'in' | 'out' | 'adjustment' | 'return',
  quantity: number,
  notes: string | null,
  createdById: string
): Promise<StockMovement> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('stock_movement')
    .insert([{
      storeid,
      product_type: productType,
      product_id: productId,
      movement_type: movementType,
      quantity,
      source_table: 'adjustment',
      source_id: null,
      notes,
      createdbyid: createdById
    }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Get stock movement stats
 */
export async function getStockMovementStats(storeid: string, days: number = 30) {
  const supabase = await createClientServer()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('stock_movement')
    .select('movement_type, quantity')
    .eq('storeid', storeid)
    .gte('createdat', startDate.toISOString())

  if (error) throw error
  
  const stats = {
    total_in: 0,
    total_out: 0,
    total_adjustments: 0,
    total_returns: 0,
    net_movement: 0
  }
  
  data.forEach(m => {
    switch (m.movement_type) {
      case 'in':
        stats.total_in += m.quantity
        break
      case 'out':
        stats.total_out += m.quantity
        break
      case 'adjustment':
        stats.total_adjustments += m.quantity
        break
      case 'return':
        stats.total_returns += m.quantity
        break
    }
  })
  
  stats.net_movement = stats.total_in + stats.total_returns - stats.total_out + stats.total_adjustments
  
  return stats
}