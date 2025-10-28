// lib/supabase/db/cashRegister.ts
// DB Layer - Cash register operations with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { CashRegister, CashRegisterWithDetails, CashRegisterSnapshot, SettlementRecord } from '@/lib/types'

type CashRegisterInsert = Omit<CashRegister, 'id' | 'createdat' | 'closed_at' | 'expected_balance' | 'difference'>

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
export async function createCashRegister(
  storeid: string,
  openedByUserId: string,
  openingBalance: number,
  notes?: string
): Promise<CashRegister> {
  const functionName = 'createCashRegister'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!openedByUserId) throw new Error('openedByUserId مطلوب')
    if (openingBalance < 0) throw new Error('opening_balance لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: فتح خزينة جديدة، الرصيد=${openingBalance}`)

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
          notes,
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
      throw new Error('فشل في إرجاع الخزينة المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح: الخزينة ${data.id}`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, openingBalance })
    throw new Error(`فشل في فتح الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash register by ID
 */
export async function getCashRegisterById(registerId: string): Promise<CashRegisterWithDetails | null> {
  const functionName = 'getCashRegisterById'

  try {
    if (!registerId) throw new Error('registerId مطلوب')

    console.log(`[${functionName}] البدء: registerId=${registerId}`)

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
        console.log(`[${functionName}] الخزينة غير موجودة: ${registerId}`)
        return null
      }
      logError(functionName, error, { registerId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات للخزينة: ${registerId}`)
      return null
    }

    const result = {
      ...data,
      opened_by_name: data.opened_by_user?.fullname || 'Unknown',
      closed_by_name: data.closed_by_user?.fullname || null,
      reconciled_by_name: data.reconciled_by_user?.fullname || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في جلب الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get currently open cash register
 */
export async function getOpenCashRegister(storeid: string): Promise<CashRegisterWithDetails | null> {
  const functionName = 'getOpenCashRegister'

  try {
    if (!storeid) throw new Error('storeid مطلوب')

    console.log(`[${functionName}] البدء: جلب الخزينة المفتوحة`)

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
        console.log(`[${functionName}] لا توجد خزينة مفتوحة`)
        return null
      }
      logError(functionName, error, { storeid })
      throw error
    }

    if (!data) {
      return null
    }

    const result = {
      ...data,
      opened_by_name: data.opened_by_user?.fullname || 'Unknown',
      closed_by_name: null,
      reconciled_by_name: null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid })
    throw new Error(`فشل في جلب الخزينة المفتوحة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get all cash registers for a store
 */
export async function getStoreCashRegisters(
  storeid: string,
  status?: 'open' | 'closed',
  limit: number = 50,
  offset: number = 0
): Promise<CashRegisterWithDetails[]> {
  const functionName = 'getStoreCashRegisters'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: storeid=${storeid}, status=${status || 'الكل'}`)

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
      console.log(`[${functionName}] لا توجد خزائن`)
      return []
    }

    const result = data.map(cr => ({
      ...cr,
      opened_by_name: cr.opened_by_user?.fullname || 'Unknown',
      closed_by_name: cr.closed_by_user?.fullname || null,
      reconciled_by_name: cr.reconciled_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} خزينة`)
    return result
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
 *    - insert audit_log
 */
export async function closeCashRegister(
  registerId: string,
  closedByUserId: string,
  closingBalance: number,
  notes?: string
): Promise<CashRegister> {
  const functionName = 'closeCashRegister'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (!closedByUserId) throw new Error('closedByUserId مطلوب')
    if (closingBalance < 0) throw new Error('closing_balance لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: إغلاق الخزينة، الرصيد=${closingBalance}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('cash_register')
      .update({
        closed_by: closedByUserId,
        closed_at: new Date().toISOString(),
        closing_balance: closingBalance,
        status: 'closed',
        notes
      })
      .eq('id', registerId)
      .is('status', 'open')
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
      throw new Error('فشل في إرجاع الخزينة المُغلقة')
    }

    console.log(`[${functionName}] تم بنجاح: الخزينة مغلقة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { registerId, closingBalance })
    throw new Error(`فشل في إغلاق الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Reconcile cash register
 */
export async function reconcileCashRegister(
  registerId: string,
  reconciledByUserId: string,
  differenceReason?: string
): Promise<CashRegister> {
  const functionName = 'reconcileCashRegister'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

    console.log(`[${functionName}] البدء: توفيق الخزينة ${registerId}`)

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
      throw new Error('فشل في إرجاع الخزينة المُحدثة')
    }

    console.log(`[${functionName}] تم بنجاح: تم التوفيق`)
    return data
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في توفيق الخزينة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== CASH REGISTER SNAPSHOT OPERATIONS ====================

/**
 * Create cash register snapshot (automatic or manual)
 */
export async function createCashSnapshot(
  registerId: string,
  snapshotType: 'automatic' | 'manual' | 'reconciliation' | 'shift_close' = 'automatic',
  createdBy?: string,
  notes?: string
): Promise<CashRegisterSnapshot> {
  const functionName = 'createCashSnapshot'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (!['automatic', 'manual', 'reconciliation', 'shift_close'].includes(snapshotType)) 
      throw new Error('snapshotType غير صحيح')

    console.log(`[${functionName}] البدء: إنشاء لقطة، النوع=${snapshotType}`)

    const supabase = await createClientServer()

    // Get current register balance
    const register = await getCashRegisterById(registerId)
    if (!register) {
      throw new Error('الخزينة غير موجودة')
    }

    const balanceAtTime = register.closing_balance || register.opening_balance

    const { data, error } = await supabase
      .from('cash_register_snapshots')
      .insert([
        {
          register_id: registerId,
          snapshot_time: new Date().toISOString(),
          balance_at_time: balanceAtTime,
          snapshot_type: snapshotType,
          created_by: createdBy,
          notes
        }
      ])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { registerId, snapshotType })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع اللقطة المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح: اللقطة ${data.id}`)
    return data
  } catch (error: any) {
    logError(functionName, error, { registerId, snapshotType })
    throw new Error(`فشل في إنشاء اللقطة: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get cash register snapshots
 */
export async function getCashSnapshots(
  registerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CashRegisterSnapshot[]> {
  const functionName = 'getCashSnapshots'

  try {
    if (!registerId) throw new Error('registerId مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: جلب لقطات الخزينة`)

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

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد لقطات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} لقطة`)
    return data
  } catch (error: any) {
    logError(functionName, error, { registerId })
    throw new Error(`فشل في جلب اللقطات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ==================== SETTLEMENT RECORD OPERATIONS ====================

