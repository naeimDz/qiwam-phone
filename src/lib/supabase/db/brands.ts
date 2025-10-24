// lib/supabase/db/brands.ts
// DB Layer - Brand queries only, no business logic

import { createClientServer } from '@/lib/supabase'
import { Brand } from '@/lib/types'

/**
 * Get all brands for a store (tenant-isolated)
 */
export async function getBrandsByStore(storeid: string): Promise<Brand[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('brand')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get brand by ID
 */
export async function getBrandById(brandId: string): Promise<Brand | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('brand')
    .select('*')
    .eq('id', brandId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Insert new brand
 */
export async function insertBrand(storeid: string, name: string): Promise<Brand> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('brand')
    .insert([{ storeid, name }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update brand name
 */
export async function updateBrand(brandId: string, name: string): Promise<Brand> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('brand')
    .update({ name })
    .eq('id', brandId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete brand
 */
export async function deleteBrand(brandId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('brand')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', brandId)

  if (error) throw error
}

/**
 * Check if brand name exists in store (for validation)
 */
export async function brandNameExists(storeid: string, name: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('brand')
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