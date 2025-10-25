// lib/supabase/db/purchases.ts
// DB Layer - Purchase transactions

import { createClientServer } from '@/lib/supabase'
import { Purchase, PurchaseWithDetails } from '@/lib/types'

type PurchaseInsert = Omit<Purchase, 'id' | 'total' | 'paidamount' | 'remainingamount' | 'createdat' | 'updatedat' | 'deleted_at'>

/**
 * Get all purchases for a store
 */
export async function getPurchasesByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<PurchaseWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase')
    .select(`
      *,
      supplier:supplierid(name, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('docdate', { ascending: false })
    .order('createdat', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  // Get items count for each purchase
  const purchasesWithCounts = await Promise.all(
    data.map(async (purchase) => {
      const { count } = await supabase
        .from('purchase_item')
        .select('*', { count: 'exact', head: true })
        .eq('purchaseid', purchase.id)
      
      return {
        ...purchase,
        supplier_name: purchase.supplier?.name || null,
        supplier_phone: purchase.supplier?.phone || null,
        created_by_name: purchase.created_by?.fullname || null,
        items_count: count || 0
      }
    })
  )
  
  return purchasesWithCounts
}

/**
 * Get purchase by ID with full details
 */
export async function getPurchaseById(purchaseId: string): Promise<PurchaseWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase')
    .select(`
      *,
      supplier:supplierid(name, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('id', purchaseId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  // Get items count
  const { count } = await supabase
    .from('purchase_item')
    .select('*', { count: 'exact', head: true })
    .eq('purchaseid', purchaseId)
  
  return {
    ...data,
    supplier_name: data.supplier?.name || null,
    supplier_phone: data.supplier?.phone || null,
    created_by_name: data.created_by?.fullname || null,
    items_count: count || 0
  }
}

/**
 * Get purchases by date range
 */
export async function getPurchasesByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<PurchaseWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase')
    .select(`
      *,
      supplier:supplierid(name, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .gte('docdate', startDate.toISOString())
    .lte('docdate', endDate.toISOString())
    .is('deleted_at', null)
    .order('docdate', { ascending: false })

  if (error) throw error
  
  const purchasesWithCounts = await Promise.all(
    data.map(async (purchase) => {
      const { count } = await supabase
        .from('purchase_item')
        .select('*', { count: 'exact', head: true })
        .eq('purchaseid', purchase.id)
      
      return {
        ...purchase,
        supplier_name: purchase.supplier?.name || null,
        supplier_phone: purchase.supplier?.phone || null,
        created_by_name: purchase.created_by?.fullname || null,
        items_count: count || 0
      }
    })
  )
  
  return purchasesWithCounts
}

/**
 * Get purchase by document number
 */
export async function getPurchaseByDocNumber(
  storeid: string, 
  docnumber: string
): Promise<PurchaseWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase')
    .select(`
      *,
      supplier:supplierid(name, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .eq('docnumber', docnumber)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  const { count } = await supabase
    .from('purchase_item')
    .select('*', { count: 'exact', head: true })
    .eq('purchaseid', data.id)
  
  return {
    ...data,
    supplier_name: data.supplier?.name || null,
    supplier_phone: data.supplier?.phone || null,
    created_by_name: data.created_by?.fullname || null,
    items_count: count || 0
  }
}

/**
 * Insert new purchase (invoice header)
 */
export async function insertPurchase(data: PurchaseInsert): Promise<Purchase> {
  const supabase = await createClientServer()
  
  const { data: purchase, error } = await supabase
    .from('purchase')
    .insert([{
      ...data,
      total: 0,
      paidamount: 0,
      remainingamount: 0
    }])
    .select('*')
    .single()

  if (error) throw error
  return purchase
}

/**
 * Update purchase basic info (supplier, notes only)
 * DO NOT update total/paidamount - triggers handle it
 */
export async function updatePurchaseBasic(
  purchaseId: string,
  supplierid: string | null,
  notes: string | null
): Promise<Purchase> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('purchase')
    .update({
      supplierid,
      notes,
      updatedat: new Date().toISOString()
    })
    .eq('id', purchaseId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel purchase
 */
export async function cancelPurchase(purchaseId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('purchase')
    .update({ 
      status: 'cancelled',
      updatedat: new Date().toISOString()
    })
    .eq('id', purchaseId)

  if (error) throw error
}

/**
 * Generate next document number
 */
export async function generatePurchaseDocNumber(storeid: string): Promise<string> {
  const supabase = await createClientServer()
  
  // Get last purchase number for today
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('purchase')
    .select('docnumber')
    .eq('storeid', storeid)
    .gte('createdat', `${today}T00:00:00`)
    .order('createdat', { ascending: false })
    .limit(1)

  if (error) throw error
  
  let nextNumber = 1
  if (data.length > 0 && data[0].docnumber) {
    const lastNumber = parseInt(data[0].docnumber.split('-').pop() || '0')
    nextNumber = lastNumber + 1
  }
  
  const dateStr = today.replace(/-/g, '')
  return `PO-${dateStr}-${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Get purchases summary stats
 */
export async function getPurchasesSummary(storeid: string, days: number = 30) {
  const supabase = await createClientServer()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('purchase')
    .select('total, paidamount, status')
    .eq('storeid', storeid)
    .gte('docdate', startDate.toISOString())
    .is('deleted_at', null)

  if (error) throw error
  
  const stats = {
    total_purchases: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
    cancelled_purchases: 0
  }
  
  data.forEach(purchase => {
    stats.total_purchases++
    stats.total_amount += Number(purchase.total)
    stats.total_paid += Number(purchase.paidamount)
    
    if (purchase.status === 'cancelled') {
      stats.cancelled_purchases++
    }
  })
  
  stats.total_remaining = stats.total_amount - stats.total_paid
  
  return stats
}