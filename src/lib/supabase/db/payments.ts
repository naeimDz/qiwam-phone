// lib/supabase/db/payments.ts
// DB Layer - Payment and cash movement operations with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Payment, PaymentWithDetails, PaymentInsert, CashMovement } from '@/lib/types'

type PaymentUpdate = Partial<Omit<Payment, 'id' | 'storeid' | 'createdat'>>

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

// ==================== PAYMENT OPERATIONS ====================

/**
 * Insert new payment
 * ✅ Triggers automatically:
 *    - update sale/purchase paidamount
 *    - update cash_register balance
 *    - insert cash_register_snapshots
 *    - insert audit_log
 */
export async function insertPayment(data: PaymentInsert): Promise<Payment> {
  const functionName = 'insertPayment'

  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (data.amount <= 0) throw new Error('amount يجب أن يكون أكبر من 0')
    if (!data.method) throw new Error('method مطلوبة')
    if (!['cash', 'card', 'bank', 'transfer'].includes(data.method)) throw new Error('method غير صحيحة')
    if (!data.direction) throw new Error('direction مطلوبة')
    if (!['in', 'out'].includes(data.direction)) throw new Error('direction غير صحيحة')

    // Validate that only one of sale_id, purchase_id, expense_id is set
    const relatedCount = [data.sale_id, data.purchase_id, data.expense_id].filter(Boolean).length
    if (relatedCount !== 1) throw new Error('يجب ربط الدفعة بفاتورة بيع أو شراء أو مصروف واحد فقط')

    console.log(`[${functionName}] البدء: إدراج دفعة جديدة، المبلغ=${data.amount}, الطريقة=${data.method}`)

    const supabase = await createClientServer()

    const { data: payment, error } = await supabase
      .from('payment')
      .insert([{
        ...data,
        status: 'captured',
        captured_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid: data.storeid, amount: data.amount })
      throw error
    }

    if (!payment) {
      throw new Error('فشل في إرجاع الدفعة المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح: الدفعة ${payment.id}`)
    return payment
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إدراج الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<PaymentWithDetails | null> {
  const functionName = 'getPaymentById'

  try {
    if (!paymentId) throw new Error('paymentId مطلوب')

    console.log(`[${functionName}] البدء: paymentId=${paymentId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .select(`
        *,
        sale:sale_id(id, docnumber),
        purchase:purchase_id(id, docnumber),
        created_by:createdbyid(fullname),
        reconciled_by_user:reconciled_by(fullname)
      `)
      .eq('id', paymentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] الدفعة غير موجودة: ${paymentId}`)
        return null
      }
      logError(functionName, error, { paymentId })
      throw error
    }

    if (!data) return null

    const result = {
      ...data,
      created_by_name: data.created_by?.fullname || 'System',
      sale_docnumber: data.sale?.docnumber || null,
      purchase_docnumber: data.purchase?.docnumber || null,
      reconciled_by_name: data.reconciled_by_user?.fullname || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { paymentId })
    throw new Error(`فشل في جلب الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payments for a sale
 */
export async function getSalePayments(saleId: string, limit: number = 50): Promise<Payment[]> {
  const functionName = 'getSalePayments'

  try {
    if (!saleId) throw new Error('saleId مطلوب')

    console.log(`[${functionName}] البدء: saleId=${saleId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('sale_id', saleId)
      .eq('status', 'captured')
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { saleId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد دفعات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} دفعة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { saleId })
    throw new Error(`فشل في جلب دفعات البيع: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payments for a purchase
 */
export async function getPurchasePayments(purchaseId: string, limit: number = 50): Promise<Payment[]> {
  const functionName = 'getPurchasePayments'

  try {
    if (!purchaseId) throw new Error('purchaseId مطلوب')

    console.log(`[${functionName}] البدء: purchaseId=${purchaseId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('purchase_id', purchaseId)
      .eq('status', 'captured')
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { purchaseId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد دفعات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} دفعة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { purchaseId })
    throw new Error(`فشل في جلب دفعات الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get total amount paid for a sale or purchase
 */
export async function getTotalPayments(
  saleId?: string,
  purchaseId?: string
): Promise<number> {
  const functionName = 'getTotalPayments'

  try {
    if (!saleId && !purchaseId) throw new Error('يجب تحديد saleId أو purchaseId')

    console.log(`[${functionName}] البدء: حساب إجمالي الدفعات`)

    const supabase = await createClientServer()

    let query = supabase
      .from('payment')
      .select('amount')
      .eq('status', 'captured')

    if (saleId) {
      query = query.eq('sale_id', saleId)
    } else if (purchaseId) {
      query = query.eq('purchase_id', purchaseId)
    }

    const { data, error } = await query

    if (error) {
      logError(functionName, error, { saleId, purchaseId })
      throw error
    }

    const total = data?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0

    console.log(`[${functionName}] تم بنجاح: الإجمالي=${total}`)
    return total
  } catch (error: any) {
    logError(functionName, error, { saleId, purchaseId })
    throw new Error(`فشل في حساب الدفعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payments by date range
 */
export async function getPaymentsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50,
  offset: number = 0
): Promise<Payment[]> {
  const functionName = 'getPaymentsByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: من ${startDate.toISOString()} إلى ${endDate.toISOString()}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('storeid', storeid)
      .eq('status', 'captured')
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد دفعات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} دفعة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الدفعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Cancel payment
 */
export async function cancelPayment(
  paymentId: string,
  cancellationReason: string
): Promise<Payment> {
  const functionName = 'cancelPayment'

  try {
    if (!paymentId) throw new Error('paymentId مطلوب')
    if (!cancellationReason) throw new Error('cancellationReason مطلوبة')

    console.log(`[${functionName}] البدء: إلغاء الدفعة ${paymentId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellationReason
      })
      .eq('id', paymentId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الدفعة غير موجودة')
      }
      logError(functionName, error, { paymentId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الدفعة المُحدثة')
    }

    console.log(`[${functionName}] تم بنجاح: الدفعة ملغاة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { paymentId, cancellationReason })
    throw new Error(`فشل في إلغاء الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Reconcile payment
 */
export async function reconcilePayment(
  paymentId: string,
  reconciledByUserId: string
): Promise<Payment> {
  const functionName = 'reconcilePayment'

  try {
    if (!paymentId) throw new Error('paymentId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

    console.log(`[${functionName}] البدء: توفيق الدفعة ${paymentId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('payment')
      .update({
        is_reconciled: true,
        reconciled_at: new Date().toISOString(),
        reconciled_by: reconciledByUserId
      })
      .eq('id', paymentId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الدفعة غير موجودة')
      }
      logError(functionName, error, { paymentId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الدفعة المُحدثة')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { paymentId })
    throw new Error(`فشل في توفيق الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== CASH MOVEMENT OPERATIONS ====================

/**
 * Get cash movements for a store (READ ONLY - triggers create these)
 */
export async function getCashMovements(
  storeid: string,
  movement_type?: 'in' | 'out',
  limit: number = 50,
  offset: number = 0
): Promise<CashMovement[]> {
  const functionName = 'getCashMovements'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: storeid=${storeid}, type=${movement_type || 'الكل'}`)

    const supabase = await createClientServer()

    let query = supabase
      .from('cash_movement')
      .select('*')
      .eq('storeid', storeid)

    if (movement_type) {
      query = query.eq('movement_type', movement_type)
    }

    const { data, error } = await query
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, movement_type })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد حركات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} حركة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, movement_type })
    throw new Error(`فشل في جلب حركات النقد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash movements by date range
 */
export async function getCashMovementsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date,
  movement_type?: 'in' | 'out',
  limit: number = 50,
  offset: number = 0
): Promise<CashMovement[]> {
  const functionName = 'getCashMovementsByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: من ${startDate.toISOString()} إلى ${endDate.toISOString()}`)

    const supabase = await createClientServer()

    let query = supabase
      .from('cash_movement')
      .select('*')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())

    if (movement_type) {
      query = query.eq('movement_type', movement_type)
    }

    const { data, error } = await query
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد حركات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} حركة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب حركات النقد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payment summary by method
 */
export async function getPaymentSummaryByMethod(
  storeid: string,
  days: number = 30
) {
  const functionName = 'getPaymentSummaryByMethod'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

    console.log(`[${functionName}] البدء: حساب ملخص الدفعات آخر ${days} يوم`)

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('payment')
      .select('method, amount, direction, status')
      .eq('storeid', storeid)
      .eq('status', 'captured')
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد دفعات`)
      return getEmptyPaymentSummary()
    }

    const summary = {
      cash_in: 0,
      cash_out: 0,
      card_in: 0,
      card_out: 0,
      bank_in: 0,
      bank_out: 0,
      transfer_in: 0,
      transfer_out: 0,
      total_in: 0,
      total_out: 0,
      net: 0
    }

    data.forEach(p => {
      const amount = Number(p.amount) || 0

      if (p.direction === 'in') {
        summary.total_in += amount
        if (p.method === 'cash') summary.cash_in += amount
        if (p.method === 'card') summary.card_in += amount
        if (p.method === 'bank') summary.bank_in += amount
        if (p.method === 'transfer') summary.transfer_in += amount
      } else if (p.direction === 'out') {
        summary.total_out += amount
        if (p.method === 'cash') summary.cash_out += amount
        if (p.method === 'card') summary.card_out += amount
        if (p.method === 'bank') summary.bank_out += amount
        if (p.method === 'transfer') summary.transfer_out += amount
      }
    })

    summary.net = summary.total_in - summary.total_out

    console.log(`[${functionName}] تم بنجاح: إجمالي ${summary.total_in}`)
    return summary
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الملخص: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash movement stats
 */
export async function getCashMovementStats(
  storeid: string,
  days: number = 30
) {
  const functionName = 'getCashMovementStats'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

    console.log(`[${functionName}] البدء: حساب إحصائيات حركات النقد`)

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('cash_movement')
      .select('amount, movement_type')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد حركات`)
      return getEmptyCashStats()
    }

    const stats = {
      total_in: 0,
      total_out: 0,
      total_movements: 0,
      balance: 0
    }

    data.forEach(m => {
      const amount = Number(m.amount) || 0

      if (m.movement_type === 'in') {
        stats.total_in += amount
      } else if (m.movement_type === 'out') {
        stats.total_out += amount
      }

      stats.total_movements++
    })

    stats.balance = stats.total_in - stats.total_out

    console.log(`[${functionName}] تم بنجاح: الرصيد=${stats.balance}`)
    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Helper function to return empty payment summary
 */
function getEmptyPaymentSummary() {
  return {
    cash_in: 0,
    cash_out: 0,
    card_in: 0,
    card_out: 0,
    bank_in: 0,
    bank_out: 0,
    transfer_in: 0,
    transfer_out: 0,
    total_in: 0,
    total_out: 0,
    net: 0
  }
}

/**
 * Helper function to return empty cash stats
 */
function getEmptyCashStats() {
  return {
    total_in: 0,
    total_out: 0,
    total_movements: 0,
    balance: 0
  }
}