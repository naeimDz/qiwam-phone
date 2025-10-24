// lib/supabase/db/customers.ts
// DB Layer - Customer queries only, no business logic

import { createClientServer } from '@/lib/supabase'
import { Customer } from '@/lib/types'

type CustomerInsert = Omit<Customer, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type CustomerUpdate = Partial<Omit<Customer, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

/**
 * Get all customers for a store (tenant-isolated)
 */
export async function getCustomersByStore(storeid: string, activeOnly: boolean = false): Promise<Customer[]> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('customer')
    .select('*')
    //.eq('storeid', storeid)
    .is('deleted_at', null)

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query.order('fullname', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('id', customerId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Insert new customer
 */
export async function insertCustomer(data: CustomerInsert): Promise<Customer> {
  const supabase = await createClientServer()
  
  const { data: customer, error } = await supabase
    .from('customer')
    .insert([data])
    .select('*')
    .single()

  if (error) throw error
  return customer
}

/**
 * Update customer
 */
export async function updateCustomer(customerId: string, updates: CustomerUpdate): Promise<Customer> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('customer')
    .update({
      ...updates,
      updatedat: new Date().toISOString()
    })
    .eq('id', customerId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  const supabase = await createClientServer()
  
  const { error } = await supabase
    .from('customer')
    .update({ 
      deleted_at: new Date().toISOString(),
      updatedat: new Date().toISOString()
    })
    .eq('id', customerId)

  if (error) throw error
}

/**
 * Toggle customer active status
 */
export async function toggleCustomerActive(customerId: string, active: boolean): Promise<Customer> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('customer')
    .update({ 
      active,
      updatedat: new Date().toISOString()
    })
    .eq('id', customerId)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error) throw error
  return data
}

/**
 * Check if customer phone exists in store (for validation)
 */
export async function customerPhoneExists(storeid: string, phone: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClientServer()
  
  let query = supabase
    .from('customer')
    .select('id')
    //.eq('storeid', storeid)
    .eq('phone', phone)
    .is('deleted_at', null)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length > 0
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(storeid: string, query: string): Promise<Customer[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    //.eq('storeid', storeid)
    .is('deleted_at', null)
    .or(`fullname.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('fullname', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Count total customers in store
 */
export async function countCustomers(storeid: string): Promise<number> {
  const supabase = await createClientServer()
  
  const { count, error } = await supabase
    .from('customer')
    .select('*', { count: 'exact', head: true })
    //.eq('storeid', storeid)
    .is('deleted_at', null)

  if (error) throw error
  return count || 0
}


/**
 * Top customers view - العملاء الأكثر شراءً
 */
export interface TopCustomer {
  id: string
  fullname: string
  phone: string | null
  total_purchases: number
  total_spent: number
  total_paid: number
  outstanding_balance: number
  last_purchase_date: string | null
  first_purchase_date: string | null
}

export async function getTopCustomers(storeid: string, limit: number = 10): Promise<TopCustomer[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_top_customers')
    .select('*')
    //.eq('storeid', storeid)
    .order('total_spent', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Customer debts view - ديون العملاء المستحقة
 */
export interface CustomerDebt {
  customer_id: string
  customer_name: string
  phone: string | null
  unpaid_invoices: number
  total_debt: number
  oldest_invoice_date: string | null
  latest_invoice_date: string | null
  days_overdue: number | null
}

export async function getCustomerDebts(storeid: string): Promise<CustomerDebt[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_customer_debts')
    .select('*')
    //.eq('storeid', storeid)
    .order('total_debt', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get customer debts above a threshold
 */
export async function getCustomerDebtsByThreshold(storeid: string, minDebt: number): Promise<CustomerDebt[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_customer_debts')
    .select('*')
    //.eq('storeid', storeid)
    .gte('total_debt', minDebt)
    .order('total_debt', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get customers with high debt ratios (outstanding/total > threshold)
 */
export async function getHighRiskCustomers(storeid: string, riskThreshold: number = 0.5): Promise<TopCustomer[]> {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('v_top_customers')
    .select('*')
    //.eq('storeid', storeid)

  if (error) throw error

  // Filter client-side for high risk (outstanding_balance / total_spent > threshold)
  return (data || [])
    .filter(c => c.total_spent > 0 && (c.outstanding_balance / c.total_spent) > riskThreshold)
    .sort((a, b) => (b.outstanding_balance / b.total_spent) - (a.outstanding_balance / a.total_spent))
}

/**
 * Get combined customer analytics
 */
export async function getAllCustomersWithAnalytics(storeid: string) {
  const supabase = await createClientServer()
  
  const { data: topCustomers, error: error1 } = await supabase
    .from('v_top_customers')
    .select('*')
    //.eq('storeid', storeid)

  if (error1) throw error1

  const { data: debts, error: error2 } = await supabase
    .from('v_customer_debts')
    .select('*')
    //.eq('storeid', storeid)

  if (error2) throw error2

  // Merge data
  const debtMap = new Map((debts || []).map((d: any) => [d.customer_id, d]))
  
  return (topCustomers || []).map((customer: any) => ({
    ...customer,
    debt_info: debtMap.get(customer.id) || null
  }))
}