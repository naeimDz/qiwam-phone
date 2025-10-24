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