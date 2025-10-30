// ============================================================================
// app/actions/auditLog.ts
// Server Actions - Audit log operations (READ ONLY)
// ============================================================================

import {
  getAuditLog,
  getAuditByEntity,
  getAuditByDateRange,
  getAuditByUser,
  getAuditByAction,
  exportAuditLog
} from '@/lib/supabase/db/auditLog'
import { AuditLog } from '@/lib/types'

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== READ ACTIONS ====================

/**
 * Get audit log for store
 */
export async function getAuditLogAction(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<{ logs: AuditLog[]; total: number }>> {
  const functionName = 'getAuditLogAction'

  try {
    console.log(`[${functionName}] البدء: جلب سجل التدقيق`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    const logs = await getAuditLog(storeid, limit, offset)

    return {
      success: true,
      data: {
        logs,
        total: logs.length
      }
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب السجل'
    }
  }
}

/**
 * Get audit log by entity
 */
export async function getAuditByEntityAction(
  storeid: string,
  entity: string,
  entityId: string,
  limit: number = 50
): Promise<ActionResponse<AuditLog[]>> {
  const functionName = 'getAuditByEntityAction'

  try {
    console.log(`[${functionName}] البدء: جلب السجل للـ ${entity}`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!entity) {
      return { success: false, error: 'entity مطلوب' }
    }

    if (!entityId) {
      return { success: false, error: 'entityId مطلوب' }
    }

    const logs = await getAuditByEntity(storeid, entity, entityId, limit)

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب السجل'
    }
  }
}

/**
 * Get audit log by date range
 */
export async function getAuditByDateRangeAction(
  storeid: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50
): Promise<ActionResponse<AuditLog[]>> {
  const functionName = 'getAuditByDateRangeAction'

  try {
    console.log(`[${functionName}] البدء: جلب السجل من ${startDate} إلى ${endDate}`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!startDate || !endDate) {
      return { success: false, error: 'التواريخ مطلوبة' }
    }

    if (startDate > endDate) {
      return { success: false, error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' }
    }

    const logs = await getAuditByDateRange(storeid, startDate, endDate, limit)

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب السجل'
    }
  }
}

/**
 * Get audit log by user
 */
export async function getAuditByUserAction(
  storeid: string,
  userid: string,
  limit: number = 50
): Promise<ActionResponse<AuditLog[]>> {
  const functionName = 'getAuditByUserAction'

  try {
    console.log(`[${functionName}] البدء: جلب سجل المستخدم`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!userid) {
      return { success: false, error: 'userid مطلوب' }
    }

    const logs = await getAuditByUser(storeid, userid, limit)

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب السجل'
    }
  }
}

/**
 * Get audit log by action
 */
export async function getAuditByActionAction(
  storeid: string,
  action: string,
  limit: number = 50
): Promise<ActionResponse<AuditLog[]>> {
  const functionName = 'getAuditByActionAction'

  try {
    console.log(`[${functionName}] البدء: جلب سجل العملية ${action}`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!action) {
      return { success: false, error: 'action مطلوب' }
    }

    const logs = await getAuditByAction(storeid, action, limit)

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب السجل'
    }
  }
}

/**
 * Export audit log as JSON
 */
export async function exportAuditLogAction(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<{ filename: string; count: number; data: string }>> {
  const functionName = 'exportAuditLogAction'

  try {
    console.log(`[${functionName}] البدء: تصدير سجل التدقيق`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (!startDate || !endDate) {
      return { success: false, error: 'التواريخ مطلوبة' }
    }

    if (startDate > endDate) {
      return { success: false, error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' }
    }

    const logs = await exportAuditLog(storeid, startDate, endDate)

    const filename = `audit-log-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.json`
    const jsonData = JSON.stringify(logs, null, 2)

    console.log(`[${functionName}] ✅ تم: تم تصدير ${logs.length} سجل`)

    return {
      success: true,
      data: {
        filename,
        count: logs.length,
        data: jsonData
      },
      message: `تم تصدير ${logs.length} سجل بنجاح`
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تصدير السجل'
    }
  }
}