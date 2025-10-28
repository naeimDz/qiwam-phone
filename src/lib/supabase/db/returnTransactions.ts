// lib/supabase/db/returnTransactions.ts
// DB Layer - Return transactions with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { ReturnTransaction, ReturnTransactionWithDetails, ReturnTransactionInsert } from '@/lib/types'

type ReturnTransactionUpdate = Partial<Omit<ReturnTransaction, 'id' | 'storeid' | 'createdat'>>

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
 * Get all returns for a store (paginated)
 */
export async function getReturnsByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ReturnTransactionWithDetails[]> {
  const functionName = 'getReturnsByStore'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: storeid=${storeid}, limit=${limit}, offset=${offset}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        sale:saleid(id, docnumber, customer:customerid(fullname, phone)),
        created_by:createdby(fullname),
        approved_by_user:approved_by(fullname),
        inspected_by_user:inspected_by(fullname)
      `)
      .eq('storeid', storeid)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إرجاعات للمتجر: ${storeid}`)
      return []
    }

    const result = data.map(r => ({
      ...r,
      product_name: r.item_type === 'phone' ? r.phone?.name || 'Phone (محذوف)' : r.accessory?.name || 'Accessory (محذوف)',
      customer_name: r.sale?.customer?.fullname || null,
      created_by_name: r.created_by?.fullname || 'System',
      approved_by_name: r.approved_by_user?.fullname || null,
      inspected_by_name: r.inspected_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إرجاع`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب الإرجاعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get returns for a specific sale
 */
export async function getReturnsBySale(saleId: string): Promise<ReturnTransactionWithDetails[]> {
  const functionName = 'getReturnsBySale'

  try {
    if (!saleId) throw new Error('saleId مطلوب')

    console.log(`[${functionName}] البدء: saleId=${saleId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        created_by:createdby(fullname),
        approved_by_user:approved_by(fullname),
        inspected_by_user:inspected_by(fullname)
      `)
      .eq('saleid', saleId)
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { saleId })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إرجاعات للفاتورة: ${saleId}`)
      return []
    }

    const result = data.map(r => ({
      ...r,
      product_name: r.item_type === 'phone' ? r.phone?.name || 'Phone (محذوف)' : r.accessory?.name || 'Accessory (محذوف)',
      customer_name: null,
      created_by_name: r.created_by?.fullname || 'System',
      approved_by_name: r.approved_by_user?.fullname || null,
      inspected_by_name: r.inspected_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إرجاع`)
    return result
  } catch (error: any) {
    logError(functionName, error, { saleId })
    throw new Error(`فشل في جلب الإرجاعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get returns by status
 */
export async function getReturnsByStatus(
  storeid: string,
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed',
  limit: number = 50,
  offset: number = 0
): Promise<ReturnTransactionWithDetails[]> {
  const functionName = 'getReturnsByStatus'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!['pending', 'approved', 'rejected', 'refunded', 'completed'].includes(status)) 
      throw new Error('status غير صحيح')

    console.log(`[${functionName}] البدء: status=${status}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        sale:saleid(id, docnumber, customer:customerid(fullname, phone)),
        created_by:createdby(fullname),
        approved_by_user:approved_by(fullname)
      `)
      .eq('storeid', storeid)
      .eq('status', status)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, status })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إرجاعات بحالة: ${status}`)
      return []
    }

    const result = data.map(r => ({
      ...r,
      product_name: r.item_type === 'phone' ? r.phone?.name || 'Phone (محذوف)' : r.accessory?.name || 'Accessory (محذوف)',
      customer_name: r.sale?.customer?.fullname || null,
      created_by_name: r.created_by?.fullname || 'System',
      approved_by_name: r.approved_by_user?.fullname || null,
      inspected_by_name: null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إرجاع`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, status })
    throw new Error(`فشل في جلب الإرجاعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get returns by date range
 */
export async function getReturnsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<ReturnTransactionWithDetails[]> {
  const functionName = 'getReturnsByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: من ${startDate.toISOString()} إلى ${endDate.toISOString()}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        sale:saleid(id, docnumber, customer:customerid(fullname, phone)),
        created_by:createdby(fullname),
        approved_by_user:approved_by(fullname)
      `)
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .order('createdat', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إرجاعات في النطاق المحدد`)
      return []
    }

    const result = data.map(r => ({
      ...r,
      product_name: r.item_type === 'phone' ? r.phone?.name || 'Phone (محذوف)' : r.accessory?.name || 'Accessory (محذوف)',
      customer_name: r.sale?.customer?.fullname || null,
      created_by_name: r.created_by?.fullname || 'System',
      approved_by_name: r.approved_by_user?.fullname || null,
      inspected_by_name: null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} إرجاع`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الإرجاعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get return by ID
 */
export async function getReturnById(returnId: string): Promise<ReturnTransactionWithDetails | null> {
  const functionName = 'getReturnById'

  try {
    if (!returnId) throw new Error('returnId مطلوب')

    console.log(`[${functionName}] البدء: returnId=${returnId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .select(`
        *,
        phone:phone_id(id, name),
        accessory:accessory_id(id, name),
        sale:saleid(id, docnumber, customer:customerid(fullname, phone)),
        created_by:createdby(fullname),
        approved_by_user:approved_by(fullname),
        inspected_by_user:inspected_by(fullname)
      `)
      .eq('id', returnId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الإرجاع غير موجود: ${returnId}`)
        return null
      }
      logError(functionName, error, { returnId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات للإرجاع: ${returnId}`)
      return null
    }

    const result = {
      ...data,
      product_name: data.item_type === 'phone' ? data.phone?.name || 'Phone (محذوف)' : data.accessory?.name || 'Accessory (محذوف)',
      customer_name: data.sale?.customer?.fullname || null,
      created_by_name: data.created_by?.fullname || 'System',
      approved_by_name: data.approved_by_user?.fullname || null,
      inspected_by_name: data.inspected_by_user?.fullname || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { returnId })
    throw new Error(`فشل في جلب الإرجاع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new return transaction
 * ✅ Triggers automatically:
 *    - update phone/accessory status
 *    - update sale paidamount
 *    - insert cash_movement (refund)
 *    - insert audit_log
 */
export async function insertReturn(data: ReturnTransactionInsert): Promise<ReturnTransaction> {
  const functionName = 'insertReturn'

  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.saleid) throw new Error('saleid مطلوب')
    if (!data.item_type) throw new Error('item_type مطلوب')
    if (!['phone', 'accessory'].includes(data.item_type)) throw new Error('item_type غير صحيح')
    if (!data.phone_id && !data.accessory_id) throw new Error('يجب تحديد phone_id أو accessory_id')
    if (!data.reason) throw new Error('reason مطلوبة')
    if (data.refund_amount < 0) throw new Error('refund_amount لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: إنشاء إرجاع جديد، المبلغ=${data.refund_amount}`)

    const supabase = await createClientServer()

    const { data: returnTx, error } = await supabase
      .from('return_transaction')
      .insert([{
        ...data,
        status: 'pending'
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid: data.storeid, saleid: data.saleid })
      throw error
    }

    if (!returnTx) {
      throw new Error('فشل في إرجاع الإرجاع المُنشأ')
    }

    console.log(`[${functionName}] تم بنجاح: الإرجاع ${returnTx.id}`)
    return returnTx
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إنشاء الإرجاع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update return status (pending → approved/rejected)
 */
export async function updateReturnStatus(
  returnId: string,
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed',
  approvedById?: string,
  rejectionReason?: string
): Promise<ReturnTransaction> {
  const functionName = 'updateReturnStatus'

  try {
    if (!returnId) throw new Error('returnId مطلوب')
    if (!['pending', 'approved', 'rejected', 'refunded', 'completed'].includes(status)) 
      throw new Error('status غير صحيح')

    console.log(`[${functionName}] البدء: تحديث حالة الإرجاع ${returnId} إلى ${status}`)

    const supabase = await createClientServer()

    const updateData: any = { status }

    if (status === 'approved' && approvedById) {
      updateData.approved_by = approvedById
      updateData.approved_at = new Date().toISOString()
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { data, error } = await supabase
      .from('return_transaction')
      .update(updateData)
      .eq('id', returnId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإرجاع غير موجود')
      }
      logError(functionName, error, { returnId, status })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإرجاع المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { returnId, status })
    throw new Error(`فشل في تحديث الإرجاع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Approve return
 */
export async function approveReturn(
  returnId: string,
  approvedById: string,
  inspectionNotes?: string
): Promise<ReturnTransaction> {
  const functionName = 'approveReturn'

  try {
    if (!returnId) throw new Error('returnId مطلوب')
    if (!approvedById) throw new Error('approvedById مطلوب')

    console.log(`[${functionName}] البدء: الموافقة على الإرجاع ${returnId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .update({
        status: 'approved',
        approved_by: approvedById,
        approved_at: new Date().toISOString(),
        inspection_notes: inspectionNotes
      })
      .eq('id', returnId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإرجاع غير موجود')
      }
      logError(functionName, error, { returnId, approvedById })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإرجاع المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح: تمت الموافقة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { returnId, approvedById })
    throw new Error(`فشل في الموافقة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Reject return
 */
export async function rejectReturn(
  returnId: string,
  rejectionReason: string
): Promise<ReturnTransaction> {
  const functionName = 'rejectReturn'

  try {
    if (!returnId) throw new Error('returnId مطلوب')
    if (!rejectionReason) throw new Error('rejectionReason مطلوبة')

    console.log(`[${functionName}] البدء: رفض الإرجاع ${returnId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('return_transaction')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason
      })
      .eq('id', returnId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإرجاع غير موجود')
      }
      logError(functionName, error, { returnId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإرجاع المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح: تم الرفض`)
    return data
  } catch (error: any) {
    logError(functionName, error, { returnId, rejectionReason })
    throw new Error(`فشل في رفض الإرجاع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Mark return as refunded
 */
export async function markReturnAsRefunded(
  returnId: string,
  refundPaymentId?: string
): Promise<ReturnTransaction> {
  const functionName = 'markReturnAsRefunded'

  try {
    if (!returnId) throw new Error('returnId مطلوب')

    console.log(`[${functionName}] البدء: تحديد الإرجاع كمسترد ${returnId}`)

    const supabase = await createClientServer()

    const updateData: any = {
      status: 'refunded',
      refunded_at: new Date().toISOString()
    }

    if (refundPaymentId) {
      updateData.refund_payment_id = refundPaymentId
    }

    const { data, error } = await supabase
      .from('return_transaction')
      .update(updateData)
      .eq('id', returnId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإرجاع غير موجود')
      }
      logError(functionName, error, { returnId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإرجاع المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح: تم تحديد كمسترد`)
    return data
  } catch (error: any) {
    logError(functionName, error, { returnId })
    throw new Error(`فشل في تحديث الإرجاع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get return stats
 */
export async function getReturnStats(storeid: string, days: number = 30) {
  const functionName = 'getReturnStats'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

    console.log(`[${functionName}] البدء: حساب إحصائيات آخر ${days} يوم`)

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('return_transaction')
      .select('qty, refund_amount, status, item_type')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إرجاعات للفترة المحددة`)
      return getEmptyReturnStats()
    }

    const stats = {
      total_returns: 0,
      total_qty_returned: 0,
      total_refund_amount: 0,
      pending_returns: 0,
      approved_returns: 0,
      rejected_returns: 0,
      completed_returns: 0,
      phones_returned: 0,
      accessories_returned: 0
    }

    data.forEach(ret => {
      stats.total_returns++
      stats.total_qty_returned += ret.qty || 0
      stats.total_refund_amount += Number(ret.refund_amount) || 0

      if (ret.status === 'pending') stats.pending_returns++
      if (ret.status === 'approved') stats.approved_returns++
      if (ret.status === 'rejected') stats.rejected_returns++
      if (ret.status === 'completed') stats.completed_returns++

      if (ret.item_type === 'phone') stats.phones_returned++
      if (ret.item_type === 'accessory') stats.accessories_returned++
    })

    console.log(`[${functionName}] تم بنجاح: ${stats.total_returns} إرجاع`)
    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Helper function to return empty stats
 */
function getEmptyReturnStats() {
  return {
    total_returns: 0,
    total_qty_returned: 0,
    total_refund_amount: 0,
    pending_returns: 0,
    approved_returns: 0,
    rejected_returns: 0,
    completed_returns: 0,
    phones_returned: 0,
    accessories_returned: 0
  }
}