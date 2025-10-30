// ============================================================================
// lib/supabase/db/notifications.ts
// DB Layer - Notification operations (mostly read-only)
// ============================================================================

import { createClientServer } from '@/lib/supabase'
import { Notification, NotificationType } from '@/lib/types'

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

/**
 * Get notifications for a user (paginated)
 */
export async function getNotifications(
  userid: string,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> {
  const functionName = 'getNotifications'

  try {
    if (!userid) throw new Error('userid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: userid=${userid}, limit=${limit}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('userid', userid)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { userid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إشعارات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} إشعار`)
    return data
  } catch (error: any) {
    logError(functionName, error, { userid, limit, offset })
    throw new Error(`فشل في جلب الإشعارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(
  userid: string,
  limit: number = 50
): Promise<Notification[]> {
  const functionName = 'getUnreadNotifications'

  try {
    if (!userid) throw new Error('userid مطلوب')

    console.log(`[${functionName}] البدء: جلب الإشعارات غير المقروءة`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('userid', userid)
      .eq('read', false)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { userid })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إشعارات غير مقروءة`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} إشعار`)
    return data
  } catch (error: any) {
    logError(functionName, error, { userid })
    throw new Error(`فشل في جلب الإشعارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get notifications by type
 */
export async function getNotificationsByType(
  userid: string,
  type: NotificationType,
  limit: number = 50
): Promise<Notification[]> {
  const functionName = 'getNotificationsByType'

  try {
    if (!userid) throw new Error('userid مطلوب')
    if (!['info', 'warning', 'error', 'success'].includes(type)) throw new Error('type غير صحيح')

    console.log(`[${functionName}] البدء: type=${type}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('userid', userid)
      .eq('type', type)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { userid, type })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد إشعارات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} إشعار`)
    return data
  } catch (error: any) {
    logError(functionName, error, { userid, type })
    throw new Error(`فشل في جلب الإشعارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<Notification> {
  const functionName = 'markAsRead'

  try {
    if (!notificationId) throw new Error('notificationId مطلوب')

    console.log(`[${functionName}] البدء: تحديد الإشعار كمقروء`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('notification')
      .update({
        read: true,
        readat: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('الإشعار غير موجود')
      }
      logError(functionName, error, { notificationId })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع الإشعار المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { notificationId })
    throw new Error(`فشل في تحديث الإشعار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userid: string): Promise<number> {
  const functionName = 'markAllAsRead'

  try {
    if (!userid) throw new Error('userid مطلوب')

    console.log(`[${functionName}] البدء: تحديد جميع الإشعارات كمقروءة`)

    const supabase = await createClientServer()

    const { count, error } = await supabase
      .from('notification')
      .update({
        read: true,
        readat: new Date().toISOString()
      })
      .eq('userid', userid)
      .eq('read', false)

    if (error) {
      logError(functionName, error, { userid })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: تم تحديث ${count} إشعار`)
    return count || 0
  } catch (error: any) {
    logError(functionName, error, { userid })
    throw new Error(`فشل في تحديث الإشعارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Delete notification (soft delete)
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const functionName = 'deleteNotification'

  try {
    if (!notificationId) throw new Error('notificationId مطلوب')

    console.log(`[${functionName}] البدء: حذف الإشعار ${notificationId}`)

    const supabase = await createClientServer()

    const { error } = await supabase
      .from('notification')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', notificationId)

    if (error) {
      logError(functionName, error, { notificationId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح`)
  } catch (error: any) {
    logError(functionName, error, { notificationId })
    throw new Error(`فشل في حذف الإشعار: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Clear old notifications (soft delete)
 */
export async function clearOldNotifications(storeid: string, daysOld: number): Promise<number> {
  const functionName = 'clearOldNotifications'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (daysOld < 1) throw new Error('daysOld يجب أن يكون أكبر من 0')

    console.log(`[${functionName}] البدء: حذف الإشعارات الأقدم من ${daysOld} يوم`)

    const supabase = await createClientServer()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { count, error } = await supabase
      .from('notification')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('storeid', storeid)
      .lt('createdat', cutoffDate.toISOString())
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid, daysOld })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: تم حذف ${count} إشعار`)
    return count || 0
  } catch (error: any) {
    logError(functionName, error, { storeid, daysOld })
    throw new Error(`فشل في حذف الإشعارات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

// ============================================================================
// lib/supabase/db/auditLog.ts
// DB Layer - Audit log queries (READ ONLY)
// ============================================================================

import { AuditLog } from '@/lib/types'

/**
 * Get audit logs for a store (paginated)
 */
export async function getAuditLog(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  const functionName = 'getAuditLog'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: storeid=${storeid}, limit=${limit}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات تدقيق`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب سجلات التدقيق: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get audit log by entity (phone, accessory, sale, etc)
 */
export async function getAuditByEntity(
  storeid: string,
  entity: string,
  entityId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const functionName = 'getAuditByEntity'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!entity) throw new Error('entity مطلوب')
    if (!entityId) throw new Error('entityId مطلوب')

    console.log(`[${functionName}] البدء: entity=${entity}, entityId=${entityId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .eq('entity', entity)
      .eq('entityid', entityId)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, entity, entityId })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, entity, entityId })
    throw new Error(`فشل في جلب السجلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get audit log by date range
 */
export async function getAuditByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date,
  limit: number = 50
): Promise<AuditLog[]> {
  const functionName = 'getAuditByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: من ${startDate} إلى ${endDate}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب السجلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get audit log by user
 */
export async function getAuditByUser(
  storeid: string,
  userid: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const functionName = 'getAuditByUser'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!userid) throw new Error('userid مطلوب')

    console.log(`[${functionName}] البدء: userid=${userid}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .eq('userid', userid)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, userid })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, userid })
    throw new Error(`فشل في جلب السجلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get audit log by action
 */
export async function getAuditByAction(
  storeid: string,
  action: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const functionName = 'getAuditByAction'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!action) throw new Error('action مطلوب')

    console.log(`[${functionName}] البدء: action=${action}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .eq('action', action)
      .is('deleted_at', null)
      .order('createdat', { ascending: false })
      .limit(limit)

    if (error) {
      logError(functionName, error, { storeid, action })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, action })
    throw new Error(`فشل في جلب السجلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Export audit log as JSON
 */
export async function exportAuditLog(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<AuditLog[]> {
  const functionName = 'exportAuditLog'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: تصدير السجلات من ${startDate} إلى ${endDate}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('storeid', storeid)
      .gte('createdat', startDate.toISOString())
      .lte('createdat', endDate.toISOString())
      .is('deleted_at', null)
      .order('createdat', { ascending: true })

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد سجلات`)
      return []
    }

    console.log(`[${functionName}] تم بنجاح: تم تصدير ${data.length} سجل`)
    return data
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في تصدير السجلات: ${error?.message || 'خطأ غير معروف'}`)
  }
}