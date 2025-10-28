// app/actions/payment.actions.ts
'use server';

import {
  insertPayment,
  getSalePayments,
  getPurchasePayments,
  getTotalPayments,
  cancelPayment,
  recordPaymentWithRegister,
  getStorePaymentsByDateRange,
} from '@/lib/supabase/db/payments';
import { InsertPayment, Payment } from '../types/enums';

// ==================== RESPONSE TYPES ====================
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== PAYMENT ACTIONS ====================

/**
 * إنشاء دفعة جديدة
 * ✨ الـ Trigger يتولى تحديث حالة الفاتورة تلقائياً
 */
export async function createPaymentAction(
  data: InsertPayment
): Promise<ActionResponse<Payment>> {
  try {
    // التحقق من البيانات الأساسية
    if (!data.storeid) {
      return { success: false, error: 'Store ID is required' };
    }
    if (data.amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    // التحقق من أن الدفعة مرتبطة بأحد العناصر الثلاثة
    if (!data.sale_id && !data.purchase_id && !data.expense_id) {
      return {
        success: false,
        error: 'Payment must be linked to sale, purchase, or expense',
      };
    }

    const payment = await insertPayment(data);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب الدفعات لفاتورة بيع
 */
export async function getSalePaymentsAction(
  saleId: string
): Promise<ActionResponse<Payment[]>> {
  try {
    if (!saleId) {
      return { success: false, error: 'Sale ID is required' };
    }

    const payments = await getSalePayments(saleId);

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب الدفعات لفاتورة شراء
 */
export async function getPurchasePaymentsAction(
  purchaseId: string
): Promise<ActionResponse<Payment[]>> {
  try {
    if (!purchaseId) {
      return { success: false, error: 'Purchase ID is required' };
    }

    const payments = await getPurchasePayments(purchaseId);

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * حساب إجمالي الدفعات لفاتورة
 */
export async function getTotalPaymentsAction(
  saleId?: string,
  purchaseId?: string
): Promise<ActionResponse<number>> {
  try {
    if (!saleId && !purchaseId) {
      return {
        success: false,
        error: 'Either saleId or purchaseId is required',
      };
    }

    const total = await getTotalPayments(saleId, purchaseId);

    return {
      success: true,
      data: total,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إلغاء دفعة
 * ⚠️ يجب التعامل مع الانعكاسات في الـ Trigger
 */
export async function cancelPaymentAction(
  paymentId: string,
  reason: string
): Promise<ActionResponse<Payment>> {
  try {
    if (!paymentId) {
      return { success: false, error: 'Payment ID is required' };
    }
    if (!reason) {
      return { success: false, error: 'Cancellation reason is required' };
    }

    const payment = await cancelPayment(paymentId, reason);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إنشاء دفعة مع ربطها بخزينة نقدية
 */
export async function createPaymentWithRegisterAction(
  data: InsertPayment,
  registerId: string
): Promise<ActionResponse<Payment>> {
  try {
    if (!registerId) {
      return { success: false, error: 'Register ID is required' };
    }

    const payment = await recordPaymentWithRegister(data, registerId);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * جلب دفعات المتجر لفترة زمنية
 */
export async function getStorePaymentsByDateRangeAction(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<Payment[]>> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const payments = await getStorePaymentsByDateRange(
      storeId,
      startDate,
      endDate
    );

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * حساب ملخص الدفعات (عدد + إجمالي)
 */
export async function getPaymentsSummaryAction(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<
  ActionResponse<{
    count: number;
    total: number;
    methods: Record<string, number>;
  }>
> {
  try {
    if (!storeId) {
      return { success: false, error: 'Store ID is required' };
    }

    const payments = await getStorePaymentsByDateRange(
      storeId,
      startDate,
      endDate
    );

    const methods: Record<string, number> = {};
    let total = 0;

    payments.forEach((p) => {
      total += p.amount;
      methods[p.method] = (methods[p.method] || 0) + p.amount;
    });

    return {
      success: true,
      data: {
        count: payments.length,
        total,
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