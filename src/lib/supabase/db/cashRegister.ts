// lib/supabase/db/cashRegister.ts
// DB Layer - Cash register operations ONLY
// NO BUSINESS LOGIC - Queries only

import { createClientServer } from '@/lib/supabase'
import { CashRegister, CashRegisterWithDetails, CashRegisterSnapshot, SettlementRecord } from '@/lib/types'

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

// ==================== CASH REGISTER OPERATIONS ====================

/**
 * Create new cash register (open)
 */
export async function insertCashRegister(
  storeid: string,
  openedByUserId: string,
  openingBalance: number,
  notes?: string
): Promise<CashRegister> {
  const functionName = 'insertCashRegister'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!openedByUserId) throw new Error('openedByUserId مطلوب')
    if (openingBalance < 0) throw new Error('opening_balance لا يمكن أن يكون سالب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .insert([
        {
          storeid,
          opened_by: openedByUserId,
          opened_at: new Date().toISOString(),
          opening_balance: openingBalance,
          status: 'open',
          notes: notes || null,
          total_cash_in: 0,
          total_cash_out: 0,
          payment_count_in: 0,
          payment_count_out: 0,
          reconciled: false
        }
      ])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid, openingBalance })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الخزينة المنشأة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, openingBalance })
    throw new Error(`فشل في فتح الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash register by ID with related data
 */
export async function getCashRegisterById(registerId: string): Promise<CashRegisterWithDetails | null> {
  const functionName = 'getCashRegisterById'

  try {
    if (!registerId) throw new Error('registerId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .select(`
        *,
        opened_by_user:opened_by(fullname),
        closed_by_user:closed_by(fullname),
        reconciled_by_user:reconciled_by(fullname)
      `)
      .eq('id', registerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { registerId })
      throw error
    }

    if (!data) return null

    return {
      ...data,
      opened_by_name: data.opened_by_user?.fullname || 'Unknown',
      closed_by_name: data.closed_by_user?.fullname || null,
      reconciled_by_name: data.reconciled_by_user?.fullname || null
    }
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في جلب الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get currently open cash register for store
 */
export async function getOpenCashRegister(storeid: string): Promise<CashRegisterWithDetails | null> {
  const functionName = 'getOpenCashRegister'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .select(`
        *,
        opened_by_user:opened_by(fullname),
        closed_by_user:closed_by(fullname)
      `)
      .eq('storeid', storeid)
      .eq('status', 'open')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) return null

    return {
      ...data,
      opened_by_name: data.opened_by_user?.fullname || 'Unknown',
      closed_by_name: null,
      reconciled_by_name: null
    }
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الخزينة المفتوحة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get all cash registers for a store
 */
export async function getCashRegistersByStore(
  storeid: string,
  status?: 'open' | 'closed',
  limit: number = 50,
  offset: number = 0
): Promise<CashRegisterWithDetails[]> {
  const functionName = 'getCashRegistersByStore'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    let query = supabase
      .from('cash_register')
      .select(`
        *,
        opened_by_user:opened_by(fullname),
        closed_by_user:closed_by(fullname),
        reconciled_by_user:reconciled_by(fullname)
      `)
      .eq('storeid', storeid)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('opened_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, status })
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(cr => ({
      ...cr,
      opened_by_name: cr.opened_by_user?.fullname || 'Unknown',
      closed_by_name: cr.closed_by_user?.fullname || null,
      reconciled_by_name: cr.reconciled_by_user?.fullname || null
    }))
  } catch (error: any) {
    logError(functionName, error, { storeid, status })
    throw new Error(`فشل في جلب الخزائن: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Close cash register
 * ✅ Triggers automatically:
 *    - calculate expected_balance
 *    - calculate difference
 *    - create settlement_record
 *    - insert audit_log
 */
export async function updateCashRegisterClose(
  registerId: string,
  closedByUserId: string,
  closingBalance: number,
  notes?: string
): Promise<CashRegister> {
  const functionName = 'updateCashRegisterClose'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (!closedByUserId) throw new Error('closedByUserId مطلوب')
    if (closingBalance < 0) throw new Error('closing_balance لا يمكن أن يكون سالب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .update({
        closed_by: closedByUserId,
        closed_at: new Date().toISOString(),
        closing_balance: closingBalance,
        status: 'closed',
        notes: notes || null
      })
      .eq('id', registerId)
      .eq('status', 'open')
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الخزينة غير موجودة أو مغلقة مسبقاً')
      }
      logError(functionName, error, { registerId, closingBalance })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الخزينة المغلقة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { registerId, closingBalance })
    throw new Error(`فشل في إغلاق الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Reconcile cash register
 */
export async function updateCashRegisterReconcile(
  registerId: string,
  reconciledByUserId: string
): Promise<CashRegister> {
  const functionName = 'updateCashRegisterReconcile'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .update({
        reconciled: true,
        reconciled_by: reconciledByUserId
      })
      .eq('id', registerId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الخزينة غير موجودة')
      }
      logError(functionName, error, { registerId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الخزينة المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في توفيق الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== CASH REGISTER SNAPSHOT OPERATIONS (READ ONLY) ====================

/**
 * Create cash register snapshot
 * ✅ Called manually or by triggers for audit trail
 */
export async function insertCashSnapshot(
  registerId: string,
  snapshotType: 'automatic' | 'manual' | 'reconciliation' | 'shift_close' = 'manual',
  createdBy?: string,
  notes?: string
): Promise<CashRegisterSnapshot> {
  const functionName = 'insertCashSnapshot'

  try {
    if (!registerId) throw new Error('registerId مطلوب')

    const supabase = await createClientServer()

    // Get current register for balance
    const register = await getCashRegisterById(registerId)
    if (!register) {
      throw new Error('الخزينة غير موجودة')
    }

    const balanceAtTime = register.closing_balance ?? register.opening_balance

    const { data, error } = await supabase
      .from('cash_register_snapshots')
      .insert([
        {
          register_id: registerId,
          snapshot_time: new Date().toISOString(),
          balance_at_time: balanceAtTime,
          snapshot_type: snapshotType,
          created_by: createdBy || null,
          notes: notes || null
        }
      ])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { registerId, snapshotType })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع اللقطة المنشأة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { registerId, snapshotType })
    throw new Error(`فشل في إنشاء اللقطة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash register snapshots
 */
export async function getCashSnapshotsByRegister(
  registerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CashRegisterSnapshot[]> {
  const functionName = 'getCashSnapshotsByRegister'

  try {
    if (!registerId) throw new Error('registerId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register_snapshots')
      .select('*')
      .eq('register_id', registerId)
      .order('snapshot_time', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { registerId })
      throw error
    }

    return data || []
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في جلب اللقطات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== SETTLEMENT RECORD OPERATIONS ====================

/**
 * Create settlement record
 * ✅ Called automatically by trigger when register closed
 */
export async function insertSettlementRecord(
  storeid: string,
  registerId: string,
  totalSales: number,
  totalRefunds: number,
  totalExpenses: number,
  openingBalance: number,
  closingBalance: number,
  differenceReason?: string
): Promise<SettlementRecord> {
  const functionName = 'insertSettlementRecord'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!registerId) throw new Error('registerId مطلوب')

    const supabase = await createClientServer()

    // Calculate values
    const netCash = totalSales - totalRefunds - totalExpenses
    const expectedBalance = openingBalance + netCash
    const difference = closingBalance - expectedBalance

    const { data, error } = await supabase
      .from('settlement_record')
      .insert([
        {
          storeid,
          register_id: registerId,
          settlement_date: new Date().toISOString(),
          total_sales: totalSales,
          total_refunds: totalRefunds,
          total_expenses: totalExpenses,
          net_cash: netCash,
          opening_balance: openingBalance,
          closing_balance: closingBalance,
          expected_balance: expectedBalance,
          difference,
          difference_reason: differenceReason || null,
          reconciled: false
        }
      ])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid, registerId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع التسوية المنشأة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, registerId })
    throw new Error(`فشل في إنشاء التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get settlement records for a store
 */
export async function getSettlementRecordsByStore(
  storeid: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 50,
  offset: number = 0
): Promise<SettlementRecord[]> {
  const functionName = 'getSettlementRecordsByStore'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    const supabase = await createClientServer()

    let query = supabase
      .from('settlement_record')
      .select('*')
      .eq('storeid', storeid)

    if (startDate) {
      query = query.gte('settlement_date', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('settlement_date', endDate.toISOString())
    }

    const { data, error } = await query
      .order('settlement_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    return data || []
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب التسويات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get settlement by ID
 */
export async function getSettlementRecordById(settlementId: string): Promise<SettlementRecord | null> {
  const functionName = 'getSettlementRecordById'

  try {
    if (!settlementId) throw new Error('settlementId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('settlement_record')
      .select('*')
      .eq('id', settlementId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logError(functionName, error, { settlementId })
      throw error
    }

    return data || null
  } catch (error: any) {
    logError(functionName, error, { settlementId })
    throw new Error(`فشل في جلب التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update settlement reconciliation
 */
export async function updateSettlementReconcile(
  settlementId: string,
  reconciledByUserId: string,
  differenceReason?: string
): Promise<SettlementRecord> {
  const functionName = 'updateSettlementReconcile'

  try {
    if (!settlementId) throw new Error('settlementId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('settlement_record')
      .update({
        reconciled: true,
        reconciled_by: reconciledByUserId,
        reconciled_at: new Date().toISOString(),
        difference_reason: differenceReason || null
      })
      .eq('id', settlementId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('التسوية غير موجودة')
      }
      logError(functionName, error, { settlementId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع التسوية المحدثة')
    }

    return data
  } catch (error: any) {
    logError(functionName, error, { settlementId })
    throw new Error(`فشل في توفيق التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}