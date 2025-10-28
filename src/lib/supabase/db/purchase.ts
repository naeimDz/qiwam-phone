// lib/supabase/db/purchase.ts
// DB Layer - Purchase transactions (invoices) with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Purchase, PurchaseInsert, PurchaseWithDetails } from '@/lib/types'


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
 * Get all purchases for a store
 */
export async function getPurchasesByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<PurchaseWithDetails[]> {
  const functionName = 'getPurchasesByStore'
  
  try {
    if (!storeid) {
      throw new Error('storeid مطلوب')
    }

    console.log(`[${functionName}] البدء: storeid=${storeid}, limit=${limit}, offset=${offset}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase')
      .select(`
        *,
        supplier:supplierid(name, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('docdate', { ascending: false })
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد عمليات شراء للمتجر: ${storeid}`)
    }
    
    // Get items count for each purchase
    const purchasesWithCounts = await Promise.all(
      data.map(async (purchase) => {
        try {
          const { count, error: countError } = await supabase
            .from('purchase_item')
            .select('*', { count: 'exact', head: true })
            .eq('purchaseid', purchase.id)
          
          if (countError) {
            logError(`${functionName}::getItemsCount`, countError, { purchaseid: purchase.id })
            console.warn(`تحذير: فشل في الحصول على عدد العناصر لفاتورة الشراء ${purchase.id}`)
          }

          return {
            ...purchase,
            supplier_name: purchase.supplier?.name || null,
            supplier_phone: purchase.supplier?.phone || null,
            created_by_name: purchase.created_by?.fullname || null,
            items_count: count || 0
          }
        } catch (err) {
          logError(`${functionName}::processItem`, err, { purchaseid: purchase.id })
          return {
            ...purchase,
            supplier_name: purchase.supplier?.name || null,
            supplier_phone: purchase.supplier?.phone || null,
            created_by_name: purchase.created_by?.fullname || null,
            items_count: 0
          }
        }
      })
    )
    
    console.log(`[${functionName}] تم بنجاح: ${purchasesWithCounts.length} فاتورة شراء`)
    return purchasesWithCounts
  } catch (error: any) {
    logError(functionName, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب عمليات الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get purchase by ID with full details
 */
export async function getPurchaseById(purchaseId: string): Promise<PurchaseWithDetails | null> {
  const functionName = 'getPurchaseById'
  
  try {
    if (!purchaseId) {
      throw new Error('purchaseId مطلوب')
    }

    console.log(`[${functionName}] البدء: purchaseId=${purchaseId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase')
      .select(`
        *,
        supplier:supplierid(name, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('id', purchaseId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] فاتورة الشراء غير موجودة: ${purchaseId}`)
        return null
      }
      logError(functionName, error, { purchaseId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات لفاتورة الشراء: ${purchaseId}`)
      return null
    }
    
    // Get items count
    const { count, error: countError } = await supabase
      .from('purchase_item')
      .select('*', { count: 'exact', head: true })
      .eq('purchaseid', purchaseId)
    
    if (countError) {
      logError(`${functionName}::getItemsCount`, countError, { purchaseId })
      console.warn(`تحذير: فشل في الحصول على عدد العناصر`)
    }
    
    const result = {
      ...data,
      supplier_name: data.supplier?.name || null,
      supplier_phone: data.supplier?.phone || null,
      created_by_name: data.created_by?.fullname || null,
      items_count: count || 0
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { purchaseId })
    throw new Error(`فشل في جلب فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get purchases by date range
 */
export async function getPurchasesByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<PurchaseWithDetails[]> {
  const functionName = 'getPurchasesByDateRange'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: storeid=${storeid}, من ${startDate.toISOString()} إلى ${endDate.toISOString()}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase')
      .select(`
        *,
        supplier:supplierid(name, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .gte('docdate', startDate.toISOString())
      .lte('docdate', endDate.toISOString())
      .is('deleted_at', null)
      .order('docdate', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد عمليات شراء في النطاق المحدد`)
    }
    
    const purchasesWithCounts = await Promise.all(
      data.map(async (purchase) => {
        try {
          const { count, error: countError } = await supabase
            .from('purchase_item')
            .select('*', { count: 'exact', head: true })
            .eq('purchaseid', purchase.id)
          
          if (countError) {
            logError(`${functionName}::getItemsCount`, countError, { purchaseid: purchase.id })
          }

          return {
            ...purchase,
            supplier_name: purchase.supplier?.name || null,
            supplier_phone: purchase.supplier?.phone || null,
            created_by_name: purchase.created_by?.fullname || null,
            items_count: count || 0
          }
        } catch (err) {
          logError(`${functionName}::processItem`, err, { purchaseid: purchase.id })
          return {
            ...purchase,
            supplier_name: purchase.supplier?.name || null,
            supplier_phone: purchase.supplier?.phone || null,
            created_by_name: purchase.created_by?.fullname || null,
            items_count: 0
          }
        }
      })
    )
    
    console.log(`[${functionName}] تم بنجاح: ${purchasesWithCounts.length} فاتورة شراء`)
    return purchasesWithCounts
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب عمليات الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get purchase by document number
 */
export async function getPurchaseByDocNumber(
  storeid: string, 
  docnumber: string
): Promise<PurchaseWithDetails | null> {
  const functionName = 'getPurchaseByDocNumber'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!docnumber) throw new Error('docnumber مطلوب')

    console.log(`[${functionName}] البدء: storeid=${storeid}, docnumber=${docnumber}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase')
      .select(`
        *,
        supplier:supplierid(name, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .eq('docnumber', docnumber)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] فاتورة الشراء غير موجودة: ${docnumber}`)
        return null
      }
      logError(functionName, error, { storeid, docnumber })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات لفاتورة الشراء: ${docnumber}`)
      return null
    }
    
    const { count, error: countError } = await supabase
      .from('purchase_item')
      .select('*', { count: 'exact', head: true })
      .eq('purchaseid', data.id)
    
    if (countError) {
      logError(`${functionName}::getItemsCount`, countError, { purchaseid: data.id })
    }
    
    const result = {
      ...data,
      supplier_name: data.supplier?.name || null,
      supplier_phone: data.supplier?.phone || null,
      created_by_name: data.created_by?.fullname || null,
      items_count: count || 0
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, docnumber })
    throw new Error(`فشل في جلب فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new purchase (invoice header)
 */
export async function insertPurchase(data: PurchaseInsert): Promise<Purchase> {
  const functionName = 'insertPurchase'
  
  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    //if (!data.docnumber) throw new Error('docnumber مطلوب')

    console.log(`[${functionName}] البدء: إنشاء فاتورة شراء جديدة للمتجر ${data.storeid}`)
    
    const supabase = await createClientServer()
    
    const { data: purchase, error } = await supabase
      .from('purchase')
      .insert([{
        ...data,
        total: 0,
        paidamount: 0,
        remainingamount: 0
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { 
        storeid: data.storeid, 
        //docnumber: data.docnumber 
      })
      throw error
    }

    if (!purchase) {
      throw new Error('فشل في إرجاع فاتورة الشراء المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح: فاتورة الشراء ${purchase.id}`)
    return purchase
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إنشاء فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update purchase basic info (supplier, notes only)
 * DO NOT update total/paidamount - triggers handle it
 */
export async function updatePurchaseBasic(
  purchaseId: string,
  supplierid: string | null,
  notes: string | null
): Promise<Purchase> {
  const functionName = 'updatePurchaseBasic'
  
  try {
    if (!purchaseId) throw new Error('purchaseId مطلوب')

    console.log(`[${functionName}] البدء: تحديث فاتورة الشراء ${purchaseId}`)
    
    const supabase = await createClientServer()
    
    const { data, error } = await supabase
      .from('purchase')
      .update({
        supplierid,
        notes,
        updatedat: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('فاتورة الشراء غير موجودة أو محذوفة')
      }
      logError(functionName, error, { purchaseId, supplierid })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع فاتورة الشراء المُحدثة')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { purchaseId, supplierid, notes })
    throw new Error(`فشل في تحديث فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Cancel purchase (soft delete items, revert stock)
 */
export async function cancelPurchase(purchaseId: string): Promise<void> {
  const functionName = 'cancelPurchase'
  
  try {
    if (!purchaseId) throw new Error('purchaseId مطلوب')

    console.log(`[${functionName}] البدء: إلغاء فاتورة الشراء ${purchaseId}`)
    
    const supabase = await createClientServer()
    
    const { error } = await supabase
      .from('purchase')
      .update({ 
        status: 'cancelled',
        updatedat: new Date().toISOString()
      })
      .eq('id', purchaseId)

    if (error) {
      logError(functionName, error, { purchaseId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: فاتورة الشراء ${purchaseId} ملغاة`)
  } catch (error: any) {
    logError(functionName, error, { purchaseId })
    throw new Error(`فشل في إلغاء فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Generate next document number for purchase
 */
export async function generatePurchaseDocNumber(storeid: string): Promise<string> {
  const functionName = 'generatePurchaseDocNumber'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: توليد رقم فاتورة شراء جديد`)
    
    const supabase = await createClientServer()
    
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('purchase')
      .select('docnumber')
      .eq('storeid', storeid)
      .gte('createdat', `${today}T00:00:00`)
      .order('createdat', { ascending: false })
      .limit(1)

    if (error) {
      logError(functionName, error, { storeid, today })
      throw error
    }

    let nextNumber = 1
    if (data && data.length > 0 && data[0].docnumber) {
      try {
        const lastNumber = parseInt(data[0].docnumber.split('-').pop() || '0')
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1
        }
      } catch (parseErr) {
        console.warn(`[${functionName}] تحذير: فشل في تحليل رقم الفاتورة الأخيرة`)
      }
    }
    
    const dateStr = today.replace(/-/g, '')
    const docNumber = `PUR-${dateStr}-${nextNumber.toString().padStart(4, '0')}`

    console.log(`[${functionName}] تم بنجاح: ${docNumber}`)
    return docNumber
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في توليد رقم فاتورة الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get purchases summary stats
 */
export async function getPurchasesSummary(storeid: string, days: number = 30) {
  const functionName = 'getPurchasesSummary'
  
  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1) throw new Error('عدد الأيام يجب أن يكون أكبر من 0')

    console.log(`[${functionName}] البدء: حساب إحصائيات آخر ${days} يوم`)
    
    const supabase = await createClientServer()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('purchase')
      .select('total, paidamount, status')
      .eq('storeid', storeid)
      .gte('docdate', startDate.toISOString())
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات للفترة المحددة`)
      return getEmptyStats()
    }
    
    const stats = {
      total_purchases: 0,
      total_amount: 0,
      total_paid: 0,
      total_remaining: 0,
      completed_purchases: 0,
      cancelled_purchases: 0
    }
    
    try {
      data.forEach(purchase => {
        stats.total_purchases++
        stats.total_amount += Number(purchase.total) || 0
        stats.total_paid += Number(purchase.paidamount) || 0
        
        if (purchase.status === 'cancelled') {
          stats.cancelled_purchases++
        } else if (purchase.status === 'posted') {
          stats.completed_purchases++
        }
      })
      
      stats.total_remaining = stats.total_amount - stats.total_paid
    } catch (calcErr) {
      logError(`${functionName}::calculateStats`, calcErr, { totalRecords: data.length })
      console.error('خطأ في حساب الإحصائيات')
    }

    console.log(`[${functionName}] تم بنجاح: ${stats.total_purchases} فاتورة شراء، إجمالي ${stats.total_amount}`)
    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب إحصائيات الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Helper function to return empty stats
 */
function getEmptyStats() {
  return {
    total_purchases: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
    completed_purchases: 0,
    cancelled_purchases: 0
  }
}