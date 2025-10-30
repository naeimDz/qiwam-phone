// app/actions/returnTransactions.ts
// Server Actions - Return transaction operations with business logic & validation

'use server'

import { revalidatePath } from 'next/cache'
import {
  getReturnsByStore,
  getReturnsBySale,
  getReturnsByStatus,
  getReturnsByDateRange,
  getReturnById,
  insertReturn,
  updateReturnStatus,
  approveReturn,
  rejectReturn,
  markReturnAsRefunded,
  getReturnStats
} from '@/lib/supabase/db/returnTransactions'
import { ReturnTransaction, ReturnTransactionWithDetails, ReturnStatus, PaymentMethod } from '@/lib/types'

// ==================== TYPES ====================

export interface CreateReturnInput {
  storeid: string
  saleid: string
  sale_item_id?: string | null
  item_type: 'phone' | 'accessory'
  phone_id?: string | null
  accessory_id?: string | null
  qty: number
  refund_amount: number
  refund_method: PaymentMethod
  reason: string
  reason_code?: string | null
  notes?: string | null
  createdby: string
  inspected_by?: string | null
  inspection_notes?: string | null
}

export interface UpdateReturnStatusInput {
  status: ReturnStatus
  approvedById?: string
  rejectionReason?: string
  inspectionNotes?: string
  refundPaymentId?: string
}

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== CREATE ACTIONS ====================

/**
 * Create new return transaction
 * Requires either phone_id or accessory_id
 */
export async function createReturnAction(
  input: CreateReturnInput
): Promise<ActionResponse<ReturnTransaction>> {
  const functionName = 'createReturnAction'

  try {
    console.log(`[${functionName}] البدء: إنشاء إرجاع جديد`)

    // Validation
    if (!input.storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!input.saleid) {
      return { success: false, error: 'رقم الفاتورة مطلوب' }
    }

    if (!input.item_type || !['phone', 'accessory'].includes(input.item_type)) {
      return { success: false, error: 'نوع المنتج مطلوب (phone أو accessory)' }
    }

    if (!input.phone_id && !input.accessory_id) {
      return { success: false, error: 'يجب تحديد المنتج المُرجّع' }
    }

    if (input.item_type === 'phone' && !input.phone_id) {
      return { success: false, error: 'معرف الهاتف مطلوب' }
    }

    if (input.item_type === 'accessory' && !input.accessory_id) {
      return { success: false, error: 'معرف الإكسسوار مطلوب' }
    }

    if (input.qty <= 0) {
      return { success: false, error: 'الكمية يجب أن تكون أكبر من 0' }
    }

    if (input.refund_amount < 0) {
      return { success: false, error: 'مبلغ الاسترجاع لا يمكن أن يكون سالب' }
    }

    if (!input.reason || input.reason.trim() === '') {
      return { success: false, error: 'سبب الإرجاع مطلوب' }
    }

    if (!['cash', 'card', 'bank', 'transfer'].includes(input.refund_method)) {
      return { success: false, error: 'طريقة الاسترجاع غير صحيحة' }
    }

    if (!input.createdby) {
      return { success: false, error: 'معرف المستخدم مطلوب' }
    }

    // Insert to DB
    const returnTx = await insertReturn({
      storeid: input.storeid,
      saleid: input.saleid,
      sale_item_id: input.sale_item_id || null,
      item_type: input.item_type,
      phone_id: input.phone_id || null,
      accessory_id: input.accessory_id || null,
      qty: input.qty,
      refund_amount: input.refund_amount,
      refund_method: input.refund_method,
      reason: input.reason.trim(),
      reason_code: input.reason_code || null,
      notes: input.notes?.trim() || null,
      createdby: input.createdby,
      status: 'pending',
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      refund_payment_id: null,
      inspected_by: input.inspected_by || null,
      inspection_notes: input.inspection_notes || null,
      refunded_at: null,
      createdat: new Date()
    } as any)

    console.log(`[${functionName}] ✅ تم: الإرجاع ${returnTx.id}`)

    // Revalidate cache
    revalidatePath('/returns')
    revalidatePath('/sales')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: returnTx,
      message: 'تم إنشاء الإرجاع بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في إنشاء الإرجاع'
    }
  }
}

