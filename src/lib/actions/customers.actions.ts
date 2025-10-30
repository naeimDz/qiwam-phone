// ============================================
// ✅ lib/actions/customers.actions.ts
// ============================================
'use server'
import * as customersDb from '@/lib/supabase/db/customers'
import { customerService } from '@/lib/services/customerService'
import { Customer } from '@/lib/types'
import { executeAction } from '../supabase/actionWrapper';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// ===== Read Actions =====

export async function getCustomersAction(
  activeOnly: boolean = false
): Promise<ActionResult<Customer[]>> {
  return executeAction(
    'getCustomers',
    (ctx) => customerService.getAll(ctx.storeId, activeOnly)
  )
}

export async function getTopCustomersAction(
  limit: number = 10
): Promise<ActionResult<customersDb.TopCustomer[]>> {
  return executeAction(
    'getTopCustomers',
    (ctx) => customerService.getTopCustomers(ctx.storeId, limit)
  )
}

export async function getCustomerDebtsAction(): Promise<ActionResult<customersDb.CustomerDebt[]>> {
  return executeAction(
    'getCustomerDebts',
    (ctx) => customerService.getDebts(ctx.storeId)
  )
}

export async function getCustomerDebtsByThresholdAction(
  minDebt: number
): Promise<ActionResult<customersDb.CustomerDebt[]>> {
  return executeAction(
    'getCustomerDebtsByThreshold',
    (ctx) => customerService.getDebtsByThreshold(ctx.storeId, minDebt)
  )
}

export async function getHighRiskCustomersAction(
  riskThreshold: number = 0.5
): Promise<ActionResult<customersDb.TopCustomer[]>> {
  return executeAction(
    'getHighRiskCustomers',
    (ctx) => customerService.getHighRisk(ctx.storeId, riskThreshold)
  )
}

export async function getAllCustomersWithAnalyticsAction(): Promise<ActionResult<any[]>> {
  return executeAction(
    'getAllCustomersWithAnalytics',
    (ctx) => customerService.getAllWithAnalytics(ctx.storeId)
  )
}

export async function searchCustomersAction(
  query: string
): Promise<ActionResult<Customer[]>> {
  return executeAction(
    'searchCustomers',
    (ctx) => customerService.search(ctx.storeId, query)
  )
}

// ===== Write Actions (CRUD) =====

export async function createCustomerAction(
  formData: FormData
): Promise<ActionResult<Customer>> {
  return executeAction(
    'createCustomer',
    (ctx) => customerService.create(ctx.storeId, formData),
    { revalidatePaths: ['/admin/customers'] }
  )
}

export async function updateCustomerAction(
  customerId: string,
  formData: FormData
): Promise<ActionResult<Customer>> {
  return executeAction(
    'updateCustomer',
    (ctx) => customerService.update(ctx.storeId, customerId, formData),
    { revalidatePaths: ['/admin/customers'] }
  )
}

export async function deleteCustomerAction(
  customerId: string
): Promise<ActionResult> {
  return executeAction(
    'deleteCustomer',
    (ctx) => customerService.delete(ctx.storeId, customerId),
    { revalidatePaths: ['/admin/customers'] }
  )
}

export async function toggleCustomerActiveAction(
  customerId: string,
  active: boolean
): Promise<ActionResult<Customer>> {
  return executeAction(
    'toggleCustomerActive',
    (ctx) => customerService.toggleActive(ctx.storeId, customerId, active),
    { revalidatePaths: ['/admin/customers'] }
  )
}