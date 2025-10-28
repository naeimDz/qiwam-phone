// app/actions/cashMovement.actions.ts
'use server';

import {
  getStoreCashMovements,
  getCashMovementsByDateRange,
  calculateTotalCashBalance,
  insertCashMovement,
  linkCashMovementToPayment,
  getCashMovementsForPayment,
} from '@/lib/supabase/db/payments';
import { CashMovement, InsertCashMovement } from '@/lib/types/index';

// ==================== RESPONSE TYPES ====================
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== CASH MOVEMENT ACTIONS ====================

/**
 * إنشاء حركة نقدية
 */
export async function createCashMovementAction(
  data: InsertCashMovement
): Promise<ActionResponse<CashMovement>> {
  try {
    if (!data.storeid) {
      return { success: false, error: 'Store ID is required' };
    }
    if (data.amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!data.movement_type || !['in', 'out'].includes(data.movement_type)) {
      return { success: false, error: 'Invalid movement type' };
    }

    const movement = await insertCashMovement(data);
    return { success: true, data: movement };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب حركات النقدية
 */
export async function getCashMovementsAction(
  storeId: string,
  type?: 'in' | 'out'
): Promise<ActionResponse<CashMovement[]>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const movements = await getStoreCashMovements(storeId, type);
    return { success: true, data: movements };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب حركات النقدية لفترة زمنية
 */
export async function getCashMovementsByDateRangeAction(
  storeId: string,
  startDate: Date,
  endDate: Date,
  type?: 'in' | 'out'
): Promise<ActionResponse<CashMovement[]>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const movements = await getCashMovementsByDateRange(
      storeId,
      startDate,
      endDate,
      type
    );
    return { success: true, data: movements };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * حساب رصيد النقدية الكلي
 */
export async function getCashBalanceSummaryAction(
  storeId: string
): Promise<
  ActionResponse<{
    totalIn: number;
    totalOut: number;
    balance: number;
  }>
> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const balance = await calculateTotalCashBalance(storeId);
    return { success: true, data: balance };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ربط حركة نقدية بدفعة
 */
export async function linkCashMovementToPaymentAction(
  paymentId: string,
  cashMovementId: string
): Promise<ActionResponse<void>> {
  try {
    if (!paymentId || !cashMovementId) {
      return {
        success: false,
        error: 'Payment ID and Cash Movement ID are required',
      };
    }

    await linkCashMovementToPayment(paymentId, cashMovementId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب حركات النقدية لدفعة معينة
 */
export async function getCashMovementsForPaymentAction(
  paymentId: string
): Promise<ActionResponse<CashMovement[]>> {
  try {
    if (!paymentId) {
      return { success: false, error: 'Payment ID is required' };
    }

    const movements = await getCashMovementsForPayment(paymentId);
    return { success: true, data: movements };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ملخص حركات النقدية لفترة زمنية
 */
export async function getCashMovementsSummaryAction(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<
  ActionResponse<{
    count: number;
    totalIn: number;
    totalOut: number;
    methods: Record<string, { in: number; out: number }>;
  }>
> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const movements = await getCashMovementsByDateRange(
      storeId,
      startDate,
      endDate
    );

    const methods: Record<string, { in: number; out: number }> = {};
    let totalIn = 0;
    let totalOut = 0;

    movements.forEach((m) => {
      if (!methods[m.method]) {
        methods[m.method] = { in: 0, out: 0 };
      }

      if (m.movement_type === 'in') {
        methods[m.method].in += m.amount;
        totalIn += m.amount;
      } else {
        methods[m.method].out += m.amount;
        totalOut += m.amount;
      }
    });

    return {
      success: true,
      data: {
        count: movements.length,
        totalIn,
        totalOut,
        methods,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}