// app/actions/cashRegister.actions.ts
'use server';

import {
  createCashRegister,
  closeCashRegister,
  getCashRegisterById,
  getOpenCashRegister,
  getStoreCashRegisters,
  reconcileCashRegister,
  createCashSnapshot,
  getCashSnapshots,
  createSettlementRecord,
  getSettlementRecords,
  updateSettlementReconciliation,
} from '@/lib/supabase/db/cashRegister';
import { CashRegister, CashRegisterSnapshot, SettlementRecord }  from '../types/types';

// ==================== RESPONSE TYPES ====================
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== CASH REGISTER ACTIONS ====================

/**
 * فتح خزينة نقدية جديدة
 */
export async function openCashRegisterAction(
  storeId: string,
  openedByUserId: string,
  openingBalance: number
): Promise<ActionResponse<CashRegister>> {
  try {
    if (!storeId || !openedByUserId) {
      return { success: false, error: 'Store ID and User ID are required' };
    }
    if (openingBalance < 0) {
      return { success: false, error: 'Opening balance cannot be negative' };
    }

    // التحقق من عدم وجود خزينة مفتوحة
    const openRegister = await getOpenCashRegister(storeId);
    if (openRegister) {
      return {
        success: false,
        error: 'There is already an open cash register for this store',
      };
    }

    const register = await createCashRegister(
      storeId,
      openedByUserId,
      openingBalance
    );

    return { success: true, data: register };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إغلاق خزينة نقدية
 */
export async function closeCashRegisterAction(
  registerId: string,
  closedByUserId: string,
  closingBalance: number,
  notes?: string
): Promise<ActionResponse<CashRegister>> {
  try {
    if (!registerId || !closedByUserId) {
      return { success: false, error: 'Register ID and User ID are required' };
    }

    const register = await getCashRegisterById(registerId);

    if (register.status === 'closed') {
      return { success: false, error: 'Cash register is already closed' };
    }

    const updatedRegister = await closeCashRegister(
      registerId,
      closedByUserId,
      closingBalance,
      notes
    );

    return { success: true, data: updatedRegister };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب الخزينة المفتوحة
 */
export async function getOpenCashRegisterAction(
  storeId: string
): Promise<ActionResponse<CashRegister | null>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const register = await getOpenCashRegister(storeId);
    return { success: true, data: register };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب جميع خزائن المتجر
 */
export async function getStoreCashRegistersAction(
  storeId: string,
  status?: 'open' | 'closed'
): Promise<ActionResponse<CashRegister[]>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const registers = await getStoreCashRegisters(storeId, status);
    return { success: true, data: registers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * توفيق خزينة
 */
export async function reconcileCashRegisterAction(
  registerId: string,
  reconciledByUserId: string
): Promise<ActionResponse<CashRegister>> {
  try {
    if (!registerId || !reconciledByUserId) {
      return {
        success: false,
        error: 'Register ID and User ID are required',
      };
    }

    const register = await reconcileCashRegister(registerId, reconciledByUserId);
    return { success: true, data: register };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== CASH SNAPSHOT ACTIONS ====================

/**
 * إنشاء لقطة للخزينة
 */
export async function createCashSnapshotAction(
  registerId: string,
  balanceAtTime: number,
  snapshotType: 'automatic' | 'manual' | 'reconciliation' | 'shift_close',
  createdBy?: string,
  notes?: string
): Promise<ActionResponse<CashRegisterSnapshot>> {
  try {
    if (!registerId) {
      return { success: false, error: 'Register ID is required' };
    }

    const snapshot = await createCashSnapshot(
      registerId,
      balanceAtTime,
      snapshotType,
      createdBy,
      notes
    );

    return { success: true, data: snapshot };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب لقطات الخزينة
 */
export async function getCashSnapshotsAction(
  registerId: string,
  limit?: number
): Promise<ActionResponse<CashRegisterSnapshot[]>> {
  try {
    if (!registerId) {
      return { success: false, error: 'Register ID is required' };
    }

    const snapshots = await getCashSnapshots(registerId, limit);
    return { success: true, data: snapshots };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== SETTLEMENT ACTIONS ====================

/**
 * إنشاء سجل تسوية
 */
export async function createSettlementAction(
  storeId: string,
  registerId: string,
  totalSales: number,
  totalRefunds: number,
  totalExpenses: number,
  openingBalance: number,
  closingBalance: number
): Promise<ActionResponse<SettlementRecord>> {
  try {
    if (!storeId || !registerId) {
      return { success: false, error: 'Store ID and Register ID are required' };
    }

    const settlement = await createSettlementRecord(
      storeId,
      registerId,
      totalSales,
      totalRefunds,
      totalExpenses,
      openingBalance,
      closingBalance
    );

    return { success: true, data: settlement };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب سجلات التسوية
 */
export async function getSettlementRecordsAction(
  storeId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActionResponse<SettlementRecord[]>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const settlements = await getSettlementRecords(storeId, startDate, endDate);
    return { success: true, data: settlements };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * تحديث توفيق التسوية
 */
export async function updateSettlementReconciliationAction(
  settlementId: string,
  reconciledByUserId: string,
  differenceReason?: string
): Promise<ActionResponse<SettlementRecord>> {
  try {
    if (!settlementId || !reconciledByUserId) {
      return {
        success: false,
        error: 'Settlement ID and User ID are required',
      };
    }

    const settlement = await updateSettlementReconciliation(
      settlementId,
      reconciledByUserId,
      differenceReason
    );

    return { success: true, data: settlement };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}