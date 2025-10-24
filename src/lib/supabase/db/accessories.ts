// lib/db/accessories.ts
// DB Layer - Accessory inventory queries

import { createClientServer } from '@/lib/supabase'
import { Accessory, AccessoryWithDetails } from '@/lib/types'

type AccessoryInsert = Omit<Accessory, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type AccessoryUpdate = Partial<Omit<Accessory, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

/**
 * Get all accessories for a store
 */
export async function getAccessoriesByStore(storeid: string, activeOnly: boolean = false): Promise<AccessoryWithDetails[]> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('accessory')
    .select(`
      *,
      brand:brandid(name),
      category:categoryid(name),
      supplier:supplierid(name)
    `)
    .eq('storeid', storeid)
    .is('deleted_at', null)

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw error
  
  return data.map(a => ({
    ...a,
    brand_name: a.brand?.name || null,
    category_name: a.category?.name || null,
    supplier_name: a.supplier?.name || null,
    is_low_stock: a.quantity <= a.minqty
  }))
}

/**
 * Get accessories with stock available (quantity > 0)
 */
export async function getAccessoriesInStock(storeid: string): Promise<AccessoryWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('accessory')
    .select(`
      *,
      brand:brandid(name),
      category:categoryid(name),
      supplier:supplierid(name)
    `)
    .eq('storeid', storeid)
    .eq('active', true)
    .gt('quantity', 0)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  
  return data.map(a => ({
    ...a,
    brand_name: a.brand?.name || null,
    category_name: a.category?.name || null,
    supplier_name: a.supplier?.name || null,
    is_low_stock: a.quantity <= a.minqty
  }))
}

/**
 * Get accessory by ID
 */
export async function getAccessoryById(accessoryId: string): Promise<AccessoryWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('accessory')
    .select(`
      *,
      brand:brandid(name),
      category:categoryid(name),
      supplier:supplierid(name)
    `)
    .eq('id', accessoryId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return {
    ...data,
    brand_name: data.brand?.name || null,
    category_name: data.category?.name || null,
    supplier_name: data.supplier?.name || null,
    is_low_stock: data.quantity <= data.minqty
  }
}

/**
 * Get accessories with low stock (quantity <= minqty)
 */
export async function getAccessoriesLowStock(storeid: string): Promise<AccessoryWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .rpc('get_low_stock_accessories', { p_storeid: storeid })

  if (error) {
    // Fallback if function doesn't exist
    const { data: fallback, error: fallbackError } = await supabase
      .from('accessory')
      .select(`
        *,
        brand:brandid(name),
        category:categoryid(name),
        supplier:supplierid(name)
      `)
      .eq('storeid', storeid)
      .eq('active', true)
      .is('deleted_at', null)
    
    if (fallbackError) throw fallbackError
    
    const lowStock = fallback.filter(a => a.quantity <= a.minqty)
    return lowStock.map(a => ({
      ...a,
      brand_name: a.brand?.name || null,
      category_name: a.category?.name || null,
      supplier_name: a.supplier?.name || null,
      is_low_stock: true
    }))
  }
  
  return data
}

/**
 * Insert new accessory
 */
export async function insertAccessory(data: AccessoryInsert): Promise<Accessory> {
  const supabase = await createClientServer()
  
  const { data: accessory, error } = await supabase
    .from('accessory')
    .insert([data])
    .select('*')
    .single()

  if (error) throw error
  return accessory
}

/**
 * Update accessory details
 */
export async function updateAccessory(accessoryId: string, updates: AccessoryUpdate): Promise<Accessory> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('accessory')
    .update({
      ...updates,
      updatedat: new Date().toISOString()
    })
    .eq('id', accessoryId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update accessory quantity (increase/decrease)
 */
export async function updateAccessoryQuantity(accessoryId: string, delta: number): Promise<Accessory> {
  const supabase = await createClientServer()
  
  // Get current quantity first
  const { data: current, error: fetchError } = await supabase
    .from('accessory')
    .select('quantity')
    .eq('id', accessoryId)
    .single()
    
  if (fetchError) throw fetchError
  
  const newQuantity = current.quantity + delta
  
  if (newQuantity < 0) {
    throw new Error('الكمية لا يمكن أن تكون سالبة')
  }
  
  const { data, error } = await supabase
    .from('accessory')
    .update({ 
      quantity: newQuantity,
      updatedat: new Date().toISOString()
    })
    .eq('id', accessoryId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete accessory
 */
export async function deleteAccessory(accessoryId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('accessory')
    .update({ 
      deleted_at: new Date().toISOString(),
      updatedat: new Date().toISOString()
    })
    .eq('id', accessoryId)

  if (error) throw error
}

/**
 * Check if SKU or Barcode exists
 */
export async function accessoryCodeExists(
  storeid: string, 
  code: string, 
  type: 'sku' | 'barcode',
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('accessory')
    .select('id')
    .eq('storeid', storeid)
    .eq(type, code)
    .is('deleted_at', null)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length > 0
}

/**
 * Get accessories inventory value
 */
export async function getAccessoriesInventoryValue(storeid: string) {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('accessory')
    .select('quantity, buyprice, sellprice')
    .eq('storeid', storeid)
    .eq('active', true)
    .is('deleted_at', null)

  if (error) throw error
  
  const stats = {
    total_items: data.length,
    total_quantity: 0,
    total_buy_value: 0,
    total_sell_value: 0,
    potential_profit: 0
  }
  
  data.forEach(a => {
    stats.total_quantity += a.quantity
    stats.total_buy_value += a.quantity * a.buyprice
    stats.total_sell_value += a.quantity * a.sellprice
  })
  
  stats.potential_profit = stats.total_sell_value - stats.total_buy_value
  
  return stats
}