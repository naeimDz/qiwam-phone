// lib/actions/payment.actions.ts
// Actions Layer - Business logic + validation + authorization
// Orchestrates DB calls and user-facing logic

'use server'

import { revalidatePath } from 'next/cache'
import * as paymentDb from '@/lib/supabase/db/payments'
import * as authDb from '@/lib/supabase/db/auth'
import { Payment, InsertPayment } from '@/lib/types'

// ==================== RESPONSE TYPES ====================
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// ==================== PAYMENT ACTIONS ====================

/**
 * Create payment for sale/purchase/expense
 * 
 * Flow:
 * 1. Get current user & validate store
 * 2. Validate payment data
 * 3. Call DB insertPayment
 * 4. Trigger automatically:
 *    - update sale/purchase paidamount
 *    - insert cash_movement
 *    - update cash_register balance
 *    - insert audit_log
 * 5. Revalidate cache
 */
export async function createPaymentAction(
  saleId: string | undefined,
  purchaseId: string | undefined,
  expenseId: string | undefined,
  amount: number,
  method: 'cash' | 'card' | 'bank' | 'transfer',
  direction: 'in' | 'out',
  reference?: string,
  notes?: string
): Promise<ActionResult<Payment>> {
  try {
    // Step 1: Authorization
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Step 2: Validation
    if (amount <= 0) {
      return { success: false, error: 'المبلغ يجب أن يكون أكبر من صفر' }
    }

    // Ensure exactly one related entity
    const relatedCount = [saleId, purchaseId, expenseId].filter(Boolean).length
    if (relatedCount !== 1) {
      return { success: false, error: 'الدفعة يجب أن ترتبط بفاتورة بيع أو شراء أو مصروف واحد فقط' }
    }

    if (!['cash', 'card', 'bank', 'transfer'].includes(method)) {
      return { success: false, error: 'طريقة الدفع غير صحيحة' }
    }

    if (!['in', 'out'].includes(direction)) {
      return { success: false, error: 'اتجاه الدفعة غير صحيح' }
    }

    // Step 3: Call DB layer
    const paymentData: InsertPayment = {
      storeid: user.storeid,
      sale_id: saleId || null,
      purchase_id: purchaseId || null,
      expense_id: expenseId || null,
      amount,
      method,
      direction,
      reference: reference || null,
      register_id: null,
      createdbyid: user.id,
      notes: notes || null
      // ❌ لا نضع: captured_at, cancelled_at, cancellation_reason, reconciled_at, reconciled_by, doc_sequence
    }

    const payment = await paymentDb.insertPayment(paymentData)

    // Step 4: Revalidate
    revalidatePath('/sales')
    revalidatePath('/purchases')
    revalidatePath('/cash-register')

    return { success: true, data: payment }
  } catch (error: any) {
    console.error('createPaymentAction error:', error)
    return { success: false, error: 'فشل في إنشاء الدفعة' }
  }
}

/**
 * Get payments for a sale
 */
export async function getSalePaymentsAction(saleId: string): Promise<ActionResult<Payment[]>> {
  try {
    if (!saleId) {
      return { success: false, error: 'معرف الفاتورة مطلوب' }
    }

    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const payments = await paymentDb.getSalePayments(saleId)
    return { success: true, data: payments }
  } catch (error: any) {
    console.error('getSalePaymentsAction error:', error)
    return { success: false, error: 'فشل في جلب الدفعات' }
  }
}

/**
 * Get payments for a purchase
 */
export async function getPurchasePaymentsAction(purchaseId: string): Promise<ActionResult<Payment[]>> {
  try {
    if (!purchaseId) {
      return { success: false, error: 'معرف فاتورة الشراء مطلوب' }
    }

    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const payments = await paymentDb.getPurchasePayments(purchaseId)
    return { success: true, data: payments }
  } catch (error: any) {
    console.error('getPurchasePaymentsAction error:', error)
    return { success: false, error: 'فشل في جلب الدفعات' }
  }
}

/**
 * Cancel payment
 * 
 * Flow:
 * 1. Authorization (owner only)
 * 2. Validate payment exists
 * 3. Call DB cancelPayment
 * 4. Triggers automatically:
 *    - reverse cash_movement
 *    - update sale/purchase paidamount
 *    - update cash_register balance
 *    - insert audit_log
 * 5. Revalidate cache
 */
export async function cancelPaymentAction(
  paymentId: string,
  reason: string
): Promise<ActionResult<Payment>> {
  try {
    // Authorization: only owner can cancel
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بإلغاء الدفعات' }
    }

    // Validation
    if (!paymentId) {
      return { success: false, error: 'معرف الدفعة مطلوب' }
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'يجب تحديد سبب الإلغاء' }
    }

    if (reason.trim().length > 500) {
      return { success: false, error: 'سبب الإلغاء طويل جداً' }
    }

    // Call DB layer
    const payment = await paymentDb.cancelPayment(paymentId, reason.trim())

    // Revalidate
    revalidatePath('/sales')
    revalidatePath('/purchases')
    revalidatePath('/cash-register')

    return { success: true, data: payment }
  } catch (error: any) {
    console.error('cancelPaymentAction error:', error)
    return { success: false, error: 'فشل في إلغاء الدفعة' }
  }
}

/**
 * Reconcile payment
 */
export async function reconcilePaymentAction(paymentId: string): Promise<ActionResult<Payment>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!paymentId) {
      return { success: false, error: 'معرف الدفعة مطلوب' }
    }

    const payment = await paymentDb.reconcilePayment(paymentId, user.id)

    revalidatePath('/cash-register')
    return { success: true, data: payment }
  } catch (error: any) {
    console.error('reconcilePaymentAction error:', error)
    return { success: false, error: 'فشل في توفيق الدفعة' }
  }
}

/**
 * Get payments summary by method for reporting
 */
export async function getPaymentsSummaryAction(
  startDate?: Date,
  endDate?: Date
): Promise<ActionResult<any>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const summary = await paymentDb.getPaymentSummaryByMethod(user.storeid)
    return { success: true, data: summary }
  } catch (error: any) {
    console.error('getPaymentsSummaryAction error:', error)
    return { success: false, error: 'فشل في جلب ملخص الدفعات' }
  }
}

/**
 * Get cash movements for reporting/dashboard
 */
export async function getCashMovementsAction(
  type?: 'in' | 'out'
): Promise<ActionResult<any[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const movements = await paymentDb.getCashMovements(user.storeid, type)
    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getCashMovementsAction error:', error)
    return { success: false, error: 'فشل في جلب حركات النقد' }
  }
}

/**
 * Get cash movements by date range
 */
export async function getCashMovementsByDateRangeAction(
  startDate: Date,
  endDate: Date,
  type?: 'in' | 'out'
): Promise<ActionResult<any[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (startDate > endDate) {
      return { success: false, error: 'تاريخ البداية أكبر من تاريخ النهاية' }
    }

    const movements = await paymentDb.getCashMovementsByDateRange(
      user.storeid,
      startDate,
      endDate,
      type
    )
    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getCashMovementsByDateRangeAction error:', error)
    return { success: false, error: 'فشل في جلب حركات النقد' }
  }
}