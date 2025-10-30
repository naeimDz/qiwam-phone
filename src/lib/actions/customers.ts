// lib/actions/customers.ts
'use server'

import { revalidatePath } from 'next/cache'
import * as customersDb from '@/lib/supabase/db/customers'
import * as authDb from '@/lib/supabase/db/auth'
import { Customer } from '@/lib/types'
import { ActionResult } from '../types/action.types'


/**
 * Get all customers for current user's store
 */
export async function getCustomersAction(activeOnly: boolean = false): Promise<ActionResult<Customer[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customers = await customersDb.getCustomersByStore(user.storeid, activeOnly)
    return { success: true, data: customers }
  } catch (error: any) {
    return { success: false, error: 'فشل تحميل العملاء' }
  }
}

/**
 * Create new customer
 */
export async function createCustomerAction(formData: FormData): Promise<ActionResult<Customer>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const fullname = formData.get('fullname') as string
    const phone = formData.get('phone') as string | null
    const address = formData.get('address') as string | null
    const notes = formData.get('notes') as string | null
    
    // Validation
    if (!fullname || fullname.trim().length === 0) {
      return { success: false, error: 'اسم العميل مطلوب' }
    }

    if (fullname.trim().length < 2) {
      return { success: false, error: 'اسم العميل يجب أن يكون حرفين على الأقل' }
    }

    if (fullname.trim().length > 100) {
      return { success: false, error: 'اسم العميل طويل جداً (100 حرف كحد أقصى)' }
    }

    // Check if phone already exists (optional field but must be unique if provided)
    if (phone && phone.trim()) {
      const phoneExists = await customersDb.customerPhoneExists(user.storeid, phone.trim())
      if (phoneExists) {
        return { success: false, error: 'رقم الهاتف موجود بالفعل' }
      }
    }

    const customer = await customersDb.insertCustomer({
      storeid: user.storeid,
      fullname: fullname.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
      active: true
    })

    revalidatePath('/admin/customers')
    return { success: true, data: customer }
  } catch (error: any) {
    console.error('createCustomerAction error:', error)
    return { success: false, error: 'فشل إضافة العميل' }
  }
}

/**
 * Update customer
 */
export async function updateCustomerAction(customerId: string, formData: FormData): Promise<ActionResult<Customer>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const fullname = formData.get('fullname') as string
    const phone = formData.get('phone') as string | null
    const address = formData.get('address') as string | null
    const notes = formData.get('notes') as string | null
    
    // Validation
    if (!fullname || fullname.trim().length === 0) {
      return { success: false, error: 'اسم العميل مطلوب' }
    }

    if (fullname.trim().length < 2) {
      return { success: false, error: 'اسم العميل يجب أن يكون حرفين على الأقل' }
    }

    if (fullname.trim().length > 100) {
      return { success: false, error: 'اسم العميل طويل جداً (100 حرف كحد أقصى)' }
    }

    // Check if phone already exists (excluding current customer)
    if (phone && phone.trim()) {
      const phoneExists = await customersDb.customerPhoneExists(user.storeid, phone.trim(), customerId)
      if (phoneExists) {
        return { success: false, error: 'رقم الهاتف موجود بالفعل' }
      }
    }

    const customer = await customersDb.updateCustomer(customerId, {
      fullname: fullname.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null
    })

    revalidatePath('/admin/customers')
    return { success: true, data: customer }
  } catch (error: any) {
    console.error('updateCustomerAction error:', error)
    return { success: false, error: 'فشل تحديث العميل' }
  }
}

/**
 * Toggle customer active status
 */
export async function toggleCustomerActiveAction(customerId: string, active: boolean): Promise<ActionResult<Customer>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customer = await customersDb.toggleCustomerActive(customerId, active)

    revalidatePath('/admin/customers')
    return { success: true, data: customer }
  } catch (error: any) {
    console.error('toggleCustomerActiveAction error:', error)
    return { success: false, error: 'فشل تحديث حالة العميل' }
  }
}

/**
 * Delete customer (soft delete)
 */
export async function deleteCustomerAction(customerId: string): Promise<ActionResult> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    await customersDb.deleteCustomer(customerId)

    revalidatePath('/admin/customers')
    return { success: true, data: undefined }
  } catch (error: any) {
    console.error('deleteCustomerAction error:', error)
    return { success: false, error: 'فشل حذف العميل' }
  }
}

/**
 * Search customers
 */
export async function searchCustomersAction(query: string): Promise<ActionResult<Customer[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (!query || query.trim().length === 0) {
      return { success: true, data: [] }
    }

    const customers = await customersDb.searchCustomers(user.storeid, query.trim())
    return { success: true, data: customers }
  } catch (error: any) {
    console.error('searchCustomersAction error:', error)
    return { success: false, error: 'فشل البحث عن العملاء' }
  }
}


/**
 * Get top customers for current store
 */
export async function getTopCustomersAction(limit: number = 10): Promise<ActionResult<customersDb.TopCustomer[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customers = await customersDb.getTopCustomers(user.storeid, limit)
    return { success: true, data: customers }
  } catch (error: any) {
    console.error('getTopCustomersAction error:', error)
    return { success: false, error: 'فشل تحميل أفضل العملاء' }
  }
}

/**
 * Get all customer debts
 */
export async function getCustomerDebtsAction(): Promise<ActionResult<customersDb.CustomerDebt[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const debts = await customersDb.getCustomerDebts(user.storeid)
    return { success: true, data: debts }
  } catch (error: any) {
    console.error('getCustomerDebtsAction error:', error)
    return { success: false, error: 'فشل تحميل ديون العملاء' }
  }
}

/**
 * Get customer debts above a threshold
 */
export async function getCustomerDebtsByThresholdAction(minDebt: number): Promise<ActionResult<customersDb.CustomerDebt[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (minDebt < 0) {
      return { success: false, error: 'المبلغ يجب أن يكون موجب' }
    }

    const debts = await customersDb.getCustomerDebtsByThreshold(user.storeid, minDebt)
    return { success: true, data: debts }
  } catch (error: any) {
    console.error('getCustomerDebtsByThresholdAction error:', error)
    return { success: false, error: 'فشل تحميل الديون' }
  }
}

/**
 * Get high-risk customers (with high outstanding balance ratio)
 */
export async function getHighRiskCustomersAction(riskThreshold: number = 0.5): Promise<ActionResult<customersDb.TopCustomer[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    if (riskThreshold < 0 || riskThreshold > 1) {
      return { success: false, error: 'نسبة المخاطرة يجب أن تكون بين 0 و 1' }
    }

    const customers = await customersDb.getHighRiskCustomers(user.storeid, riskThreshold)
    return { success: true, data: customers }
  } catch (error: any) {
    console.error('getHighRiskCustomersAction error:', error)
    return { success: false, error: 'فشل تحميل العملاء عالي المخاطرة' }
  }
}

/**
 * Get all customers with analytics (combined data)
 */
export async function getAllCustomersWithAnalyticsAction(): Promise<ActionResult<any[]>> {
  try {
    const user = await authDb.getCurrentUser()
    if (!user?.storeid) {
      return { success: false, error: 'لا يوجد متجر مرتبط بحسابك' }
    }

    const customers = await customersDb.getAllCustomersWithAnalytics(user.storeid)
    return { success: true, data: customers }
  } catch (error: any) {
    console.error('getAllCustomersWithAnalyticsAction error:', error)
    return { success: false, error: 'فشل تحميل تحليل العملاء' }
  }
}