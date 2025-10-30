// app/actions/expenses.actions.ts
// Server Actions - Expense operations with business logic & validation
'use server'

import { revalidatePath } from 'next/cache'
import { 
  getExpensesByStore, 
  getExpensesByStatus, 
  getExpenseById, 
  getExpensesByDateRange, 
  getExpensesByCategory,
  insertExpense, 
  updateExpenseStatus, 
  updateExpense, 
  deleteExpense,
  getExpenseStats 
} from '@/lib/supabase/db/expenses'
import { Expense, ExpenseWithDetails, ExpenseStatus, ExpensePaymentMethod } from '@/lib/types/expense'

// ==================== TYPES ====================

export interface ExpenseFormData {
  storeid: string
  category: string
  amount: number
  description?: string
  expense_date: Date
  createdby: string
  status: ExpenseStatus
  payment_method: ExpensePaymentMethod
  register_id?: string | null
}

export interface CreateExpenseInput {
  storeid: string
  category: string
  amount: number
  description?: string
  expense_date?: Date
  createdby: string
  payment_method: ExpensePaymentMethod
  register_id?: string | null
}

export interface UpdateExpenseInput {
  category?: string
  amount?: number
  description?: string
  expense_date?: Date
  payment_method?: ExpensePaymentMethod
}

export interface ExpenseFilters {
  status?: ExpenseStatus
  category?: string
  startDate?: Date
  endDate?: Date
}

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== CREATE ACTIONS ====================

/**
 * Create new expense
 */
export async function createExpenseAction(
  input: CreateExpenseInput
): Promise<ActionResponse<Expense>> {
  const functionName = 'createExpenseAction'
  
  try {
    console.log(`[${functionName}] البدء: إنشاء مصروف جديد`)

    // Validation
    if (!input.storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    if (!input.category || input.category.trim() === '') {
      return {
        success: false,
        error: 'اسم الفئة مطلوب'
      }
    }

    if (input.amount <= 0) {
      return {
        success: false,
        error: 'المبلغ يجب أن يكون أكبر من 0'
      }
    }

    if (!input.createdby) {
      return {
        success: false,
        error: 'معرف المستخدم مطلوب'
      }
    }

    if (!['cash', 'bank_transfer', 'check', 'other'].includes(input.payment_method)) {
      return {
        success: false,
        error: 'طريقة الدفع غير صحيحة'
      }
    }

    // Insert to DB
    const expense = await insertExpense({
      storeid: input.storeid,
      category: input.category.trim(),
      amount: input.amount,
      description: input.description?.trim() || null,
      expense_date: input.expense_date || new Date(),
      createdby: input.createdby,
      status: 'pending',
      payment_method: input.payment_method,
      register_id: input.register_id || null,
      paid_at: null,
      paid_by: null,
      createdat: new Date(),
      deleted_at: null
    } as any)

    console.log(`[${functionName}] ✅ تم: المصروف ${expense.id}`)

    // Revalidate cache
    revalidatePath('/expenses')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: expense,
      message: 'تم إنشاء المصروف بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في إنشاء المصروف'
    }
  }
}

// ==================== READ ACTIONS ====================

/**
 * Get all expenses with pagination
 */
