// lib/supabase/db/sales.ts
// DB Layer - Sales transactions
// Queries only - NO validation, NO business logic

import { createClientServer } from '@/lib/supabase'
import { Sale, SaleWithDetails } from '@/lib/types'

type SaleInsert = Omit<Sale, 'id' | 'total' | 'paidamount' | 'remainingamount' | 'createdat' | 'updatedat' | 'deleted_at'>

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

// ==================== READ OPERATIONS ====================

/**
 * Get all sales for a store
 */
export async function getSalesByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<SaleWithDetails[]> {
  const functionName = 'getSalesByStore'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .select(`
        *,
        customer:customerid(fullname, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('docdate', { ascending: false })
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return []

    // Get items count
    const salesWithCounts = await Promise.all(
      data.map(async (sale) => {
        try {
          const { count } = await supabase
            .from('sale_item')
            .select('*', { count: 'exact', head: true })
            .eq('saleid', sale.id)

          return {
            ...sale,
            customer_name: sale.customer?.fullname || null,
            customer_phone: sale.customer?.phone || null,
            created_by_name: sale.created_by?.fullname || null,
            items_count: count || 0
          }
        } catch (err) {
          return {
            ...sale,
            customer_name: sale.customer?.fullname || null,
            customer_phone: sale.customer?.phone || null,
            created_by_name: sale.created_by?.fullname || null,
            items_count: 0
          }
        }
      })
    )

    return salesWithCounts
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب المبيعات: ${error?.message}`)
  }
}

/**
 * Get sale by ID
 */
export async function getSaleById(saleId: string): Promise<SaleWithDetails | null> {
  const functionName = 'getSaleById'

  try {
    if (!saleId) throw new Error('saleId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .select(`
        *,
        customer:customerid(fullname, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('id', saleId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logError(functionName, error, { saleId })
      throw error
    }

    if (!data) return null

    // Get items count
    const { count } = await supabase
      .from('sale_item')
      .select('*', { count: 'exact', head: true })
      .eq('saleid', saleId)

    return {
      ...data,
      customer_name: data.customer?.fullname || null,
      customer_phone: data.customer?.phone || null,
      created_by_name: data.created_by?.fullname || null,
      items_count: count || 0
    }
  } catch (error: any) {
    logError(functionName, error, { saleId })
    throw new Error(`فشل في جلب الفاتورة: ${error?.message}`)
  }
}

/**
 * Get sales by date range
 */
export async function getSalesByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50,
  offset: number = 0
): Promise<SaleWithDetails[]> {
  const functionName = 'getSalesByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .select(`
        *,
        customer:customerid(fullname, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .gte('docdate', startDate.toISOString())
      .lte('docdate', endDate.toISOString())
      .is('deleted_at', null)
      .order('docdate', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data) return []

    const salesWithCounts = await Promise.all(
      data.map(async (sale) => {
        try {
          const { count } = await supabase
            .from('sale_item')
            .select('*', { count: 'exact', head: true })
            .eq('saleid', sale.id)

          return {
            ...sale,
            customer_name: sale.customer?.fullname || null,
            customer_phone: sale.customer?.phone || null,
            created_by_name: sale.created_by?.fullname || null,
            items_count: count || 0
          }
        } catch (err) {
          return {
            ...sale,
            customer_name: sale.customer?.fullname || null,
            customer_phone: sale.customer?.phone || null,
            created_by_name: sale.created_by?.fullname || null,
            items_count: 0
          }
        }
      })
    )

    return salesWithCounts
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب المبيعات: ${error?.message}`)
  }
}

/**
 * Get sale by document number
 */
export async function getSaleByDocNumber(
  storeid: string,
  docnumber: string
): Promise<SaleWithDetails | null> {
  const functionName = 'getSaleByDocNumber'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!docnumber) throw new Error('docnumber مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .select(`
        *,
        customer:customerid(fullname, phone),
        created_by:createdbyid(fullname)
      `)
      .eq('storeid', storeid)
      .eq('docnumber', docnumber)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      logError(functionName, error, { storeid, docnumber })
      throw error
    }

    if (!data) return null

    const { count } = await supabase
      .from('sale_item')
      .select('*', { count: 'exact', head: true })
      .eq('saleid', data.id)

    return {
      ...data,
      customer_name: data.customer?.fullname || null,
      customer_phone: data.customer?.phone || null,
      created_by_name: data.created_by?.fullname || null,
      items_count: count || 0
    }
  } catch (error: any) {
    logError(functionName, error, { storeid, docnumber })
    throw new Error(`فشل في جلب الفاتورة: ${error?.message}`)
  }
}

// ==================== WRITE OPERATIONS ====================

/**
 * Insert new sale
 * Triggers automatically:
 *    - tr_auto_assign_doc_sequence
 *    - tr_audit_sale_changes
 */
export async function insertSale(data: SaleInsert): Promise<Sale> {
  const functionName = 'insertSale'

  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.docnumber) throw new Error('docnumber مطلوب')

    const supabase = await createClientServer()

    const { data: sale, error } = await supabase
      .from('sale')
      .insert([{
        ...data,
        total: 0,
        paidamount: 0,
        remainingamount: 0
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid: data.storeid })
      throw error
    }

    if (!sale) {
      throw new Error('فشل في إرجاع الفاتورة المنشأة')
    }

    return sale
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إنشاء الفاتورة: ${error?.message}`)
  }
}

