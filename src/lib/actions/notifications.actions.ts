// ============================================================================
// app/actions/notifications.ts
// Server Actions - Notification operations
// ============================================================================

'use server'

import { revalidatePath } from 'next/cache'
import {
  getNotifications,
  getUnreadNotifications,
  getNotificationsByType,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearOldNotifications
} from '@/lib/supabase/db/notifications'
import { Notification, NotificationType } from '@/lib/types'

// ==================== TYPES ====================

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== READ ACTIONS ====================

/**
 * Get notifications for user
 */
export async function getNotificationsAction(
  userid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<Notification[]>> {
  const functionName = 'getNotificationsAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإشعارات`)

    if (!userid) {
      return { success: false, error: 'userid مطلوب' }
    }

    const notifications = await getNotifications(userid, limit, offset)

    return {
      success: true,
      data: notifications
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإشعارات'
    }
  }
}

/**
 * Get unread notifications
 */
export async function getUnreadNotificationsAction(
  userid: string,
  limit: number = 50
): Promise<ActionResponse<{ notifications: Notification[]; count: number }>> {
  const functionName = 'getUnreadNotificationsAction'

  try {
    console.log(`[${functionName}] البدء: جلب الإشعارات غير المقروءة`)

    if (!userid) {
      return { success: false, error: 'userid مطلوب' }
    }

    const notifications = await getUnreadNotifications(userid, limit)

    return {
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإشعارات'
    }
  }
}

/**
 * Get notifications by type
 */
export async function getNotificationsByTypeAction(
  userid: string,
  type: NotificationType,
  limit: number = 50
): Promise<ActionResponse<Notification[]>> {
  const functionName = 'getNotificationsByTypeAction'

  try {
    console.log(`[${functionName}] البدء: جلب إشعارات نوع ${type}`)

    if (!userid) {
      return { success: false, error: 'userid مطلوب' }
    }

    if (!['info', 'warning', 'error', 'success'].includes(type)) {
      return { success: false, error: 'نوع الإشعار غير صحيح' }
    }

    const notifications = await getNotificationsByType(userid, type, limit)

    return {
      success: true,
      data: notifications
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب الإشعارات'
    }
  }
}

// ==================== UPDATE ACTIONS ====================

/**
 * Mark single notification as read
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<ActionResponse<Notification>> {
  const functionName = 'markNotificationAsReadAction'

  try {
    console.log(`[${functionName}] البدء: تحديد الإشعار كمقروء`)

    if (!notificationId) {
      return { success: false, error: 'notificationId مطلوب' }
    }

    const notification = await markAsRead(notificationId)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: notification,
      message: 'تم تحديد الإشعار كمقروء'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تحديث الإشعار'
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadAction(
  userid: string
): Promise<ActionResponse<{ count: number }>> {
  const functionName = 'markAllNotificationsAsReadAction'

  try {
    console.log(`[${functionName}] البدء: تحديد جميع الإشعارات كمقروءة`)

    if (!userid) {
      return { success: false, error: 'userid مطلوب' }
    }

    const count = await markAllAsRead(userid)

    console.log(`[${functionName}] ✅ تم: تم تحديث ${count} إشعار`)

    // Revalidate cache
    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { count },
      message: `تم تحديد ${count} إشعار كمقروء`
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تحديث الإشعارات'
    }
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<ActionResponse<void>> {
  const functionName = 'deleteNotificationAction'

  try {
    console.log(`[${functionName}] البدء: حذف الإشعار`)

    if (!notificationId) {
      return { success: false, error: 'notificationId مطلوب' }
    }

    await deleteNotification(notificationId)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في حذف الإشعار'
    }
  }
}

/**
 * Clear old notifications
 */
export async function clearOldNotificationsAction(
  storeid: string,
  daysOld: number = 30
): Promise<ActionResponse<{ count: number }>> {
  const functionName = 'clearOldNotificationsAction'

  try {
    console.log(`[${functionName}] البدء: حذف الإشعارات القديمة`)

    if (!storeid) {
      return { success: false, error: 'storeid مطلوب' }
    }

    if (daysOld < 1) {
      return { success: false, error: 'عدد الأيام يجب أن يكون أكبر من 0' }
    }

    const count = await clearOldNotifications(storeid, daysOld)

    console.log(`[${functionName}] ✅ تم: تم حذف ${count} إشعار`)

    // Revalidate cache
    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { count },
      message: `تم حذف ${count} إشعار قديم`
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في حذف الإشعارات'
    }
  }
}

