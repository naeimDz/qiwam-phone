// lib/supabase/db/sales.ts
// DB Layer - Sales transactions

import { createClientServer } from '@/lib/supabase'
import { Sale, SaleWithDetails } from '@/lib/types'

type SaleInsert = Omit<Sale, 'id' | 'total' | 'paidamount' | 'remainingamount' | 'createdat' | 'updatedat' | 'deleted_at'>

/**
 * Get all sales for a store
 */
export async function getSalesByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<SaleWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer:customerid(fullname, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('docdate', { ascending: false })
    .order('createdat', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  // Get items count for each sale
  const salesWithCounts = await Promise.all(
    data.map(async (sale) => {
      const { count } = await supabase
        .from('sale_item')
        .select('*', { count: 'exact', head: true })
        .eq('saleid', sale.id)
      
      return {
        ...sale,
        customer_name: sale.customer?.fullname || null,
        customer_phone: sale.customer?.phone || null,
        created_by_name: sale.created_by?.fullname || null,
        items_count: count || 0
      }
    })
  )
  
  return salesWithCounts
}

/**
 * Get sale by ID with full details
 */
export async function getSaleById(saleId: string): Promise<SaleWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer:customerid(fullname, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('id', saleId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  // Get items count
  const { count } = await supabase
    .from('sale_item')
    .select('*', { count: 'exact', head: true })
    .eq('saleid', saleId)
  
  return {
    ...data,
    customer_name: data.customer?.fullname || null,
    customer_phone: data.customer?.phone || null,
    created_by_name: data.created_by?.fullname || null,
    items_count: count || 0
  }
}

/**
 * Get sales by date range
 */
export async function getSalesByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<SaleWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer:customerid(fullname, phone),
      created_by:createdbyid(fullname)
    `)
    .eq('storeid', storeid)
    .gte('docdate', startDate.toISOString())
    .lte('docdate', endDate.toISOString())
    .is('deleted_at', null)
    .order('docdate', { ascending: false })

  if (error) throw error
  
  const salesWithCounts = await Promise.all(
    data.map(async (sale) => {
      const { count } = await supabase
        .from('sale_item')
        .select('*', { count: 'exact', head: true })
        .eq('saleid', sale.id)
      
      return {
        ...sale,
        customer_name: sale.customer?.fullname || null,
        customer_phone: sale.customer?.phone || null,
        created_by_name: sale.created_by?.fullname || null,
        items_count: count || 0
      }
    })
  )
  
  return salesWithCounts
}

/**
 * Get sale by document number
 */
export async function getSaleByDocNumber(
  storeid: string, 
  docnumber: string
): Promise<SaleWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer:customerid(fullname, phone),
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
    .from('sale_item')
    .select('*', { count: 'exact', head: true })
    .eq('saleid', data.id)
  
  return {
    ...data,
    customer_name: data.customer?.fullname || null,
    customer_phone: data.customer?.phone || null,
    created_by_name: data.created_by?.fullname || null,
    items_count: count || 0
  }
}

/**
 * Insert new sale (invoice header)
 */
export async function insertSale(data: SaleInsert): Promise<Sale> {
  const supabase = await createClientServer()
  
  const { data: sale, error } = await supabase
    .from('sale')
    .insert([{
      ...data,
      total: 0,
      paidamount: 0,
      remainingamount: 0
    }])
    .select('*')
    .single()

  if (error) throw error
  return sale
}

/**
 * Update sale basic info (customer, notes only)
 * DO NOT update total/paidamount - triggers handle it
 */
export async function updateSaleBasic(
  saleId: string,
  customerid: string | null,
  notes: string | null
): Promise<Sale> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('sale')
    .update({
      customerid,
      notes,
      updatedat: new Date().toISOString()
    })
    .eq('id', saleId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel sale (soft delete items, revert stock)
 */
export async function cancelSale(saleId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('sale')
    .update({ 
      status: 'cancelled',
      updatedat: new Date().toISOString()
    })
    .eq('id', saleId)

  if (error) throw error
}

/**
 * Generate next document number
 */
export async function generateSaleDocNumber(storeid: string): Promise<string> {
  const supabase = await createClientServer()
  
  // Get last sale number for today
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('sale')
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
  return `INV-${dateStr}-${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Get sales summary stats
 */
export async function getSalesSummary(storeid: string, days: number = 30) {
  const supabase = await createClientServer()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('sale')
    .select('total, paidamount, status, saletype')
    .eq('storeid', storeid)
    .gte('docdate', startDate.toISOString())
    .is('deleted_at', null)

  if (error) throw error
  
  const stats = {
    total_sales: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
    cash_sales: 0,
    credit_sales: 0,
    cancelled_sales: 0
  }
  
  data.forEach(sale => {
    stats.total_sales++
    stats.total_amount += Number(sale.total)
    stats.total_paid += Number(sale.paidamount)
    
    if (sale.status === 'cancelled') {
      stats.cancelled_sales++
    } else {
      if (sale.saletype === 'cash') stats.cash_sales++
      if (sale.saletype === 'credit') stats.credit_sales++
    }
  })
  
  stats.total_remaining = stats.total_amount - stats.total_paid
  
  return stats
}