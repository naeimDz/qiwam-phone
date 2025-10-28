// lib/db/cashRegister.ts
import { createClientServer } from '@/lib/supabase'
import { CashRegister, CashRegisterSnapshot, CashMovement, SettlementRecord }  from '@/lib/types/types';

// ==================== CASH REGISTER QUERIES ====================

/**
 * إنشاء خزينة نقدية جديدة
 */
export async function createCashRegister(
  storeId: string,
  openedByUserId: string,
  openingBalance: number
): Promise<CashRegister> {
      const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register')
    .insert([
      {
        storeid: storeId,
        opened_by: openedByUserId,
        opened_at: new Date().toISOString(),
        opening_balance: openingBalance,
        status: 'open',
        total_cash_in: 0,
        total_cash_out: 0,
        payment_count_in: 0,
        payment_count_out: 0,
        reconciled: false,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create cash register: ${error.message}`);
  return data;
}

/**
 * إغلاق خزينة نقدية
 */
export async function closeCashRegister(
  registerId: string,
  closedByUserId: string,
  closingBalance: number,
  notes?: string
): Promise<CashRegister> {
  const difference = closingBalance - (await getCashRegisterById(registerId)).opening_balance;
      const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register')
    .update({
      closed_by: closedByUserId,
      closed_at: new Date().toISOString(),
      closing_balance: closingBalance,
      difference,
      status: 'closed',
      notes,
    })
    .eq('id', registerId)
    .select()
    .single();

  if (error) throw new Error(`Failed to close cash register: ${error.message}`);
  return data;
}

/**
 * جلب خزينة بـ ID
 */
export async function getCashRegisterById(registerId: string): Promise<CashRegister> {
          const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register')
    .select('*')
    .eq('id', registerId)
    .single();

  if (error) throw new Error(`Failed to fetch cash register: ${error.message}`);
  return data;
}

/**
 * جلب الخزينة المفتوحة حالياً
 */
export async function getOpenCashRegister(storeId: string): Promise<CashRegister | null> {
          const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register')
    .select('*')
    .eq('storeid', storeId)
    .eq('status', 'open')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch open cash register: ${error.message}`);
  }

  return data || null;
}

/**
 * جلب جميع خزائن متجر معين
 */
export async function getStoreCashRegisters(
  storeId: string,
  status?: 'open' | 'closed'
): Promise<CashRegister[]> {
          const supabase = await createClientServer()

  let query = supabase
    .from('cash_register')
    .select('*')
    .eq('storeid', storeId);

  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('opened_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch cash registers: ${error.message}`);
  return data || [];
}

/**
 * تحديث رصيد الخزينة (يستخدم من الـ Triggers)
 */
export async function updateCashRegisterBalance(
  registerId: string,
  totalIn: number,
  totalOut: number,
  paymentCountIn: number,
  paymentCountOut: number
): Promise<void> {
          const supabase = await createClientServer()

  const { error } = await supabase
    .from('cash_register')
    .update({
      total_cash_in: totalIn,
      total_cash_out: totalOut,
      payment_count_in: paymentCountIn,
      payment_count_out: paymentCountOut,
    })
    .eq('id', registerId);

  if (error) throw new Error(`Failed to update cash register balance: ${error.message}`);
}

/**
 * تسجيل التوفيق (reconciliation)
 */
export async function reconcileCashRegister(
  registerId: string,
  reconciledByUserId: string
): Promise<CashRegister> {
          const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register')
    .update({
      reconciled: true,
      reconciled_by: reconciledByUserId,
    })
    .eq('id', registerId)
    .select()
    .single();

  if (error) throw new Error(`Failed to reconcile cash register: ${error.message}`);
  return data;
}

// ==================== CASH REGISTER SNAPSHOT QUERIES ====================

/**
 * إنشاء لقطة (snapshot) للخزينة
 */
export async function createCashSnapshot(
  registerId: string,
  balanceAtTime: number,
  snapshotType: 'automatic' | 'manual' | 'reconciliation' | 'shift_close',
  createdBy?: string,
  notes?: string
): Promise<CashRegisterSnapshot> {
          const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('cash_register_snapshot')
    .insert([
      {
        register_id: registerId,
        snapshot_time: new Date().toISOString(),
        balance_at_time: balanceAtTime,
        snapshot_type: snapshotType,
        created_by: createdBy,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create cash snapshot: ${error.message}`);
  return data;
}

/**
 * جلب لقطات الخزينة
 */
export async function getCashSnapshots(
  registerId: string,
  limit?: number
): Promise<CashRegisterSnapshot[]> {
          const supabase = await createClientServer()

  let query = supabase
    .from('cash_register_snapshot')
    .select('*')
    .eq('register_id', registerId)
    .order('snapshot_time', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch cash snapshots: ${error.message}`);
  return data || [];
}

// ==================== SETTLEMENT QUERIES ====================

/**
 * إنشاء سجل تسوية
 */
export async function createSettlementRecord(
  storeId: string,
  registerId: string,
  totalSales: number,
  totalRefunds: number,
  totalExpenses: number,
  openingBalance: number,
  closingBalance: number
): Promise<SettlementRecord> {
  const netCash = totalSales - totalRefunds - totalExpenses;
  const expectedBalance = openingBalance + netCash;
  const difference = closingBalance - expectedBalance;
      const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('settlement_record')
    .insert([
      {
        storeid: storeId,
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
        reconciled: false,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create settlement record: ${error.message}`);
  return data;
}

/**
 * جلب سجلات التسوية
 */
export async function getSettlementRecords(
  storeId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SettlementRecord[]> {
          const supabase = await createClientServer()

  let query = supabase
    .from('settlement_record')
    .select('*')
    .eq('storeid', storeId);

  if (startDate) {
    query = query.gte('settlement_date', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('settlement_date', endDate.toISOString());
  }

  const { data, error } = await query.order('settlement_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch settlement records: ${error.message}`);
  return data || [];
}

/**
 * تحديث حالة التسوية
 */
export async function updateSettlementReconciliation(
  settlementId: string,
  reconciledByUserId: string,
  differenceReason?: string
): Promise<SettlementRecord> {
          const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('settlement_record')
    .update({
      reconciled: true,
      reconciled_by: reconciledByUserId,
      reconciled_at: new Date().toISOString(),
      difference_reason: differenceReason,
    })
    .eq('id', settlementId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update settlement reconciliation: ${error.message}`);
  return data;
}