/**
 * Create settlement record
 * ✅ Called after closing cash register
 */
export async function createSettlementRecord(
  storeid: string,
  registerId: string,
  totalSales: number,
  totalRefunds: number,
  totalExpenses: number,
  openingBalance: number,
  closingBalance: number,
  differenceReason?: string
): Promise<SettlementRecord> {
  const functionName = 'createSettlementRecord'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!registerId) throw new Error('registerId مطلوب')
    if (openingBalance < 0) throw new Error('opening_balance لا يمكن أن يكون سالب')
    if (closingBalance < 0) throw new Error('closing_balance لا يمكن أن يكون سالب')

    console.log(`[${functionName}] البدء: إنشاء تسوية جديدة`)

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
          difference_reason: differenceReason,
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
      throw new Error('فشل في إرجاع التسوية المُنشأة')
    }

    console.log(`[${functionName}] تم بنجاح: التسوية ${data.id}`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, registerId })
    throw new Error(`فشل في إنشاء التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get settlement records for a store
 */
export async function getSettlementRecords(
  storeid: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 50,
  offset: number = 0
): Promise<SettlementRecord[]> {
  const functionName = 'getSettlementRecords'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: جلب التسويات`)

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

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد تسويات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} تسوية`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب التسويات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get settlement record by ID
 */
export async function getSettlementById(settlementId: string): Promise<SettlementRecord | null> {
  const functionName = 'getSettlementById'

  try {
    if (!settlementId) throw new Error('settlementId مطلوب')

    console.log(`[${functionName}] البدء: settlementId=${settlementId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('settlement_record')
      .select('*')
      .eq('id', settlementId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] التسوية غير موجودة: ${settlementId}`)
        return null
      }
      logError(functionName, error, { settlementId })
      throw error
    }

    if (!data) {
      return null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { settlementId })
    throw new Error(`فشل في جلب التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Mark settlement as reconciled
 */
export async function reconcileSettlement(
  settlementId: string,
  reconciledByUserId: string,
  differenceReason?: string
): Promise<SettlementRecord> {
  const functionName = 'reconcileSettlement'

  try {
    if (!settlementId) throw new Error('settlementId مطلوب')
    if (!reconciledByUserId) throw new Error('reconciledByUserId مطلوب')

    console.log(`[${functionName}] البدء: توفيق التسوية ${settlementId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('settlement_record')
      .update({
        reconciled: true,
        reconciled_by: reconciledByUserId,
        reconciled_at: new Date().toISOString(),
        difference_reason: differenceReason
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
      throw new Error('فشل في إرجاع التسوية المُحدثة')
    }

    console.log(`[${functionName}] تم بنجاح: تم التوفيق`)
    return data
  } catch (error: any) {
    logError(functionName, error, { settlementId })
    throw new Error(`فشل في توفيق التسوية: ${error?.message || 'خطأ غير معروف'}`)
  }
}