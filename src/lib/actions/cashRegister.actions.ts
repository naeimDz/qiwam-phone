// lib/actions/cashRegister.actions.ts
// Actions Layer - Cash register business logic + authorization
// Orchestrates DB calls and user-facing workflow

'use server'

import { revalidatePath } from 'next/cache'
import * as cashRegisterDb from '@/lib/supabase/db/cashRegister'
import * as authDb from '@/lib/supabase/db/auth'
import { CashRegister, CashRegisterSnapshot, SettlementRecord } from '@/lib/types'

// ==================== RESPONSE TYPES ====================
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// ==================== CASH REGISTER ACTIONS ====================

/**
 * Open new cash register
 * 
 * Flow:
 * 1. Authorization - any user
 * 2. Validate no other register is open
 * 3. Call DB insertCashRegister
 * 4. Trigger automatically inserts audit_log
 * 5. Revalidate cache
 */
export async function openCashRegisterAction(
  openingBalance: number,
  notes?: string
): Promise<ActionResult<CashRegister>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Validate opening balance
    if (openingBalance < 0) {
      return { success: false, error: 'الرصيد الافتتاحي لا يمكن أن يكون سالب' }
    }

    // Check if register already open
    const openRegister = await cashRegisterDb.getOpenCashRegister(user.storeid)
    if (openRegister) {
      return { success: false, error: 'توجد خزينة مفتوحة بالفعل' }
    }

    // Call DB
    const register = await cashRegisterDb.insertCashRegister(
      user.storeid,
      user.id,
      openingBalance,
      notes
    )

    revalidatePath('/cash-register')
    return { success: true, data: register }
  } catch (error: any) {
    console.error('openCashRegisterAction error:', error)
    return { success: false, error: 'فشل في فتح الخزينة' }
  }
}

/**
 * Get currently open cash register
 */
export async function getOpenCashRegisterAction(): Promise<ActionResult<CashRegister | null>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const register = await cashRegisterDb.getOpenCashRegister(user.storeid)
    return { success: true, data: register || null }
  } catch (error: any) {
    console.error('getOpenCashRegisterAction error:', error)
    return { success: false, error: 'فشل في جلب الخزينة المفتوحة' }
  }
}

/**
 * Get all cash registers for store
 */
export async function getCashRegistersAction(
  status?: 'open' | 'closed'
): Promise<ActionResult<CashRegister[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const registers = await cashRegisterDb.getCashRegistersByStore(user.storeid, status)
    return { success: true, data: registers }
  } catch (error: any) {
    console.error('getCashRegistersAction error:', error)
    return { success: false, error: 'فشل في جلب الخزائن' }
  }
}

/**
 * Close cash register with reconciliation
 * 
 * Flow:
 * 1. Authorization - any user
 * 2. Validate register is open
 * 3. Call DB updateCashRegisterClose
 * 4. Triggers automatically:
 *    - create settlement_record
 *    - calculate difference
 *    - detect variance if needed
 *    - insert audit_log
 * 5. Revalidate cache
 * 6. Return settlement info
 */
export async function closeCashRegisterAction(
  registerId: string,
  closingBalance: number,
  notes?: string
): Promise<ActionResult<CashRegister>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    // Validation
    if (!registerId) {
      return { success: false, error: 'معرف الخزينة مطلوب' }
    }

    if (closingBalance < 0) {
      return { success: false, error: 'الرصيد الختامي لا يمكن أن يكون سالب' }
    }

    // Verify register exists and is open
    const register = await cashRegisterDb.getCashRegisterById(registerId)
    if (!register) {
      return { success: false, error: 'الخزينة غير موجودة' }
    }

    if (register.status === 'closed') {
      return { success: false, error: 'الخزينة مغلقة بالفعل' }
    }

    // Call DB
    const closedRegister = await cashRegisterDb.updateCashRegisterClose(
      registerId,
      user.id,
      closingBalance,
      notes
    )

    revalidatePath('/cash-register')
    return { success: true, data: closedRegister }
  } catch (error: any) {
    console.error('closeCashRegisterAction error:', error)
    return { success: false, error: 'فشل في إغلاق الخزينة' }
  }
}