/**
 * Update sale basic info
 * Triggers automatically:
 *    - tr_audit_sale_changes
 */
export async function updateSaleBasic(
  saleId: string,
  customerid: string | null,
  notes: string | null
): Promise<Sale> {
  const functionName = 'updateSaleBasic'

  try {
    if (!saleId) throw new Error('saleId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .update({
        customerid,
        notes,
        updatedat: new Date().toISOString()
      })
      .eq('id', saleId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الفاتورة غير موجودة أو محذوفة')
      }
      logError(functionName, error, { saleId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الفاتورة المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { saleId })
    throw new Error(`فشل في تحديث الفاتورة: ${error?.message}`)
  }
}

/**
 * Update sale status (draft → posted → cancelled)
 * Triggers automatically:
 *    - tr_audit_sale_changes
 */
export async function updateSaleStatus(
  saleId: string,
  status: 'draft' | 'posted' | 'cancelled'
): Promise<Sale> {
  const functionName = 'updateSaleStatus'

  try {
    if (!saleId) throw new Error('saleId مطلوب')
    if (!['draft', 'posted', 'cancelled'].includes(status)) throw new Error('status غير صحيح')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('sale')
      .update({
        status,
        updatedat: new Date().toISOString()
      })
      .eq('id', saleId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الفاتورة غير موجودة')
      }
      logError(functionName, error, { saleId, status })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الفاتورة المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { saleId, status })
    throw new Error(`فشل في تحديث حالة الفاتورة: ${error?.message}`)
  }
}

/**
 * Generate next document number for today
 */
export async function generateNextDocNumber(storeid: string): Promise<string> {
  const functionName = 'generateNextDocNumber'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('sale')
      .select('docnumber')
      .eq('storeid', storeid)
      .gte('createdat', `${today}T00:00:00`)
      .order('createdat', { ascending: false })
      .limit(1)

    if (error) {
      logError(functionName, error, { storeid })
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
        // Use default next number
      }
    }

    const dateStr = today.replace(/-/g, '')
    return `INV-${dateStr}-${nextNumber.toString().padStart(4, '0')}`
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في توليد رقم الفاتورة: ${error?.message}`)
  }
}

/**
 * Get sales summary stats
 */
export async function getSalesSummary(storeid: string, days: number = 30) {
  const functionName = 'getSalesSummary'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1) throw new Error('عدد الأيام يجب أن يكون أكبر من 0')

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('sale')
      .select('total, paidamount, status, saletype')
      .eq('storeid', storeid)
      .gte('docdate', startDate.toISOString())
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      return getEmptySalesSummary()
    }

    const stats = {
      total_sales: 0,
      total_amount: 0,
      total_paid: 0,
      total_remaining: 0,
      cash_sales: 0,
      credit_sales: 0,
      cancelled_sales: 0
    }

    data.forEach(sale => {
      stats.total_sales++
      stats.total_amount += Number(sale.total) || 0
      stats.total_paid += Number(sale.paidamount) || 0

      if (sale.status === 'cancelled') {
        stats.cancelled_sales++
      } else {
        if (sale.saletype === 'cash') stats.cash_sales++
        if (sale.saletype === 'credit') stats.credit_sales++
      }
    })

    stats.total_remaining = stats.total_amount - stats.total_paid

    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message}`)
  }
}

// ==================== HELPERS ====================

function getEmptySalesSummary() {
  return {
    total_sales: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
    cash_sales: 0,
    credit_sales: 0,
    cancelled_sales: 0
  }
}