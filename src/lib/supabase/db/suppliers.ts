// lib/supabase/db/suppliers.ts
// DB Layer - Supplier queries only, no business logic

import { createClientServer } from '@/lib/supabase'
import { Supplier } from '@/lib/types'

type SupplierInsert = Omit<Supplier, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type SupplierUpdate = Partial<Omit<Supplier, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

/**
 * Get all suppliers for a store (tenant-isolated)
 */
export async function getSuppliersByStore(storeid: string, activeOnly: boolean = false): Promise<Supplier[]> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('supplier')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(supplierId: string): Promise<Supplier | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('supplier')
    .select('*')
    .eq('id', supplierId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Insert new supplier
 */
export async function insertSupplier(data: SupplierInsert): Promise<Supplier> {
  const supabase = await createClientServer()
  
  const { data: supplier, error } = await supabase
    .from('supplier')
    .insert([data])
    .select('*')
    .single()

  if (error) throw error
  return supplier
}

/**
 * Update supplier
 */
export async function updateSupplier(supplierId: string, updates: SupplierUpdate): Promise<Supplier> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('supplier')
    .update({
      ...updates,
      updatedat: new Date().toISOString()
    })
    .eq('id', supplierId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete supplier
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('supplier')
    .update({ 
      deleted_at: new Date().toISOString(),
      updatedat: new Date().toISOString()
    })
    .eq('id', supplierId)

  if (error) throw error
}

/**
 * Toggle supplier active status
 */
export async function toggleSupplierActive(supplierId: string, active: boolean): Promise<Supplier> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('supplier')
    .update({ 
      active,
      updatedat: new Date().toISOString()
    })
    .eq('id', supplierId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Check if supplier name exists in store (for validation)
 */
export async function supplierNameExists(storeid: string, name: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('supplier')
    .select('id')
    .eq('storeid', storeid)
    .eq('name', name)
    .is('deleted_at', null)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length > 0
}



/**
 * Top suppliers view - أفضل الموردين (مرتبة حسب عدد الفواتير والمبيعات)
 */
export interface TopSupplier {
  id: string
  name: string
  storeid: string
  phone: string | null
  email: string | null
  purchase_count: number
  total_purchase_amount: number
  active: boolean
}

export async function getTopSuppliers(storeid: string, limit: number = 10): Promise<TopSupplier[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_top_suppliers')
    .select('*')
    //.eq('storeid', storeid)
    .order('total_purchases', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Supplier debts view - ديون الموردين (كم عندهم ديون معلقة)
 */
export interface SupplierDebt {
  id: string
  name: string
  storeid: string
  phone: string | null
  total_debt: number
  pending_invoices: number
  last_purchase_date: string | null
  active: boolean
}

export async function getSupplierDebts(storeid: string): Promise<SupplierDebt[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_supplier_debts')
    .select('*')
    //.eq('storeid', storeid)
    .order('total_debt', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Supplier debts by status - ديون معينة (مثلاً الديون الكبيرة فوق مبلغ معين)
 */
export async function getSupplierDebtsByThreshold(storeid: string, minDebt: number): Promise<SupplierDebt[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_supplier_debts')
    .select('*')
    //.eq('storeid', storeid)
    .gte('total_debt', minDebt)
    .order('total_debt', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get supplier with purchase details (من الـ DB function اللي كاين)
 */
export interface SupplierWithPurchases {
  id: string
  name: string
  storeid: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdat: string
  updatedat: string
  deleted_at: string | null
  active_purchase_count: number
  can_delete: boolean
}

export async function getSupplierWithPurchaseCount(supplierId: string): Promise<SupplierWithPurchases | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('supplier')
    .select('*')
    .eq('id', supplierId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const supplier = data

  // Count active purchases with remaining amount
  const { data: purchases, error: purchaseError } = await supabase
    .from('purchase')
    .select('id')
    .eq('supplierid', supplierId)
    .eq('status', 'posted')
    .gt('remainingamount', 0)
    .is('deleted_at', null)

  if (purchaseError) throw purchaseError

  return {
    ...supplier,
    active_purchase_count: purchases?.length || 0,
    can_delete: (purchases?.length || 0) === 0
  }
}

/**
 * Get all suppliers with their purchase summary (analytics)
 */
export async function getAllSuppliersWithAnalytics(storeid: string): Promise<(TopSupplier & { total_debt?: number })[]> {
  const supabase = await createClientServer()
  
  // Get top suppliers
  const { data: topSuppliers, error: error1 } = await supabase
    .from('v_top_suppliers')
    .select('*')
    //.eq('storeid', storeid)

  if (error1) throw error1

  // Get debts
  const { data: debts, error: error2 } = await supabase
    .from('v_supplier_debts')
    .select('*')
    //.eq('storeid', storeid)

  if (error2) throw error2

  // Merge data: combine top suppliers with their debt info
  const debtMap = new Map(debts?.map((d: any) => [d.id, d.total_debt]) || [])
  
  return (topSuppliers || []).map((supplier: any) => ({
    ...supplier,
    total_debt: debtMap.get(supplier.id) || 0
  }))
}