// ==================== READ ACTIONS ====================

/**
 * Get all returns for a store
 */
export async function getReturnsAction(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<ReturnTransactionWithDetails[]>> {
  const functionName = 'getReturnsAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإرجاعات`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    const returns = await getReturnsByStore(storeid, limit, offset)

    return {
      success: true,
      data: returns
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإرجاعات'
    }
  }
}

/**
 * Get returns for a specific sale
 */
export async function getReturnsBySaleAction(
  saleId: string
): Promise<ActionResponse<ReturnTransactionWithDetails[]>> {
  const functionName = 'getReturnsBySaleAction'

  try {
    console.log(`[${functionName}] البدء: جلب إرجاعات الفاتورة ${saleId}`)

    if (!saleId) {
      return { success: false, error: 'saleId مطلوب' }
    }

    const returns = await getReturnsBySale(saleId)

    return {
      success: true,
      data: returns
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإرجاعات'
    }
  }
}

/**
 * Get returns by status
 */
export async function getReturnsByStatusAction(
  storeid: string,
  status: ReturnStatus,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<ReturnTransactionWithDetails[]>> {
  const functionName = 'getReturnsByStatusAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإرجاعات بحالة ${status}`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!['pending', 'approved', 'rejected', 'refunded', 'completed'].includes(status)) {
      return { success: false, error: 'حالة غير صحيحة' }
    }

    const returns = await getReturnsByStatus(storeid, status as any, limit, offset)

    return {
      success: true,
      data: returns
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإرجاعات'
    }
  }
}

/**
 * Get single return by ID
 */
export async function getReturnAction(
  returnId: string
): Promise<ActionResponse<ReturnTransactionWithDetails | null>> {
  const functionName = 'getReturnAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإرجاع ${returnId}`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    const returnTx = await getReturnById(returnId)

    return {
      success: true,
      data: returnTx
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإرجاع'
    }
  }
}

/**
 * Get returns by date range
 */
export async function getReturnsByDateRangeAction(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<ReturnTransactionWithDetails[]>> {
  const functionName = 'getReturnsByDateRangeAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإرجاعات من ${startDate} إلى ${endDate}`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!startDate || !endDate) {
      return { success: false, error: 'التواريخ مطلوبة' }
    }

    if (startDate > endDate) {
      return { success: false, error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' }
    }

    const returns = await getReturnsByDateRange(storeid, startDate, endDate)

    return {
      success: true,
      data: returns
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإرجاعات'
    }
  }
}

/**
 * Get return statistics
 */
