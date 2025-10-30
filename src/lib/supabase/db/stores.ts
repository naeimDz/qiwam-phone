// lib/supabase/db/store.ts
// DB Layer - Store and Store Settings queries with error handling

import { createClientServer } from '@/lib/supabase'
import { Store, StoreSettings } from '@/lib/types'
import { cache } from 'react'

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

// ==================== Store Operations ====================

/**
 * Get store by ID
 */
export const getStoreById = cache(async (storeid: string) => {
  const functionName = 'getStoreById'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] 🚀 RUNNING (Cache Miss):البدء: جلب المتجر ${storeid}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .eq('id', storeid)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] المتجر غير موجود`)
        return null
      }
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات المتجر فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب المتجر: ${error?.message || 'خطأ غير معروف'}`)
  }
})

/**
 * Check if store is active and within subscription period
 */
export async function isStoreActive(storeid: string): Promise<boolean> {
  const functionName = 'isStoreActive'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: فحص حالة المتجر ${storeid}`)
    
    const store = await getStoreById(storeid)
    if (!store) {
      console.log(`[${functionName}] المتجر غير موجود`)
      return false
    }
    
    // Check if active flag is true
    if (!store.active) {
      console.log(`[${functionName}] المتجر معطل`)
      return false
    }
    
    // Check if within subscription period
    if (store.enddate) {
      const now = new Date()
      const endDate = new Date(store.enddate)
      if (now > endDate) {
        console.log(`[${functionName}] الاشتراك منتهي`)
        return false
      }
    }
    
    console.log(`[${functionName}] تم بنجاح: المتجر نشط`)
    return true
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في فحص حالة المتجر: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== Store Settings Operations ====================

/**
 * Get store settings
 */
export const getStoreSettings= cache(async(storeid: string)=> {
  const functionName = 'getStoreSettings'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}]  🚀 RUNNING (Cache Miss): البدء: جلب إعدادات المتجر ${storeid}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الإعدادات غير موجودة`)
        return null
      }
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] بيانات الإعدادات فارغة`)
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الإعدادات: ${error?.message || 'خطأ غير معروف'}`)
  }
})

/**
 * Update store settings
 * Triggers: تحديث audit_log عند تغيير الإعدادات
 */
export async function updateStoreSettings(
  storeid: string,
  updates: Partial<Omit<StoreSettings, 'storeid' | 'createdat' | 'updatedat' | 'deleted_at'>>
): Promise<StoreSettings> {
  const functionName = 'updateStoreSettings'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    console.log(`[${functionName}] البدء: تحديث الإعدادات للمتجر ${storeid}`)
    
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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإعدادات غير موجودة أو محذوفة')
      }
      logError(functionName, error, { storeid, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإعدادات المُحدّثة')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, updates })
    throw new Error(`فشل في تحديث الإعدادات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Create initial store settings (called on store creation)
 */
export async function createStoreSettings(storeid: string): Promise<StoreSettings> {
  const functionName = 'createStoreSettings'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: إنشاء إعدادات افتراضية للمتجر ${storeid}`)
    
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
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('store_settings')
      .insert([defaultSettings])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإعدادات المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في إنشاء الإعدادات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get store with settings (combined query)
 */
export const getStoreWithSettings = cache(async (storeid: string) => {
  const functionName = 'getStoreWithSettings'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    console.log(`[${functionName}] 🚀 RUNNING (Cache Miss): جلب المتجر والإعدادات لـ ${storeid}`)    

    const [store, settings] = await Promise.all([
      getStoreById(storeid),
      getStoreSettings(storeid)
    ])
    
    if (!store) {
      throw new Error('المتجر غير موجود')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return { store, settings }
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب بيانات المتجر: ${error?.message || 'خطأ غير معروف'}`)
  }
})
