// lib/supabase/db/saleItems.ts
// DB Layer - Sale items (invoice lines)

import { createClientServer } from '@/lib/supabase'
import { SaleItem, SaleItemWithDetails } from '@/lib/types'

type SaleItemInsert = Omit<SaleItem, 'id' | 'linetotal' | 'createdat'>

/**
 * Get all items for a sale
 */
export async function getSaleItems(saleId: string): Promise<SaleItemWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale_item')
    .select('*')
    .eq('saleid', saleId)
    .order('createdat', { ascending: true })

  if (error) throw error
  
  // Get product details
  const itemsWithDetails = await Promise.all(
    data.map(async (item) => {
      let product_name = 'Unknown'
      let brand_name = null
      
      if (item.item_type === 'phone' && item.phone_id) {
        const { data: phone } = await supabase
          .from('phone')
          .select('name, brand:brandid(name)')
          .eq('id', item.phone_id)
          .single()
        
        product_name = phone?.name || 'Phone (deleted)'
        // brandid(...) returns an array; use the first element's name if present
        brand_name = Array.isArray(phone?.brand) ? phone?.brand[0]?.name || null : phone?.brand || null
      } else if (item.item_type === 'accessory' && item.accessory_id) {
        const { data: accessory } = await supabase
          .from('accessory')
          .select('name, brand:brandid(name)')
          .eq('id', item.accessory_id)
          .single()
        
        product_name = accessory?.name || 'Accessory (deleted)'
        // brandid(...) returns an array; use the first element's name if present
        brand_name = Array.isArray(accessory?.brand) ? accessory?.brand[0]?.name || null : accessory?.brand || null
      }
      
      return {
        ...item,
        product_name,
        brand_name
      }
    })
  )
  
  return itemsWithDetails
}

/**
 * Insert sale item (add product to invoice)
 */
export async function insertSaleItem(data: SaleItemInsert): Promise<SaleItem> {
  const supabase = await createClientServer()
  
  // Calculate line total
  const linetotal = (data.unitprice - data.discount) * data.qty
  
  const { data: item, error } = await supabase
    .from('sale_item')
    .insert([{
      ...data,
      linetotal
    }])
    .select('*')
    .single()

  if (error) throw error
  return item
}

/**
 * Update sale item (change qty, price, discount)
 */
export async function updateSaleItem(
  itemId: string,
  qty: number,
  unitprice: number,
  discount: number
): Promise<SaleItem> {
  const supabase = await createClientServer()
  
  const linetotal = (unitprice - discount) * qty
  
  const { data, error } = await supabase
    .from('sale_item')
    .update({
      qty,
      unitprice,
      discount,
      linetotal
    })
    .eq('id', itemId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Delete sale item
 */
export async function deleteSaleItem(itemId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('sale_item')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

/**
 * Check if product can be sold (availability check)
 */
export async function canSellProduct(
  productType: 'phone' | 'accessory',
  productId: string,
  qty: number
): Promise<{ available: boolean; message: string }> {
  const supabase = await createClientServer()
  
  if (productType === 'phone') {
    const { data: phone, error } = await supabase
      .from('phone')
      .select('status')
      .eq('id', productId)
      .is('deleted_at', null)
      .single()
    
    if (error || !phone) {
      return { available: false, message: 'الهاتف غير موجود' }
    }
    
    if (phone.status !== 'available') {
      return { available: false, message: `الهاتف ${phone.status === 'sold' ? 'مباع' : 'غير متاح'}` }
    }
    
    return { available: true, message: 'متاح' }
  } else {
    const { data: accessory, error } = await supabase
      .from('accessory')
      .select('quantity, active')
      .eq('id', productId)
      .is('deleted_at', null)
      .single()
    
    if (error || !accessory) {
      return { available: false, message: 'الإكسسوار غير موجود' }
    }
    
    if (!accessory.active) {
      return { available: false, message: 'الإكسسوار معطل' }
    }
    
    if (accessory.quantity < qty) {
      return { 
        available: false, 
        message: `المخزون غير كافٍ (متوفر: ${accessory.quantity})` 
      }
    }
    
    return { available: true, message: 'متاح' }
  }
}

/**
 * Get sale item by ID
 */
export async function getSaleItemById(itemId: string): Promise<SaleItem | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale_item')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}