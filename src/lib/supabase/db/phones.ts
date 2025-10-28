// lib/supabase/db/phones.ts
// DB Layer - Phone inventory queries with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Phone, PhoneWithDetails, ProductStatus } from '@/lib/types'

type PhoneInsert = Omit<Phone, 'id' | 'createdat' | 'updatedat' | 'deleted_at'>
type PhoneUpdate = Partial<Omit<Phone, 'id' | 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>

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
 * Get all phones for a store (any status)
 */
export async function getPhonesByStore(storeid: string): Promise<PhoneWithDetails[]> {
  const functionName = 'getPhonesByStore'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب جميع الهواتف للمتجر ${storeid}`)
    
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

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return []
    }

    const result = data.map(p => ({
      ...p,
      brand_name: p.brand?.name || null,
      supplier_name: p.supplier?.name || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} هاتف`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الهواتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get available phones only (status='available')
 */
export async function getAvailablePhones(storeid: string): Promise<PhoneWithDetails[]> {
  const functionName = 'getAvailablePhones'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الهواتف المتاحة للمتجر ${storeid}`)
    
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

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد هواتف متاحة`)
      return []
    }

    const result = data.map(p => ({
      ...p,
      brand_name: p.brand?.name || null,
      supplier_name: p.supplier?.name || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} هاتف متاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الهواتف المتاحة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get phone by ID
 */
export async function getPhoneById(phoneId: string): Promise<PhoneWithDetails | null> {
  const functionName = 'getPhoneById'
  
  try {
    if (!phoneId) throw new Error('phoneId مطلوب')

    console.log(`[${functionName}] البدء: جلب الهاتف ${phoneId}`)
    
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
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الهاتف غير موجود`)
        return null
      }
      logError(functionName, error, { phoneId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات الهاتف فارغة`)
      return null
    }

    const result = {
      ...data,
      brand_name: data.brand?.name || null,
      supplier_name: data.supplier?.name || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { phoneId })
    throw new Error(`فشل في جلب الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Search phone by IMEI
 */
export async function getPhoneByImei(storeid: string, imei: string): Promise<PhoneWithDetails | null> {
  const functionName = 'getPhoneByImei'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!imei) throw new Error('IMEI مطلوب')

    console.log(`[${functionName}] البدء: البحث عن IMEI ${imei}`)
    
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
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الهاتف بـ IMEI ${imei} غير موجود`)
        return null
      }
      logError(functionName, error, { storeid, imei })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات الهاتف فارغة`)
      return null
    }

    const result = {
      ...data,
      brand_name: data.brand?.name || null,
      supplier_name: data.supplier?.name || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, imei })
    throw new Error(`فشل في البحث عن الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new phone
 * Triggers: تحديث audit_log و stock_movement (if needed)
 */
export async function insertPhone(data: PhoneInsert): Promise<Phone> {
  const functionName = 'insertPhone'
  
  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.imei) throw new Error('IMEI مطلوب')
    if (!data.name) throw new Error('الاسم مطلوب')
    if (data.buyprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')
    if (data.sellprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')
    if (data.warranty_months < 0) throw new Error('مدة الضمان لا يمكن أن تكون سالبة')

    console.log(`[${functionName}] البدء: إضافة هاتف جديد`, {
      imei: data.imei,
      name: data.name,
      status: data.status
    })
    
    const supabase = await createClientServer()
    
    const { data: phone, error } = await supabase
      .from('phone')
      .insert([{
        ...data,
        status: data.status || 'available'
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { data })
      throw error
    }

    if (!phone) {
      throw new Error('فشل في إرجاع الهاتف المُضاف')
    }

    console.log(`[${functionName}] تم بنجاح: الهاتف ${phone.id}`)
    return phone
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إضافة الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update phone details (name, model, warranty, notes, prices)
 * DO NOT update status here - use updatePhoneStatus instead
 */
export async function updatePhone(phoneId: string, updates: PhoneUpdate): Promise<Phone> {
  const functionName = 'updatePhone'
  
  try {
    if (!phoneId) throw new Error('phoneId مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    // Validate numeric fields
    if (updates.buyprice !== undefined && updates.buyprice < 0) throw new Error('سعر الشراء لا يمكن أن يكون سالب')
    if (updates.sellprice !== undefined && updates.sellprice < 0) throw new Error('سعر البيع لا يمكن أن يكون سالب')
    if (updates.warranty_months !== undefined && updates.warranty_months < 0) throw new Error('مدة الضمان لا يمكن أن تكون سالبة')

    console.log(`[${functionName}] البدء: تحديث الهاتف ${phoneId}`, updates)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الهاتف غير موجود أو محذوف')
      }
      logError(functionName, error, { phoneId, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الهاتف المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { phoneId, updates })
    throw new Error(`فشل في تحديث الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update phone status (available → sold, returned, etc)
 * Triggers: تحديث audit_log و stock_movement عند بيع أو إرجاع
 */
export async function updatePhoneStatus(phoneId: string, status: ProductStatus): Promise<Phone> {
  const functionName = 'updatePhoneStatus'
  
  try {
    if (!phoneId) throw new Error('phoneId مطلوب')
    if (!status) throw new Error('الحالة مطلوبة')
    
    const validStatuses: ProductStatus[] = ['available', 'sold', 'returned', 'damaged', 'reserved']
    if (!validStatuses.includes(status)) {
      throw new Error(`حالة غير صحيحة: ${status}`)
    }

    console.log(`[${functionName}] البدء: تحديث حالة الهاتف ${phoneId} إلى ${status}`)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الهاتف غير موجود أو محذوف')
      }
      logError(functionName, error, { phoneId, status })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الهاتف المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { phoneId, status })
    throw new Error(`فشل في تحديث حالة الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Soft delete phone
 */
export async function deletePhone(phoneId: string): Promise<void> {
  const functionName = 'deletePhone'
  
  try {
    if (!phoneId) throw new Error('phoneId مطلوب')

    console.log(`[${functionName}] البدء: حذف الهاتف ${phoneId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('phone')
      .update({ 
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString()
      })
      .eq('id', phoneId)

    if (error) {
      logError(functionName, error, { phoneId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: الهاتف ${phoneId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { phoneId })
    throw new Error(`فشل في حذف الهاتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Check if IMEI exists in store
 */
export async function imeiExists(storeid: string, imei: string, excludeId?: string): Promise<boolean> {
  const functionName = 'imeiExists'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!imei) throw new Error('IMEI مطلوب')

    console.log(`[${functionName}] البدء: فحص تكرار IMEI ${imei}`)
    
    const supabase = await createClientServer()
    
    let query = supabase
      .from('phone')
      .select('id', { count: 'exact', head: true })
      .eq('storeid', storeid)
      .eq('imei', imei)
      .is('deleted_at', null)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error, count } = await query

    if (error) {
      logError(functionName, error, { storeid, imei })
      throw error
    }

    const exists = (count || 0) > 0
    console.log(`[${functionName}] تم بنجاح: IMEI موجود = ${exists}`)
    return exists
  } catch (error: any) {
    logError(functionName, error, { storeid, imei, excludeId })
    throw new Error(`فشل في فحص IMEI: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get phones count by status
 */
export async function getPhonesCountByStatus(storeid: string) {
  const functionName = 'getPhonesCountByStatus'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: حساب إحصائيات الهواتف`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('phone')
      .select('status')
      .eq('storeid', storeid)
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات`)
      return getEmptyPhoneCounts()
    }
    
    const counts = {
      available: 0,
      sold: 0,
      returned: 0,
      damaged: 0,
      reserved: 0,
      total: data.length
    }
    
    data.forEach(p => {
      const status = p.status as ProductStatus
      if (status in counts) {
        counts[status]++
      }
    })
    
    console.log(`[${functionName}] تم بنجاح: ${counts.total} هاتف`)
    return counts
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في حساب إحصائيات الهواتف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Helper function to return empty phone counts
 */
function getEmptyPhoneCounts() {
  return {
    available: 0,
    sold: 0,
    returned: 0,
    damaged: 0,
    reserved: 0,
    total: 0
  }
}