/**
 * Reconcile cash register (mark as reconciled)
 */
export async function reconcileCashRegisterAction(
  registerId: string
): Promise<ActionResult<CashRegister>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!registerId) {
      return { success: false, error: 'معرف الخزينة مطلوب' }
    }

    const register = await cashRegisterDb.updateCashRegisterReconcile(registerId, user.id)

    revalidatePath('/cash-register')
    return { success: true, data: register }
  } catch (error: any) {
    console.error('reconcileCashRegisterAction error:', error)
    return { success: false, error: 'فشل في توفيق الخزينة' }
  }
}

// ==================== SETTLEMENT ACTIONS ====================

/**
 * Get settlement records for store
 */
export async function getSettlementRecordsAction(
  startDate?: Date,
  endDate?: Date
): Promise<ActionResult<SettlementRecord[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const settlements = await cashRegisterDb.getSettlementRecordsByStore(
      user.storeid,
      startDate,
      endDate
    )
    return { success: true, data: settlements }
  } catch (error: any) {
    console.error('getSettlementRecordsAction error:', error)
    return { success: false, error: 'فشل في جلب التسويات' }
  }
}

/**
 * Reconcile settlement record
 * 
 * Flow:
 * 1. Authorization - owner only
 * 2. Validate settlement exists
 * 3. Call DB updateSettlementReconcile
 * 4. Triggers may create variance_record if difference > threshold
 * 5. Revalidate cache
 */
export async function reconcileSettlementAction(
  settlementId: string,
  differenceReason?: string
): Promise<ActionResult<SettlementRecord>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (user.role !== 'owner') {
      return { success: false, error: 'غير مصرح لك بتوفيق التسويات' }
    }

    if (!settlementId) {
      return { success: false, error: 'معرف التسوية مطلوب' }
    }

    if (differenceReason && differenceReason.length > 500) {
      return { success: false, error: 'سبب الفرق طويل جداً' }
    }

    // Verify settlement exists
    const settlement = await cashRegisterDb.getSettlementRecordById(settlementId)
    if (!settlement) {
      return { success: false, error: 'التسوية غير موجودة' }
    }

    // Call DB
    const reconciled = await cashRegisterDb.updateSettlementReconcile(
      settlementId,
      user.id,
      differenceReason
    )

    revalidatePath('/cash-register')
    return { success: true, data: reconciled }
  } catch (error: any) {
    console.error('reconcileSettlementAction error:', error)
    return { success: false, error: 'فشل في توفيق التسوية' }
  }
}

// ==================== SNAPSHOT ACTIONS ====================

/**
 * Create manual snapshot of cash register
 */
export async function createCashSnapshotAction(
  registerId: string,
  notes?: string
): Promise<ActionResult<CashRegisterSnapshot>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!registerId) {
      return { success: false, error: 'معرف الخزينة مطلوب' }
    }

    const snapshot = await cashRegisterDb.insertCashSnapshot(
      registerId,
      'manual',
      user.id,
      notes
    )

    return { success: true, data: snapshot }
  } catch (error: any) {
    console.error('createCashSnapshotAction error:', error)
    return { success: false, error: 'فشل في إنشاء لقطة الخزينة' }
  }
}

/**
 * Get cash snapshots for register
 */
export async function getCashSnapshotsAction(
  registerId: string
): Promise<ActionResult<CashRegisterSnapshot[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!registerId) {
      return { success: false, error: 'معرف الخزينة مطلوب' }
    }

    const snapshots = await cashRegisterDb.getCashSnapshotsByRegister(registerId)
    return { success: true, data: snapshots }
  } catch (error: any) {
    console.error('getCashSnapshotsAction error:', error)
    return { success: false, error: 'فشل في جلب لقطات الخزينة' }
  }
}