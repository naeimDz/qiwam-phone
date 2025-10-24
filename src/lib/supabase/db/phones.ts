// lib/db/phones.ts
// DB Layer - Phone inventory queries

import { createClientServer } from '@/lib/supabase'
import { Phone, PhoneWithDetails, ProductStatus } from '@/lib/types'

type PhoneInsert = Omit<Phone, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type PhoneUpdate = Partial<Omit<Phone, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

/**
 * Get all phones for a store (any status)
 */
export async function getPhonesByStore(storeid: string): Promise<PhoneWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .select(`
      *,
      brand:brandid(name),
      supplier:supplierid(name)
    `)
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('createdat', { ascending: false })

  if (error) throw error
  
  return data.map(p => ({
    ...p,
    brand_name: p.brand?.name || null,
    supplier_name: p.supplier?.name || null
  }))
}

/**
 * Get available phones only (status='available')
 */
export async function getAvailablePhones(storeid: string): Promise<PhoneWithDetails[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .select(`
      *,
      brand:brandid(name),
      supplier:supplierid(name)
    `)
    .eq('storeid', storeid)
    .eq('status', 'available')
    .is('deleted_at', null)
    .order('createdat', { ascending: false })

  if (error) throw error
  
  return data.map(p => ({
    ...p,
    brand_name: p.brand?.name || null,
    supplier_name: p.supplier?.name || null
  }))
}

/**
 * Get phone by ID
 */
export async function getPhoneById(phoneId: string): Promise<PhoneWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .select(`
      *,
      brand:brandid(name),
      supplier:supplierid(name)
    `)
    .eq('id', phoneId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return {
    ...data,
    brand_name: data.brand?.name || null,
    supplier_name: data.supplier?.name || null
  }
}

/**
 * Search phone by IMEI
 */
export async function getPhoneByImei(storeid: string, imei: string): Promise<PhoneWithDetails | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .select(`
      *,
      brand:brandid(name),
      supplier:supplierid(name)
    `)
    .eq('storeid', storeid)
    .eq('imei', imei)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return {
    ...data,
    brand_name: data.brand?.name || null,
    supplier_name: data.supplier?.name || null
  }
}

/**
 * Insert new phone
 */
export async function insertPhone(data: PhoneInsert): Promise<Phone> {
  const supabase = await createClientServer()
  
  const { data: phone, error } = await supabase
    .from('phone')
    .insert([data])
    .select('*')
    .single()

  if (error) throw error
  return phone
}

/**
 * Update phone details
 */
export async function updatePhone(phoneId: string, updates: PhoneUpdate): Promise<Phone> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .update({
      ...updates,
      updatedat: new Date().toISOString()
    })
    .eq('id', phoneId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update phone status (available → sold, etc)
 */
export async function updatePhoneStatus(phoneId: string, status: ProductStatus): Promise<Phone> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .update({ 
      status,
      updatedat: new Date().toISOString()
    })
    .eq('id', phoneId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete phone
 */
export async function deletePhone(phoneId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('phone')
    .update({ 
      deleted_at: new Date().toISOString(),
      updatedat: new Date().toISOString()
    })
    .eq('id', phoneId)

  if (error) throw error
}

/**
 * Check if IMEI exists in store
 */
export async function imeiExists(storeid: string, imei: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('phone')
    .select('id')
    .eq('storeid', storeid)
    .eq('imei', imei)
    .is('deleted_at', null)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length > 0
}

/**
 * Get phones count by status
 */
export async function getPhonesCountByStatus(storeid: string) {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('phone')
    .select('status')
    .eq('storeid', storeid)
    .is('deleted_at', null)

  if (error) throw error
  
  const counts = {
    available: 0,
    sold: 0,
    returned: 0,
    damaged: 0,
    reserved: 0,
    total: data.length
  }
  
  data.forEach(p => {
    counts[p.status as ProductStatus]++
  })
  
  return counts
}