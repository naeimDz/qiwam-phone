import { AuditLog } from '@/lib/types'
import { createClientServer } from '../supabaseServer'


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