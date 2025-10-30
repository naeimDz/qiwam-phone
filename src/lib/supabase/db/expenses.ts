// lib/supabase/db/expenses.ts
// DB Layer - Expense transactions with detailed error handling

import { createClientServer } from '@/lib/supabase'
import { Expense, ExpenseInsert, ExpenseWithDetails, ExpenseUpdate } from '@/lib/types/expense'


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
 * Get all expenses for a store
 */
export async function getExpensesByStore(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ExpenseWithDetails[]> {
  const functionName = 'getExpensesByStore'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (limit < 1 || limit > 500) throw new Error('limit يجب أن يكون بين 1 و 500')

    console.log(`[${functionName}] البدء: storeid=${storeid}, limit=${limit}, offset=${offset}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .select(`
        *,

        paid_by_user:paid_by(fullname)
      `)
      .eq('storeid', storeid)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, limit, offset })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد مصروفات للمتجر: ${storeid}`)
      return []
    }

    const result = data.map(e => ({
      ...e,
      created_by_name: e.created_by?.fullname || 'System',
      paid_by_name: e.paid_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} مصروف`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, limit, offset })
    throw new Error(`فشل في جلب المصروفات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get expenses by status
 */
export async function getExpensesByStatus(
  storeid: string,
  status: 'pending' | 'paid' | 'cancelled',
  limit: number = 50,
  offset: number = 0
): Promise<ExpenseWithDetails[]> {
  const functionName = 'getExpensesByStatus'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!['pending', 'paid', 'cancelled'].includes(status)) throw new Error('status غير صحيح')

    console.log(`[${functionName}] البدء: storeid=${storeid}, status=${status}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .select(`
        *,

        paid_by_user:paid_by(fullname)
      `)
      .eq('storeid', storeid)
      .eq('status', status)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logError(functionName, error, { storeid, status })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد مصروفات بحالة: ${status}`)
      return []
    }

    const result = data.map(e => ({
      ...e,
      created_by_name: e.created_by?.fullname || 'System',
      paid_by_name: e.paid_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} مصروف`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, status })
    throw new Error(`فشل في جلب المصروفات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get expense by ID
 */
export async function getExpenseById(expenseId: string): Promise<ExpenseWithDetails | null> {
  const functionName = 'getExpenseById'

  try {
    if (!expenseId) throw new Error('expenseId مطلوب')

    console.log(`[${functionName}] البدء: expenseId=${expenseId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .select(`
        *,

        paid_by_user:paid_by(fullname)
      `)
      .eq('id', expenseId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[${functionName}] المصروف غير موجود: ${expenseId}`)
        return null
      }
      logError(functionName, error, { expenseId })
      throw error
    }

    if (!data) {
      console.log(`[${functionName}] لا توجد بيانات للمصروف: ${expenseId}`)
      return null
    }

    const result = {
      ...data,
      created_by_name: data.created_by?.fullname || 'System',
      paid_by_name: data.paid_by_user?.fullname || null
    }

    console.log(`[${functionName}] تم بنجاح`)
    return result
  } catch (error: any) {
    logError(functionName, error, { expenseId })
    throw new Error(`فشل في جلب المصروف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get expenses by date range
 */
export async function getExpensesByDateRange(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<ExpenseWithDetails[]> {
  const functionName = 'getExpensesByDateRange'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!startDate || !endDate) throw new Error('التواريخ مطلوبة')
    if (startDate > endDate) throw new Error('تاريخ البداية أكبر من تاريخ النهاية')

    console.log(`[${functionName}] البدء: من ${startDate.toISOString()} إلى ${endDate.toISOString()}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .select(`
        *,

        paid_by_user:paid_by(fullname)
      `)
      .eq('storeid', storeid)
      .gte('expense_date', startDate.toISOString())
      .lte('expense_date', endDate.toISOString())
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, startDate, endDate })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد مصروفات في النطاق المحدد`)
      return []
    }

    const result = data.map(e => ({
      ...e,
      created_by_name: e.created_by?.fullname || 'System',
      paid_by_name: e.paid_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} مصروف`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, startDate, endDate })
    throw new Error(`فشل في جلب المصروفات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategory(
  storeid: string,
  category: string
): Promise<ExpenseWithDetails[]> {
  const functionName = 'getExpensesByCategory'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (!category) throw new Error('category مطلوبة')

    console.log(`[${functionName}] البدء: category=${category}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .select(`
        *,
        paid_by_user:paid_by(fullname)
      `)
      .eq('storeid', storeid)
      .eq('category', category)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })

    if (error) {
      logError(functionName, error, { storeid, category })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد مصروفات في الفئة: ${category}`)
      return []
    }

    const result = data.map(e => ({
      ...e,
      created_by_name: e.created_by?.fullname || 'System',
      paid_by_name: e.paid_by_user?.fullname || null
    }))

    console.log(`[${functionName}] تم بنجاح: ${result.length} مصروف`)
    return result
  } catch (error: any) {
    logError(functionName, error, { storeid, category })
    throw new Error(`فشل في جلب المصروفات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Insert new expense
 * ✅ Triggers automatically:
 *    - insert cash_movement (out)
 *    - insert audit_log
 */
export async function insertExpense(data: ExpenseInsert): Promise<Expense> {
  const functionName = 'insertExpense'

  try {
    if (!data.storeid) throw new Error('storeid مطلوب')
    if (!data.category) throw new Error('category مطلوبة')
    if (data.amount <= 0) throw new Error('المبلغ يجب أن يكون أكبر من 0')
    if (!['pending', 'paid', 'cancelled'].includes(data.status)) throw new Error('status غير صحيح')

    console.log(`[${functionName}] البدء: إنشاء مصروف جديد، المبلغ=${data.amount}`)

    const supabase = await createClientServer()

    const { data: expense, error } = await supabase
      .from('expense')
      .insert([data])
      .select('*')
      .single()

    if (error) {
      logError(functionName, error, { storeid: data.storeid, amount: data.amount })
      throw error
    }

    if (!expense) {
      throw new Error('فشل في إرجاع المصروف المُنشأ')
    }

    console.log(`[${functionName}] تم بنجاح: المصروف ${expense.id}`)
    return expense
  } catch (error: any) {
    logError(functionName, error, { data })
    throw new Error(`فشل في إنشاء المصروف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update expense status (pending → paid, cancelled)
 */
export async function updateExpenseStatus(
  expenseId: string,
  status: 'pending' | 'paid' | 'cancelled',
  paidById?: string
): Promise<Expense> {
  const functionName = 'updateExpenseStatus'

  try {
    if (!expenseId) throw new Error('expenseId مطلوب')
    if (!['pending', 'paid', 'cancelled'].includes(status)) throw new Error('status غير صحيح')

    console.log(`[${functionName}] البدء: تحديث حالة المصروف ${expenseId} إلى ${status}`)

    const supabase = await createClientServer()

    const updateData: any = {
      status,
      updatedat: new Date().toISOString()
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
      if (paidById) {
        updateData.paid_by = paidById
      }
    }

    const { data, error } = await supabase
      .from('expense')
      .update(updateData)
      .eq('id', expenseId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('المصروف غير موجود أو محذوف')
      }
      logError(functionName, error, { expenseId, status })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع المصروف المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { expenseId, status })
    throw new Error(`فشل في تحديث المصروف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Update expense details (category, amount, description)
 */
export async function updateExpense(
  expenseId: string,
  updates: ExpenseUpdate
): Promise<Expense> {
  const functionName = 'updateExpense'

  try {
    if (!expenseId) throw new Error('expenseId مطلوب')
    if (!updates || Object.keys(updates).length === 0) throw new Error('لا توجد تحديثات')

    // Validate numeric fields
    if (updates.amount !== undefined && updates.amount <= 0) throw new Error('المبلغ يجب أن يكون أكبر من 0')

    console.log(`[${functionName}] البدء: تحديث المصروف ${expenseId}`)

    const supabase = await createClientServer()

    const { data, error } = await supabase
      .from('expense')
      .update({
        ...updates,
        updatedat: new Date().toISOString()
      })
      .eq('id', expenseId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('المصروف غير موجود أو محذوف')
      }
      logError(functionName, error, { expenseId, updates })
      throw error
    }

    if (!data) {
      throw new Error('فشل في إرجاع المصروف المُحدّث')
    }

    console.log(`[${functionName}] تم بنجاح`)
    return data
  } catch (error: any) {
    logError(functionName, error, { expenseId, updates })
    throw new Error(`فشل في تحديث المصروف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Delete expense (soft delete)
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  const functionName = 'deleteExpense'

  try {
    if (!expenseId) throw new Error('expenseId مطلوب')

    console.log(`[${functionName}] البدء: حذف المصروف ${expenseId}`)

    const supabase = await createClientServer()

    const { error } = await supabase
      .from('expense')
      .update({
        deleted_at: new Date().toISOString(),
        updatedat: new Date().toISOString()
      })
      .eq('id', expenseId)

    if (error) {
      logError(functionName, error, { expenseId })
      throw error
    }

    console.log(`[${functionName}] تم بنجاح: المصروف ${expenseId} محذوف`)
  } catch (error: any) {
    logError(functionName, error, { expenseId })
    throw new Error(`فشل في حذف المصروف: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Get expense stats
 */
export async function getExpenseStats(storeid: string, days: number = 30) {
  const functionName = 'getExpenseStats'

  try {
    if (!storeid) throw new Error('storeid مطلوب')
    if (days < 1 || days > 365) throw new Error('days يجب أن يكون بين 1 و 365')

    console.log(`[${functionName}] البدء: حساب إحصائيات آخر ${days} يوم`)

    const supabase = await createClientServer()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('expense')
      .select('amount, status, category')
      .eq('storeid', storeid)
      .gte('expense_date', startDate.toISOString())
      .is('deleted_at', null)

    if (error) {
      logError(functionName, error, { storeid, days })
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[${functionName}] لا توجد مصروفات للفترة المحددة`)
      return getEmptyExpenseStats()
    }

    const stats = {
      total_expenses: 0,
      total_amount: 0,
      total_paid: 0,
      total_pending: 0,
      cancelled_expenses: 0,
      categories: {} as Record<string, number>
    }

    data.forEach(expense => {
      const amount = Number(expense.amount) || 0

      stats.total_expenses++
      stats.total_amount += amount

      if (expense.status === 'paid') {
        stats.total_paid += amount
      } else if (expense.status === 'pending') {
        stats.total_pending += amount
      } else if (expense.status === 'cancelled') {
        stats.cancelled_expenses++
      }

      // Count by category
      if (expense.category) {
        stats.categories[expense.category] = (stats.categories[expense.category] || 0) + amount
      }
    })

    console.log(`[${functionName}] تم بنجاح: ${stats.total_expenses} مصروف، إجمالي ${stats.total_amount}`)
    return stats
  } catch (error: any) {
    logError(functionName, error, { storeid, days })
    throw new Error(`فشل في حساب الإحصائيات: ${error?.message || 'خطأ غير معروف'}`)
  }
}

/**
 * Helper function to return empty stats
 */
function getEmptyExpenseStats() {
  return {
    total_expenses: 0,
    total_amount: 0,
    total_paid: 0,
    total_pending: 0,
    cancelled_expenses: 0,
    categories: {}
  }
}