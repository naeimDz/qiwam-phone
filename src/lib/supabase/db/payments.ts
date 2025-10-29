// lib/supabase/db/payments.ts
// DB Layer - Payment and cash movement operations ONLY
// NO BUSINESS LOGIC - Queries only

import { createClientServer } from '@/lib/supabase'
import { Payment, PaymentWithDetails, CashMovement, InsertPayment } from '@/lib/types'

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
 * ✅ Triggers automatically handle:
 *    - update sale/purchase paidamount
 *    - insert cash_movement
 *    - update cash_register balance
 *    - insert audit_log
 */
export async function insertPayment(data: InsertPayment): Promise<Payment> {
  const functionName = 'insertPayment'

  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (data.amount <= 0) throw new Error('amount يجب أن يكون أكبر من 0')
    if (!data.method) throw new Error('method مطلوبة')
    if (!data.direction) throw new Error('direction مطلوبة')

    const supabase = await createClientServer()

    const { data: payment, error } = await supabase
      .from('payment')
      .insert([{
        // Required fields
        storeid: data.storeid,
        sale_id: data.sale_id || null,
        purchase_id: data.purchase_id || null,
        expense_id: data.expense_id || null,
        amount: data.amount,
        method: data.method,
        direction: data.direction,
        createdbyid: data.createdbyid || null,
        
        // Status fields - ملؤها الآن
        status: 'captured',
        captured_at: new Date().toISOString(),
        
        // Optional fields
        reference: data.reference || null,
        register_id: data.register_id || null,
        notes: data.notes || null,
        is_reconciled: false,
        
        // Fields تُملأ عند UPDATE فقط (ترك null)
        // ✅ cancelled_at, cancellation_reason → عند cancelPayment()
        // ✅ reconciled_at, reconciled_by → عند reconcilePayment()
        // ✅ doc_sequence → من Trigger تلقائياً
      }])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid: data.storeid, amount: data.amount })
      throw error
    }

    if (!payment) {
      throw new Error('فشل في إرجاع الدفعة المنشأة')
    }

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
        return null
      }
      logError(functionName, error, { paymentId })
      throw error
    }

    if (!data) return null

    return {
      ...data,
      created_by_name: data.created_by?.fullname || 'System',
      sale_docnumber: data.sale?.docnumber || null,
      purchase_docnumber: data.purchase?.docnumber || null,
      reconciled_by_name: data.reconciled_by_user?.fullname || null
    }
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

    return data || []
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

    return data || []
  } catch (error: any) {
    logError(functionName, error, { purchaseId })
    throw new Error(`فشل في جلب دفعات الشراء: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get total amount paid for a sale or purchase
 */
export async function getTotalPayments(saleId?: string, purchaseId?: string): Promise<number> {
  const functionName = 'getTotalPayments'

  try {
    if (!saleId && !purchaseId) throw new Error('يجب تحديد saleId أو purchaseId')

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

    return data?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0
  } catch (error: any) {
    logError(functionName, error, { saleId, purchaseId })
    throw new Error(`فشل في حساب الدفعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payments by date range for a store
 */
export async function getStorePaymentsByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50,
  offset: number = 0
): Promise<Payment[]> {
  const functionName = 'getStorePaymentsByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

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

    return data || []
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب الدفعات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Cancel payment
 * ✅ Triggers automatically handle reversal of related movements
 */
export async function cancelPayment(paymentId: string, cancellationReason: string): Promise<Payment> {
  const functionName = 'cancelPayment'

  try {
    if (!paymentId) throw new Error('paymentId مطلوب')
    if (!cancellationReason) throw new Error('cancellationReason مطلوبة')

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
      throw new Error('فشل في إرجاع الدفعة المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { paymentId, cancellationReason })
    throw new Error(`فشل في إلغاء الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Reconcile payment
 */
export async function reconcilePayment(paymentId: string, reconciledByUserId: string): Promise<Payment> {
  const functionName = 'reconcilePayment'

  try {
    if (!paymentId) throw new Error('paymentId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

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
      throw new Error('فشل في إرجاع الدفعة المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { paymentId })
    throw new Error(`فشل في توفيق الدفعة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== CASH MOVEMENT OPERATIONS (READ ONLY) ====================
// Triggers create cash_movements automatically - no direct inserts needed

/**
 * Get cash movements for a store (READ ONLY)
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

    return data || []
  } catch (error: any) {
    logError(functionName, error, { storeid, movement_type })
    throw new Error(`فشل في جلب حركات النقد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash movements by date range (READ ONLY)
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

    return data || []
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب حركات النقد: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get payment summary by method for reporting
 */
export async function getPaymentSummaryByMethod(storeid: string, days: number = 30) {
  const functionName = 'getPaymentSummaryByMethod'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

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

    return summary
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الملخص: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash movement stats for reporting
 */
export async function getCashMovementStats(storeid: string, days: number = 30) {
  const functionName = 'getCashMovementStats'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

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

    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== HELPERS ====================

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

function getEmptyCashStats() {
  return {
    total_in: 0,
    total_out: 0,
    total_movements: 0,
    balance: 0
  }
}