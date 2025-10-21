// lib/db/stores.ts
// DB Layer - Store and Store Settings queries

import { createClientServer } from '@/lib/supabase'
import { Store, StoreSettings } from '@/lib/types'

// ==================== Store Operations ====================

/**
 * Get store by ID
 */
export async function getStoreById(storeid: string): Promise<Store | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('store')
    .select('*')
    .eq('id', storeid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Check if store is active and within subscription period
 */
export async function isStoreActive(storeid: string): Promise<boolean> {
  const store = await getStoreById(storeid)
  if (!store) return false
  
  // Check if active flag is true
  if (!store.active) return false
  
  // Check if within subscription period (if enddate exists)
  if (store.enddate) {
    const now = new Date()
    const endDate = new Date(store.enddate)
    if (now > endDate) return false
  }
  
  return true
}

// ==================== Store Settings Operations ====================

/**
 * Get store settings
 */
export async function getStoreSettings(storeid: string): Promise<StoreSettings | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Update store settings
 */
export async function updateStoreSettings(
  storeid: string, 
  updates: Partial<Omit<StoreSettings, 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>
): Promise<StoreSettings> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('store_settings')
    .update({
      ...updates,
      updatedat: new Date().toISOString()
    })
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Create initial store settings (called on store creation)
 */
export async function createStoreSettings(storeid: string): Promise<StoreSettings> {
  const supabase = await createClientServer()
  
  const defaultSettings = {
    storeid,
    invoice_footer: 'شكراً لتعاملكم معنا',
    receipt_footer: 'نتمنى لكم يوماً سعيداً',
    phone: '',
    tax_number: null,
    logo_url: null,
    currency: 'DZD' as const,
    locale: 'ar-DZ' as const,
    print_logo: true,
    print_qr: false,
    auto_print_invoice: false,
    notify_low_stock: true,
    notify_warranty_expiry: true,
    notify_daily_report: false,
  }
  
  const { data, error } = await supabase
    .from('store_settings')
    .insert([defaultSettings])
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Get store with settings (combined query)
 */
export async function getStoreWithSettings(storeid: string) {
  const [store, settings] = await Promise.all([
    getStoreById(storeid),
    getStoreSettings(storeid)
  ])
  
  return { store, settings }
}