export async function getReturnStatsAction(
  storeid: string,
  days: number = 30
): Promise<ActionResponse<any>> {
  const functionName = 'getReturnStatsAction'

  try {
    console.log(`[${functionName}] البدء: حساب الإحصائيات آخر ${days} يوم`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (days < 1 || days > 365) {
      return { success: false, error: 'عدد الأيام يجب أن يكون بين 1 و 365' }
    }

    const stats = await getReturnStats(storeid, days)

    return {
      success: true,
      data: stats
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في حساب الإحصائيات'
    }
  }
}

// ==================== APPROVAL ACTIONS ====================

/**
 * Approve return (review inspection)
 */
export async function approveReturnAction(
  returnId: string,
  approvedById: string,
  inspectionNotes?: string
): Promise<ActionResponse<ReturnTransaction>> {
  const functionName = 'approveReturnAction'

  try {
    console.log(`[${functionName}] البدء: الموافقة على الإرجاع ${returnId}`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    if (!approvedById) {
      return { success: false, error: 'معرف المراجع مطلوب' }
    }

    const returnTx = await approveReturn(returnId, approvedById, inspectionNotes)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/returns')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: returnTx,
      message: 'تمت الموافقة على الإرجاع بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في الموافقة على الإرجاع'
    }
  }
}

/**
 * Reject return
 */
export async function rejectReturnAction(
  returnId: string,
  rejectionReason: string
): Promise<ActionResponse<ReturnTransaction>> {
  const functionName = 'rejectReturnAction'

  try {
    console.log(`[${functionName}] البدء: رفض الإرجاع ${returnId}`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    if (!rejectionReason || rejectionReason.trim() === '') {
      return { success: false, error: 'سبب الرفض مطلوب' }
    }

    const returnTx = await rejectReturn(returnId, rejectionReason)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/returns')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: returnTx,
      message: 'تم رفض الإرجاع بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في رفض الإرجاع'
    }
  }
}

/**
 * Mark return as refunded
 */
export async function markReturnAsRefundedAction(
  returnId: string,
  refundPaymentId?: string
): Promise<ActionResponse<ReturnTransaction>> {
  const functionName = 'markReturnAsRefundedAction'

  try {
    console.log(`[${functionName}] البدء: تحديد الإرجاع كمسترد`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    const returnTx = await markReturnAsRefunded(returnId, refundPaymentId)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/returns')
    revalidatePath('/payments')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: returnTx,
      message: 'تم تحديد الإرجاع كمسترد بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تحديد الإرجاع كمسترد'
    }
  }
}

/**
 * Complete return (final status)
 */
export async function completeReturnAction(
  returnId: string
): Promise<ActionResponse<ReturnTransaction>> {
  const functionName = 'completeReturnAction'

  try {
    console.log(`[${functionName}] البدء: إكمال الإرجاع ${returnId}`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    const returnTx = await updateReturnStatus(returnId, 'completed')

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/returns')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: returnTx,
      message: 'تم إكمال الإرجاع بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في إكمال الإرجاع'
    }
  }
}

// ==================== RETURN STATUS WORKFLOW ====================

/**
 * Get return workflow status with available actions
 */
export async function getReturnWorkflowAction(
  returnId: string
): Promise<ActionResponse<{ 
  currentStatus: ReturnStatus
  availableActions: string[]
  nextSteps: string[]
}>> {
  const functionName = 'getReturnWorkflowAction'

  try {
    console.log(`[${functionName}] البدء: جلب workflow الإرجاع`)

    if (!returnId) {
      return { success: false, error: 'returnId مطلوب' }
    }

    const returnTx = await getReturnById(returnId)

    if (!returnTx) {
      return { success: false, error: 'الإرجاع غير موجود' }
    }

    const workflow: {
      currentStatus: ReturnStatus
      availableActions: string[]
      nextSteps: string[]
    } = {
      currentStatus: returnTx.status as ReturnStatus,
      availableActions: [],
      nextSteps: []
    }

    // Define workflow
    switch (returnTx.status) {
      case 'pending':
        workflow.availableActions = ['approve', 'reject']
        workflow.nextSteps = ['مراجعة البضاعة المُرجّعة', 'اتخاذ قرار الموافقة أو الرفض']
        break
      case 'approved':
        workflow.availableActions = ['refund', 'complete']
        workflow.nextSteps = ['معالجة الاسترجاع', 'إكمال العملية']
        break
      case 'rejected':
        workflow.availableActions = ['complete']
        workflow.nextSteps = ['إرجاع البضاعة للعميل', 'إكمال العملية']
        break
      case 'refunded':
        workflow.availableActions = ['complete']
        workflow.nextSteps = ['إكمال العملية']
        break
      case 'completed':
        workflow.availableActions = []
        workflow.nextSteps = ['العملية مكتملة']
        break
    }

    return {
      success: true,
      data: workflow
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب workflow'
    }
  }
}