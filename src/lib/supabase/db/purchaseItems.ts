// lib/supabase/db/purchaseItems.ts
// DB Layer - Purchase items (invoice lines)

import { createClientServer } from '@/lib/supabase'
import { PurchaseItem, PurchaseItemWithDetails } from '@/lib/types'

type PurchaseItemInsert = Omit<PurchaseItem, 'id' | 'linetotal' | 'createdat'>

/**
 * Get all items for a purchase
 */
export async function getPurchaseItems(purchaseId: string): Promise<PurchaseItemWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase_item')
    .select('*')
    .eq('purchaseid', purchaseId)
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
        brand_name = phone?.brand || null
      } else if (item.item_type === 'accessory' && item.accessory_id) {
        const { data: accessory } = await supabase
          .from('accessory')
          .select('name, brand:brandid(name)')
          .eq('id', item.accessory_id)
          .single()
        
        product_name = accessory?.name || 'Accessory (deleted)'
        brand_name = accessory?.brand || null
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
 * Insert purchase item (add product to invoice)
 */
export async function insertPurchaseItem(data: PurchaseItemInsert): Promise<PurchaseItem> {
  const supabase = await createClientServer()
  
  // Calculate line total
  const linetotal = data.unitprice * data.qty
  
  const { data: item, error } = await supabase
    .from('purchase_item')
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
 * Update purchase item (change qty, price)
 */
export async function updatePurchaseItem(
  itemId: string,
  qty: number,
  unitprice: number
): Promise<PurchaseItem> {
  const supabase = await createClientServer()
  
  const linetotal = unitprice * qty
  
  const { data, error } = await supabase
    .from('purchase_item')
    .update({
      qty,
      unitprice,
      linetotal
    })
    .eq('id', itemId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Delete purchase item
 */
export async function deletePurchaseItem(itemId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('purchase_item')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

/**
 * Get purchase item by ID
 */
export async function getPurchaseItemById(itemId: string): Promise<PurchaseItem | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase_item')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}