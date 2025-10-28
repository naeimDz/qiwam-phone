// lib/db/payments.ts

import { InsertPayment, InsertCashMovement, Payment, CashMovement } from "@/lib/types/types";
import { createClientServer } from '@/lib/supabase'


// ==================== PAYMENT QUERIES ====================

/**
 * إدراج دفعة جديدة (يطلق Trigger تلقائياً)
 * الـ Trigger: fn_payment_after_insert
 * - يحدث حالة الفاتورة (paid/partial)
 * - يزامن الحركات المالية
 */
export async function insertPayment(data: InsertPayment): Promise<Payment> {
const supabase = await createClientServer()
  const { data: payment, error } = await supabase
    .from('payment')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(`Failed to insert payment: ${error.message}`);
  return payment;
}

/**
 * جلب الدفعات لفاتورة بيع معينة
 */
export async function getSalePayments(saleId: string): Promise<Payment[]> {
  const supabase = await createClientServer()
    const { data, error } = await supabase
    .from('payment')
    .select('*')
    .eq('sale_id', saleId)
    .order('createdat', { ascending: false });

  if (error) throw new Error(`Failed to fetch sale payments: ${error.message}`);
  return data || [];
}

/**
 * جلب الدفعات لفاتورة شراء معينة
 */
export async function getPurchasePayments(
  purchaseId: string
): Promise<Payment[]> {
    const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('payment')
    .select('*')
    .eq('purchase_id', purchaseId)
    .order('createdat', { ascending: false });

  if (error)
    throw new Error(`Failed to fetch purchase payments: ${error.message}`);
  return data || [];
}

/**
 * جلب إجمالي الدفعات لفاتورة
 */
export async function getTotalPayments(
  saleId?: string,
  purchaseId?: string
): Promise<number> {
    const supabase = await createClientServer()
  let query = supabase.from('payment').select('amount', { count: 'exact' });

  if (saleId) query = query.eq('sale_id', saleId);
  if (purchaseId) query = query.eq('purchase_id', purchaseId);

  query = query.eq('status', 'captured');

  const { data, error } = await query;

  if (error) throw new Error(`Failed to calculate total payments: ${error.message}`);
  return data?.reduce((sum, p) => sum + p.amount, 0) || 0;
}

/**
 * إلغاء دفعة
 */
export async function cancelPayment(
  paymentId: string,
  reason: string
): Promise<Payment> {
    const supabase = await createClientServer()
  const { data: payment, error } = await supabase
    .from('payment')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw new Error(`Failed to cancel payment: ${error.message}`);
  return payment;
}

/**
 * جلب دفعات متعددة للمتجر في فترة زمنية
 */
