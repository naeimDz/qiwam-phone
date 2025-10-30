// lib/supabase/db/suppliers.ts
// DB Layer - Supplier queries with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Supplier } from '@/lib/types'

type SupplierInsert = Omit<Supplier, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type SupplierUpdate = Partial<Omit<Supplier, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

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
 * Get all suppliers for a store (tenant-isolated)
 */
export async function getSuppliersByStore(
  storeid: string,
  activeOnly: boolean = false
): Promise<Supplier[]> {
  const functionName = 'getSuppliersByStore'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الموردين للمتجر ${storeid}`, { activeOnly })
    
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

    if (error) {
      logError(functionName, error, { storeid, activeOnly })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} مورد`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, activeOnly })
    throw new Error(`فشل في جلب الموردين: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(supplierId: string): Promise<Supplier | null> {
  const functionName = 'getSupplierById'
  
  try {
    if (!supplierId) throw new Error('supplierId مطلوب')

    console.log(`[${functionName}] البدء: جلب المورد ${supplierId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('id', supplierId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] المورد غير موجود`)
        return null
      }
      logError(functionName, error, { supplierId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات المورد فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { supplierId })
    throw new Error(`فشل في جلب المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new supplier
 * Triggers: تحديث audit_log
 */
export async function insertSupplier(data: SupplierInsert): Promise<Supplier> {
  const functionName = 'insertSupplier'
  
  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.name) throw new Error('اسم المورد مطلوب')

    console.log(`[${functionName}] البدء: إضافة مورد جديد`, { name: data.name })
    
    const supabase = await createClientServer()
    
    const { data: supplier, error } = await supabase
      .from('supplier')
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

    if (!supplier) {
      throw new Error('فشل في إرجاع المورد المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: المورد ${supplier.id}`)
    return supplier
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update supplier details
 * Triggers: تحديث audit_log
 */
export async function updateSupplier(supplierId: string, updates: SupplierUpdate): Promise<Supplier> {
  const functionName = 'updateSupplier'
  
  try {
    if (!supplierId) throw new Error('supplierId مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    console.log(`[${functionName}] البدء: تحديث المورد ${supplierId}`, updates)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('المورد غير موجود أو محذوف')
      }
      logError(functionName, error, { supplierId, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع المورد المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { supplierId, updates })
    throw new Error(`فشل في تحديث المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Soft delete supplier
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  const functionName = 'deleteSupplier'
  
  try {
    if (!supplierId) throw new Error('supplierId مطلوب')

    console.log(`[${functionName}] البدء: حذف المورد ${supplierId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('supplier')
      .update({ 
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString()
      })
      .eq('id', supplierId)

    if (error) {
      logError(functionName, error, { supplierId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: المورد ${supplierId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { supplierId })
    throw new Error(`فشل في حذف المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Toggle supplier active status
 */
export async function toggleSupplierActive(supplierId: string, active: boolean): Promise<Supplier> {
  const functionName = 'toggleSupplierActive'
  
  try {
    if (!supplierId) throw new Error('supplierId مطلوب')

    console.log(`[${functionName}] البدء: تحديث حالة المورد ${supplierId} إلى ${active}`)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('المورد غير موجود أو محذوف')
      }
      logError(functionName, error, { supplierId, active })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع المورد المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { supplierId, active })
    throw new Error(`فشل في تحديث حالة المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Check if supplier name exists in store (for validation)
 */
export async function supplierNameExists(
  storeid: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const functionName = 'supplierNameExists'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!name) throw new Error('اسم المورد مطلوب')

    console.log(`[${functionName}] البدء: فحص تكرار الاسم "${name}"`)
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('supplier')
      .select('id', { count: 'exact', head: true })
      .eq('storeid', storeid)
      .eq('name', name)
      .is('deleted_at', null)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { error, count } = await query

    if (error) {
      logError(functionName, error, { storeid, name })
      throw error
    }

    const exists = (count || 0) > 0
    console.log(`[${functionName}] تم بنجاح: الاسم موجود = ${exists}`)
    return exists
  } catch (error: any) {
    logError(functionName, error, { storeid, name, excludeId })
    throw new Error(`فشل في فحص اسم المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Top suppliers view - أفضل الموردين
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
  const functionName = 'getTopSuppliers'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1) throw new Error('الحد يجب أن يكون أكبر من 0')

    console.log(`[${functionName}] البدء: جلب أفضل ${limit} مورد`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_top_suppliers')
      .select('*')
      //.eq('storeid', storeid)
      .order('total_paid', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, limit })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} مورد`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, limit })
    throw new Error(`فشل في جلب أفضل الموردين: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Supplier debts view - ديون الموردين
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
  const functionName = 'getSupplierDebts'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب ديون الموردين`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_supplier_debts')
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

    console.log(`[${functionName}] تم بنجاح: ${data.length} مورد مدين`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب ديون الموردين: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get supplier debts above a threshold
 */
export async function getSupplierDebtsByThreshold(
  storeid: string,
  minDebt: number
): Promise<SupplierDebt[]> {
  const functionName = 'getSupplierDebtsByThreshold'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (minDebt < 0) throw new Error('الحد الأدنى يجب أن يكون موجب')

    console.log(`[${functionName}] البدء: جلب الديون فوق ${minDebt}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('v_supplier_debts')
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

    console.log(`[${functionName}] تم بنجاح: ${data.length} مورد`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, minDebt })
    throw new Error(`فشل في جلب الديون: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get supplier with purchase details
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
  const functionName = 'getSupplierWithPurchaseCount'
  
  try {
    if (!supplierId) throw new Error('supplierId مطلوب')

    console.log(`[${functionName}] البدء: جلب المورد مع عد الفواتير ${supplierId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('id', supplierId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] المورد غير موجود`)
        return null
      }
      logError(functionName, error, { supplierId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات المورد فارغة`)
      return null
    }

    // Count active purchases with remaining amount
    const { data: purchases, error: purchaseError, count } = await supabase
      .from('purchase')
      .select('id', { count: 'exact', head: true })
      .eq('supplierid', supplierId)
      .eq('status', 'posted')
      .gt('remainingamount', 0)
      .is('deleted_at', null)

    if (purchaseError) {
      logError(`${functionName}::countPurchases`, purchaseError, { supplierId })
      throw purchaseError
    }

    const result = {
      ...data,
      active_purchase_count: count || 0,
      can_delete: (count || 0) === 0
    }

    console.log(`[${functionName}] تم بنجاح: ${result.active_purchase_count} فاتورة نشطة`)
    return result
  } catch (error: any) {
    logError(functionName, error, { supplierId })
    throw new Error(`فشل في جلب المورد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get all suppliers with their purchase summary (analytics)
 */
export async function getAllSuppliersWithAnalytics(storeid: string) {
  const functionName = 'getAllSuppliersWithAnalytics'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب تحليلات الموردين الكاملة`)
    
    const supabase = await createClientServer()
    
    // Get top suppliers
    const { data: topSuppliers, error: error1 } = await supabase
      .from('v_top_suppliers')
      .select('*')
      //.eq('storeid', storeid)

    if (error1) {
      logError(`${functionName}::getTopSuppliers`, error1, { storeid })
      throw error1
    }

    // Get debts
    const { data: debts, error: error2 } = await supabase
      .from('v_supplier_debts')
      .select('*')
      //.eq('storeid', storeid)

    if (error2) {
      logError(`${functionName}::getDebts`, error2, { storeid })
      throw error2
    }

    // Merge data
    const debtMap = new Map((debts || []).map((d: any) => [d.id, d.total_debt]))
    
    const result = (topSuppliers || []).map((supplier: any) => ({
      ...supplier,
      total_debt: debtMap.get(supplier.id) || 0
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} مورد مع التحليلات`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب التحليلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}