export async function getExpensesAction(
  storeid: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<ExpenseWithDetails[]>> {
  const functionName = 'getExpensesAction'

  try {
    console.log(`[${functionName}] البدء: جلب المصروفات`)

    if (!storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    const expenses = await getExpensesByStore(storeid, limit, offset)

    return {
      success: true,
      data: expenses
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب المصروفات'
    }
  }
}

/**
 * Get expenses by status with pagination
 */
export async function getExpensesByStatusAction(
  storeid: string,
  status: ExpenseStatus,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResponse<ExpenseWithDetails[]>> {
  const functionName = 'getExpensesByStatusAction'

  try {
    console.log(`[${functionName}] البدء: جلب المصروفات بحالة ${status}`)

    if (!storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return {
        success: false,
        error: 'حالة غير صحيحة'
      }
    }

    const expenses = await getExpensesByStatus(storeid, status, limit, offset)

    return {
      success: true,
      data: expenses
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب المصروفات'
    }
  }
}

/**
 * Get single expense by ID
 */
export async function getExpenseAction(
  expenseId: string
): Promise<ActionResponse<ExpenseWithDetails | null>> {
  const functionName = 'getExpenseAction'

  try {
    console.log(`[${functionName}] البدء: جلب المصروف ${expenseId}`)

    if (!expenseId) {
      return {
        success: false,
        error: 'expenseId مطلوب'
      }
    }

    const expense = await getExpenseById(expenseId)

    return {
      success: true,
      data: expense
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب المصروف'
    }
  }
}

/**
 * Get expenses by date range
 */
export async function getExpensesByDateRangeAction(
  storeid: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<ExpenseWithDetails[]>> {
  const functionName = 'getExpensesByDateRangeAction'

  try {
    console.log(`[${functionName}] البدء: جلب المصروفات من ${startDate} إلى ${endDate}`)

    if (!storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    if (!startDate || !endDate) {
      return {
        success: false,
        error: 'التواريخ مطلوبة'
      }
    }

    if (startDate > endDate) {
      return {
        success: false,
        error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية'
      }
    }

    const expenses = await getExpensesByDateRange(storeid, startDate, endDate)

    return {
      success: true,
      data: expenses
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب المصروفات'
    }
  }
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategoryAction(
  storeid: string,
  category: string
): Promise<ActionResponse<ExpenseWithDetails[]>> {
  const functionName = 'getExpensesByCategoryAction'

  try {
    console.log(`[${functionName}] البدء: جلب المصروفات من فئة ${category}`)

    if (!storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    if (!category || category.trim() === '') {
      return {
        success: false,
        error: 'الفئة مطلوبة'
      }
    }

    const expenses = await getExpensesByCategory(storeid, category)

    return {
      success: true,
      data: expenses
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في جلب المصروفات'
    }
  }
}

/**
 * Get expense statistics
 */
export async function getExpenseStatsAction(
  storeid: string,
  days: number = 30
): Promise<ActionResponse<any>> {
  const functionName = 'getExpenseStatsAction'

  try {
    console.log(`[${functionName}] البدء: حساب الإحصائيات آخر ${days} يوم`)

    if (!storeid) {
      return {
        success: false,
        error: 'storeid مطلوب'
      }
    }

    if (days < 1 || days > 365) {
      return {
        success: false,
        error: 'عدد الأيام يجب أن يكون بين 1 و 365'
      }
    }

    const stats = await getExpenseStats(storeid, days)

    return {
      success: true,
      data: stats
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في حساب الإحصائيات'
    }
  }
}

// ==================== UPDATE ACTIONS ====================

/**
 * Update expense (category, amount, description, date)
 */
export async function updateExpenseAction(
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ActionResponse<Expense>> {
  const functionName = 'updateExpenseAction'

  try {
    console.log(`[${functionName}] البدء: تحديث المصروف ${expenseId}`)

    if (!expenseId) {
      return {
        success: false,
        error: 'expenseId مطلوب'
      }
    }

    // Validation
    if (input.amount !== undefined && input.amount <= 0) {
      return {
        success: false,
        error: 'المبلغ يجب أن يكون أكبر من 0'
      }
    }

    if (input.category !== undefined && input.category.trim() === '') {
      return {
        success: false,
        error: 'اسم الفئة لا يمكن أن يكون فارغ'
      }
    }

    if (input.payment_method !== undefined && 
        !['cash', 'bank_transfer', 'check', 'other'].includes(input.payment_method)) {
      return {
        success: false,
        error: 'طريقة دفع غير صحيحة'
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (input.category) updateData.category = input.category.trim()
    if (input.amount !== undefined) updateData.amount = input.amount
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.expense_date) updateData.expense_date = input.expense_date
    if (input.payment_method) updateData.payment_method = input.payment_method

    const expense = await updateExpense(expenseId, updateData)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/expenses')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: expense,
      message: 'تم تحديث المصروف بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تحديث المصروف'
    }
  }
}

/**
 * Mark expense as paid
 */
export async function markExpenseAsPaidAction(
  expenseId: string,
  paidById: string
): Promise<ActionResponse<Expense>> {
  const functionName = 'markExpenseAsPaidAction'

  try {
    console.log(`[${functionName}] البدء: تحديد المصروف كمدفوع`)

    if (!expenseId) {
      return {
        success: false,
        error: 'expenseId مطلوب'
      }
    }

    if (!paidById) {
      return {
        success: false,
        error: 'معرف المستخدم مطلوب'
      }
    }

    const expense = await updateExpenseStatus(expenseId, 'paid', paidById)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    revalidatePath('/cash-register')

    return {
      success: true,
      data: expense,
      message: 'تم تحديد المصروف كمدفوع بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في تحديد المصروف'
    }
  }
}

/**
 * Cancel expense
 */
export async function cancelExpenseAction(
  expenseId: string
): Promise<ActionResponse<Expense>> {
  const functionName = 'cancelExpenseAction'

  try {
    console.log(`[${functionName}] البدء: إلغاء المصروف ${expenseId}`)

    if (!expenseId) {
      return {
        success: false,
        error: 'expenseId مطلوب'
      }
    }

    const expense = await updateExpenseStatus(expenseId, 'cancelled')

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/expenses')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: expense,
      message: 'تم إلغاء المصروف بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في إلغاء المصروف'
    }
  }
}

// ==================== DELETE ACTIONS ====================

/**
 * Delete expense (soft delete)
 */
export async function deleteExpenseAction(
  expenseId: string
): Promise<ActionResponse<void>> {
  const functionName = 'deleteExpenseAction'

  try {
    console.log(`[${functionName}] البدء: حذف المصروف ${expenseId}`)

    if (!expenseId) {
      return {
        success: false,
        error: 'expenseId مطلوب'
      }
    }

    await deleteExpense(expenseId)

    console.log(`[${functionName}] ✅ تم`)

    // Revalidate cache
    revalidatePath('/expenses')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'تم حذف المصروف بنجاح'
    }
  } catch (error: any) {
    console.error(`[${functionName}] ❌ خطأ:`, error)
    return {
      success: false,
      error: error?.message || 'فشل في حذف المصروف'
    }
  }
}