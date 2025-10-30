// lib/actions/stockMovements.actions.ts
// Actions Layer - Stock movement reporting & analytics
// READ-ONLY - Movements are created automatically by triggers

'use server'

import * as stockMovementsDb from '@/lib/supabase/db/stockMovments'
import * as authDb from '@/lib/supabase/db/auth'
import { StockMovementWithDetails, StockMovementStats } from '@/lib/types'
import { ActionResult } from '../types/action.types'



// ==================== REPORTING ACTIONS ====================

/**
 * Get all stock movements for store
 */
export async function getStockMovementsAction(
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<StockMovementWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (limit < 1 || limit > 500) {
      return { success: false, error: 'الحد يجب أن يكون بين 1 و 500' }
    }

    const movements = await stockMovementsDb.getStockMovements(
      user.storeid,
      limit,
      offset
    )

    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getStockMovementsAction error:', error)
    return { success: false, error: 'فشل تحميل حركات المخزون' }
  }
}

/**
 * Get movements for specific product
 */
export async function getProductMovementsAction(
  itemType: 'phone' | 'accessory',
  productId: string
): Promise<ActionResult<StockMovementWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!itemType || !['phone', 'accessory'].includes(itemType)) {
      return { success: false, error: 'نوع المنتج غير صحيح' }
    }

    if (!productId) {
      return { success: false, error: 'معرف المنتج مطلوب' }
    }

    const movements = await stockMovementsDb.getMovementsByProduct(
      user.storeid,
      itemType,
      productId
    )

    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getProductMovementsAction error:', error)
    return { success: false, error: 'فشل تحميل حركات المنتج' }
  }
}

/**
 * Get movements by date range
 */
export async function getMovementsByDateRangeAction(
  startDate: Date,
  endDate: Date
): Promise<ActionResult<StockMovementWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!startDate || !endDate) {
      return { success: false, error: 'التواريخ مطلوبة' }
    }

    if (startDate > endDate) {
      return { success: false, error: 'تاريخ البداية يجب أن يكون قبل النهاية' }
    }

    const movements = await stockMovementsDb.getMovementsByDateRange(
      user.storeid,
      startDate,
      endDate
    )

    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getMovementsByDateRangeAction error:', error)
    return { success: false, error: 'فشل تحميل الحركات' }
  }
}

/**
 * Get stock movement summary (for dashboard)
 */
export async function getStockMovementSummaryAction(
  days: number = 30
): Promise<ActionResult<any>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (days < 1 || days > 365) {
      return { success: false, error: 'عدد الأيام غير صحيح' }
    }

    const summary = await stockMovementsDb.getMovementsBySummary(
      user.storeid,
      days
    )

    return { success: true, data: summary }
  } catch (error: any) {
    console.error('getStockMovementSummaryAction error:', error)
    return { success: false, error: 'فشل حساب الملخص' }
  }
}

/**
 * Get movements with advanced filters
 */
export async function getMovementsFilteredAction(
  filters: {
    movementType?: 'in' | 'out' | 'adjustment' | 'return'
    itemType?: 'phone' | 'accessory'
    isAdjustment?: boolean
    startDate?: Date
    endDate?: Date
  },
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<StockMovementWithDetails[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (limit < 1 || limit > 500) {
      return { success: false, error: 'الحد يجب أن يكون بين 1 و 500' }
    }

    // Validate date range if both provided
    if (filters.startDate && filters.endDate) {
      if (filters.startDate > filters.endDate) {
        return { success: false, error: 'تاريخ البداية يجب أن يكون قبل النهاية' }
      }
    }

    const movements = await stockMovementsDb.getMovementsFiltered(
      user.storeid,
      filters,
      limit,
      offset
    )

    return { success: true, data: movements }
  } catch (error: any) {
    console.error('getMovementsFilteredAction error:', error)
    return { success: false, error: 'فشل تحميل الحركات' }
  }
}

/**
 * Get movements stats by type
 */
export async function getMovementsStatsByTypeAction(): Promise<
  ActionResult<{
    totalIn: number
    totalOut: number
    totalAdjustments: number
    totalReturns: number
    net: number
  }>
> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const stats = await stockMovementsDb.getMovementsBySummary(user.storeid, 30)

    return {
      success: true,
      data: {
        totalIn: stats.total_in,
        totalOut: stats.total_out,
        totalAdjustments: stats.total_adjustments,
        totalReturns: stats.total_returns,
        net: stats.net_movement
      }
    }
  } catch (error: any) {
    console.error('getMovementsStatsByTypeAction error:', error)
    return { success: false, error: 'فشل حساب الإحصائيات' }
  }
}

/**
 * ⚠️ IMPORTANT: Stock adjustments are NOT created manually
 * 
 * They are created automatically by these triggers:
 * - tr_create_stock_movement_on_sale (sale item added)
 * - tr_update_phone_status_on_sale (phone status changed)
 * - tr_create_stock_movement_on_purchase (purchase item added)
 * - tr_revert_stock_on_sale_item_delete (sale item removed)
 * - tr_revert_phone_status_on_return (return approved)
 * - etc.
 * 
 * To create manual adjustments:
 * 1. Use admin dashboard UI
 * 2. The trigger automatically creates the stock_movement record
 * 3. Query it here for reporting
 */