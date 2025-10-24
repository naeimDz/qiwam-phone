// lib/supabase/db/categories.ts
// DB Layer - Category queries only, no business logic

import { createClientServer } from '@/lib/supabase'
import { Category } from '@/lib/types'

/**
 * Get all categories for a store (tenant-isolated)
 */
export async function getCategoriesByStore(storeid: string): Promise<Category[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('storeid', storeid)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('id', categoryId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Insert new category
 */
export async function insertCategory(storeid: string, name: string): Promise<Category> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('category')
    .insert([{ storeid, name }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Update category name
 */
export async function updateCategory(categoryId: string, name: string): Promise<Category> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('category')
    .update({ name })
    .eq('id', categoryId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('category')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', categoryId)

  if (error) throw error
}

/**
 * Check if category name exists in store (for validation)
 */
export async function categoryNameExists(storeid: string, name: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('category')
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