// lib/supabase/db/customers.ts
// DB Layer - Customer queries with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Customer } from '@/lib/types'

type CustomerInsert = Omit<Customer, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type CustomerUpdate = Partial<Omit<Customer, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

// Error logging utility
interface ErrorLog {
  timestamp: string
  function: string
  error: any
  context?: Record<string, any>
}

const logError = (functionName: string, error: any, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    function: functionName,
    error: {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      status: error?.status
    },
    context
  }
  console.error(`[${functionName}]`, errorLog)
  return errorLog
}

/**
 * Get all customers for a store (tenant-isolated)
 */
export async function getCustomersByStore(
  storeid: string,
  activeOnly: boolean = false
): Promise<Customer[]> {
  const functionName = 'getCustomersByStore'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب العملاء للمتجر ${storeid}`, { activeOnly })
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('customer')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)

    if (activeOnly) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.order('fullname', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid, activeOnly })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} عميل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, activeOnly })
    throw new Error(`فشل في جلب العملاء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const functionName = 'getCustomerById'
  
  try {
    if (!customerId) throw new Error('customerId مطلوب')

    console.log(`[${functionName}] البدء: جلب العميل ${customerId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('id', customerId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] العميل غير موجود`)
        return null
      }
      logError(functionName, error, { customerId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات العميل فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { customerId })
    throw new Error(`فشل في جلب العميل: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new customer
 * Triggers: تحديث audit_log
 */
export async function insertCustomer(data: CustomerInsert): Promise<Customer> {
  const functionName = 'insertCustomer'
  
  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.fullname) throw new Error('الاسم الكامل مطلوب')

    console.log(`[${functionName}] البدء: إضافة عميل جديد`, { fullname: data.fullname })
    
    const supabase = await createClientServer()
    
    const { data: customer, error } = await supabase
      .from('customer')
      .insert([{
        ...data,
        active: data.active !== false
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { data })
      throw error
    }

    if (!customer) {
      throw new Error('فشل في إرجاع العميل المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: العميل ${customer.id}`)
    return customer
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة العميل: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update customer details
 * Triggers: تحديث audit_log عند تغيير البيانات
 */
export async function updateCustomer(customerId: string, updates: CustomerUpdate): Promise<Customer> {
  const functionName = 'updateCustomer'
  
  try {
    if (!customerId) throw new Error('customerId مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    console.log(`[${functionName}] البدء: تحديث العميل ${customerId}`, updates)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('العميل غير موجود أو محذوف')
      }
      logError(functionName, error, { customerId, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع العميل المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { customerId, updates })
    throw new Error(`فشل في تحديث العميل: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Soft delete customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  const functionName = 'deleteCustomer'
  
  try {
    if (!customerId) throw new Error('customerId مطلوب')

    console.log(`[${functionName}] البدء: حذف العميل ${customerId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('customer')
      .update({ 
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString()
      })
      .eq('id', customerId)

    if (error) {
      logError(functionName, error, { customerId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: العميل ${customerId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { customerId })
    throw new Error(`فشل في حذف العميل: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Toggle customer active status
 */
export async function toggleCustomerActive(customerId: string, active: boolean): Promise<Customer> {
  const functionName = 'toggleCustomerActive'
  
  try {
    if (!customerId) throw new Error('customerId مطلوب')

    console.log(`[${functionName}] البدء: تحديث حالة العميل ${customerId} إلى ${active}`)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('العميل غير موجود أو محذوف')
      }
      logError(functionName, error, { customerId, active })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع العميل المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { customerId, active })
    throw new Error(`فشل في تحديث حالة العميل: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Check if customer phone exists in store (for validation)
 */
export async function customerPhoneExists(
  storeid: string,
  phone: string,
  excludeId?: string
): Promise<boolean> {
  const functionName = 'customerPhoneExists'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!phone) throw new Error('رقم الهاتف مطلوب')

    console.log(`[${functionName}] البدء: فحص تكرار الهاتف ${phone}`)
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('customer')
      .select('id', { count: 'exact', head: true })
      .eq('storeid', storeid)
      .eq('phone', phone)
      .is('deleted_at', null)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { error, count } = await query

    if (error) {
      logError(functionName, error, { storeid, phone })
      throw error
    }

    const exists = (count || 0) > 0
    console.log(`[${functionName}] تم بنجاح: الهاتف موجود = ${exists}`)
    return exists
  } catch (error: any) {
    logError(functionName, error, { storeid, phone, excludeId })
    throw new Error(`فشل في فحص الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(storeid: string, query: string): Promise<Customer[]> {
  const functionName = 'searchCustomers'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!query || query.trim().length < 2) throw new Error('نص البحث يجب أن يكون 2 حرف على الأقل')

    console.log(`[${functionName}] البدء: البحث عن "${query}"`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .or(`fullname.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('fullname', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid, query })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد نتائج`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} نتيجة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, query })
    throw new Error(`فشل في البحث: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Count total customers in store
 */
export async function countCustomers(storeid: string): Promise<number> {
  const functionName = 'countCustomers'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: عد العملاء`)
    
    const supabase = await createClientServer()
    
    const { count, error } = await supabase
      .from('customer')
      .select('*', { count: 'exact', head: true })
      .eq('storeid', storeid)
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    const total = count || 0
    console.log(`[${functionName}] تم بنجاح: ${total} عميل`)
    return total
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في عد العملاء: ${error?.message || 'خطأ غير معروف'}`)
  }
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
  const functionName = 'getTopCustomers'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1) throw new Error('الحد يجب أن يكون أكبر من 0')

    console.log(`[${functionName}] البدء: جلب أفضل ${limit} عميل`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_top_customers')
      .select('*')
      //.eq('storeid', storeid)
      .order('total_spent', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, limit })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} عميل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, limit })
    throw new Error(`فشل في جلب أفضل العملاء: ${error?.message || 'خطأ غير معروف'}`)
  }
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
  const functionName = 'getCustomerDebts'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب ديون العملاء`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_customer_debts')
      .select('*')
      //.eq('storeid', storeid)
      .order('total_debt', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} عميل مدين`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الديون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get customer debts above a threshold
 */
export async function getCustomerDebtsByThreshold(
  storeid: string,
  minDebt: number
): Promise<CustomerDebt[]> {
  const functionName = 'getCustomerDebtsByThreshold'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (minDebt < 0) throw new Error('الحد الأدنى يجب أن يكون موجب')

    console.log(`[${functionName}] البدء: جلب الديون فوق ${minDebt}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_customer_debts')
      .select('*')
      //.eq('storeid', storeid)
      .gte('total_debt', minDebt)
      .order('total_debt', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, minDebt })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} عميل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, minDebt })
    throw new Error(`فشل في جلب الديون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get customers with high debt ratios (outstanding/total > threshold)
 */
export async function getHighRiskCustomers(
  storeid: string,
  riskThreshold: number = 0.5
): Promise<TopCustomer[]> {
  const functionName = 'getHighRiskCustomers'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (riskThreshold < 0 || riskThreshold > 1) throw new Error('نسبة الخطر يجب أن تكون بين 0 و 1')

    console.log(`[${functionName}] البدء: جلب العملاء عالي الخطورة (نسبة ${riskThreshold})`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_top_customers')
      .select('*')
      //.eq('storeid', storeid)

    if (error) {
      logError(functionName, error, { storeid, riskThreshold })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    // Filter client-side for high risk
    const highRisk = data
      .filter(c => c.total_spent > 0 && (c.outstanding_balance / c.total_spent) > riskThreshold)
      .sort((a, b) => (b.outstanding_balance / b.total_spent) - (a.outstanding_balance / a.total_spent))

    console.log(`[${functionName}] تم بنجاح: ${highRisk.length} عميل عالي الخطورة`)
    return highRisk
  } catch (error: any) {
    logError(functionName, error, { storeid, riskThreshold })
    throw new Error(`فشل في جلب العملاء عالي الخطورة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get combined customer analytics
 */
export async function getAllCustomersWithAnalytics(storeid: string) {
  const functionName = 'getAllCustomersWithAnalytics'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب تحليلات العملاء الكاملة`)
    
    const supabase = await createClientServer()
    
    const { data: topCustomers, error: error1 } = await supabase
      .from('v_top_customers')
      .select('*')
      //.eq('storeid', storeid)

    if (error1) {
      logError(`${functionName}::getTopCustomers`, error1, { storeid })
      throw error1
    }

    const { data: debts, error: error2 } = await supabase
      .from('v_customer_debts')
      .select('*')
      //.eq('storeid', storeid)

    if (error2) {
      logError(`${functionName}::getDebts`, error2, { storeid })
      throw error2
    }

    // Merge data
    const debtMap = new Map((debts || []).map((d: any) => [d.customer_id, d]))
    
    const result = (topCustomers || []).map((customer: any) => ({
      ...customer,
      debt_info: debtMap.get(customer.id) || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} عميل مع التحليلات`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب التحليلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}