export async function getStorePaymentsByDateRange(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<Payment[]> {
    const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('payment')
    .select('*')
    .eq('storeid', storeId)
    .eq('status', 'captured')
    .gte('createdat', startDate.toISOString())
    .lte('createdat', endDate.toISOString())
    .order('createdat', { ascending: false });

  if (error) throw new Error(`Failed to fetch store payments: ${error.message}`);
  return data || [];
}

/**
 * تسجيل دفعة مع ربطها بخزينة نقدية
 */
export async function recordPaymentWithRegister(
  data: InsertPayment,
  registerId: string
): Promise<Payment> {
  const paymentWithRegister: InsertPayment = {
    ...data,
    register_id: registerId,
  };

  return insertPayment(paymentWithRegister);
}

// ==================== CASH MOVEMENT QUERIES ====================

/**
 * إدراج حركة نقدية (يطلق Trigger تلقائياً)
 * الـ Trigger: fn_stock_movement_after_insert (إذا كانت مرتبطة بمخزون)
 */
export async function insertCashMovement(
  data: InsertCashMovement
): Promise<CashMovement> {
    const supabase = await createClientServer()
  const { data: movement, error } = await supabase
    .from('cash_movement')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(`Failed to insert cash movement: ${error.message}`);
  return movement;
}

/**
 * جلب حركات النقدية للمتجر
 */
export async function getStoreCashMovements(
  storeId: string,
  type?: 'in' | 'out'
): Promise<CashMovement[]> {
    const supabase = await createClientServer()
  let query = supabase
    .from('cash_movement')
    .select('*')
    .eq('storeid', storeId);

  if (type) query = query.eq('movement_type', type);

  const { data, error } = await query.order('createdat', { ascending: false });

  if (error)
    throw new Error(`Failed to fetch cash movements: ${error.message}`);
  return data || [];
}

/**
 * حساب رصيد النقدية الكلي (الداخل - الخارج)
 */
export async function calculateTotalCashBalance(storeId: string): Promise<{
  totalIn: number;
  totalOut: number;
  balance: number;
}> {
  const movements = await getStoreCashMovements(storeId);

  const totalIn = movements
    .filter((m) => m.movement_type === 'in')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalOut = movements
    .filter((m) => m.movement_type === 'out')
    .reduce((sum, m) => sum + m.amount, 0);

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
}

/**
 * جلب حركات النقدية لفترة زمنية محددة
 */
export async function getCashMovementsByDateRange(
  storeId: string,
  startDate: Date,
  endDate: Date,
  type?: 'in' | 'out'
): Promise<CashMovement[]> {
    const supabase = await createClientServer()
  let query = supabase
    .from('cash_movement')
    .select('*')
    .eq('storeid', storeId)
    .gte('createdat', startDate.toISOString())
    .lte('createdat', endDate.toISOString());

  if (type) query = query.eq('movement_type', type);

  const { data, error } = await query.order('createdat', { ascending: false });

  if (error) throw new Error(`Failed to fetch cash movements: ${error.message}`);
  return data || [];
}

/**
 * ربط حركة نقدية بدفعة
 */
export async function linkCashMovementToPayment(
  paymentId: string,
  cashMovementId: string
): Promise<void> {
    const supabase = await createClientServer()
  const { error } = await supabase
    .from('cash_movement')
    .update({
      payment_id: paymentId,
    })
    .eq('id', cashMovementId);

  if (error)
    throw new Error(`Failed to link cash movement to payment: ${error.message}`);
}

/**
 * جلب حركات النقدية لدفعة معينة
 */
export async function getCashMovementsForPayment(
  paymentId: string
): Promise<CashMovement[]> {
    const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('cash_movement')
    .select('*')
    .eq('payment_id', paymentId);

  if (error) throw new Error(`Failed to fetch payment cash movements: ${error.message}`);
  return data || [];
}

/**
 * Get payment summary by method
 */
export async function getPaymentSummaryByMethod(storeid: string, days: number = 30) {
  const supabase = await createClientServer()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('payment')
    .select('method, amount, direction')
    .eq('storeid', storeid)
    .gte('createdat', startDate.toISOString())

  if (error) throw error
  
  const summary = {
    cash_in: 0,
    cash_out: 0,
    card_in: 0,
    card_out: 0,
    bank_in: 0,
    bank_out: 0,
    cheque_in: 0,
    cheque_out: 0,
    total_in: 0,
    total_out: 0,
    net: 0
  }
  
  data.forEach(p => {
    const amount = Number(p.amount)
    
    if (p.direction === 'in') {
      summary.total_in += amount
      if (p.method === 'cash') summary.cash_in += amount
      if (p.method === 'card') summary.card_in += amount
      if (p.method === 'bank_transfer') summary.bank_in += amount
      if (p.method === 'cheque') summary.cheque_in += amount
    } else {
      summary.total_out += amount
      if (p.method === 'cash') summary.cash_out += amount
      if (p.method === 'card') summary.card_out += amount
      if (p.method === 'bank_transfer') summary.bank_out += amount
      if (p.method === 'cheque') summary.cheque_out += amount
    }
  })
  
  summary.net = summary.total_in - summary.total_out
  
  return summary
}